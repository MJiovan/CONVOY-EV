import { buildDemoStations } from "@/data/demo-route";
import { effectiveVehicleSpecs, vehicleDisplayName } from "@/lib/vehicle-specs";
import type { ChargingStation, CompatibilityWarning, ConnectorType, EVVehicle, GroupChargingPlan, GroupChargingStop, GroupTrip, VehicleStopPlan } from "@/types";

export const PLANNER_CONFIG = {
  reservePercent: 12,
  planningBufferPercent: 1,
  chargingTaperFactor: 0.72,
  routeSpeedMph: 62,
  maxStops: 8,
  minimumStationGapMiles: 8,
} as const;

type VehicleState = { vehicle: EVVehicle; batteryPercent: number };
type RouteSelection = { stations: ChargingStation[]; originChargeRequired: boolean; blockedWarning?: CompatibilityWarning };

export function calculateGroupPlan(trip: GroupTrip): GroupChargingPlan {
  const stations = buildDemoStations(trip.totalDistanceMiles);
  const states: VehicleState[] = trip.vehicles.map(vehicle => ({ vehicle, batteryPercent: clamp(vehicle.startingBatteryPercent, 0, 100) }));
  const initialConstraint = findConstraint(states);
  const warnings = buildCompatibilityWarnings(stations, trip.vehicles);
  const route = selectSharedStations(trip, stations, states);
  if (route.blockedWarning) warnings.unshift(route.blockedWarning);

  const selectedStops = route.originChargeRequired ? [originStation(trip), ...route.stations] : route.stations;
  const stops: GroupChargingStop[] = [];
  let previousDistance = 0;
  let routeBlocked = Boolean(route.blockedWarning);

  selectedStops.forEach((station, index) => {
    const inboundLegMiles = station.distanceMiles - previousDistance;
    if (inboundLegMiles > 0) states.forEach(state => { state.batteryPercent -= milesToPercent(inboundLegMiles, state.vehicle); });

    const nextStation = selectedStops[index + 1];
    const nextPointDistance = nextStation?.distanceMiles ?? trip.totalDistanceMiles;
    const nextPointLabel = nextStation?.name ?? trip.destination;
    const nextLegMiles = Math.max(0, nextPointDistance - station.distanceMiles);
    const vehiclePlans = states.map(state => createVehicleStopPlan(state, station, nextLegMiles));
    const allCompatible = vehiclePlans.every(plan => plan.connectorCompatible);
    const allFeasible = vehiclePlans.every(plan => plan.feasible);
    if (!allCompatible || !allFeasible) routeBlocked = true;

    const longest = longestCharge(vehiclePlans);
    stops.push({
      station,
      vehiclePlans,
      groupStopMinutes: longest.estimatedChargingMinutes,
      compatibleWithAllVehicles: allCompatible,
      constrainedVehicleId: longest.vehicleId,
      nextPointLabel,
      nextLegMiles,
      reason: buildStopReason(vehiclePlans, longest),
    });
    applyDepartures(states, vehiclePlans);
    previousDistance = station.distanceMiles;
  });

  const totalChargingMinutes = stops.reduce((sum, stop) => sum + stop.groupStopMinutes, 0);
  const estimatedDrivingMinutes = Math.round((trip.totalDistanceMiles / PLANNER_CONFIG.routeSpeedMph) * 60);
  const groupStatus = routeBlocked ? "Route blocked" : warnings.length > 0 ? "Review needed" : "Ready";
  const constrainedVehicleName = initialConstraint.state.vehicle.nickname;
  const summary = routeBlocked
    ? "The mock station set cannot produce a compatible route where every EV can complete each leg with the planning reserve."
    : `${constrainedVehicleName} has the shortest starting buffer and influences the first shared stop. Each EV then charges only for its own next-leg requirement.`;

  return {
    stops,
    compatibilityWarnings: warnings.slice(0, 5),
    totalChargingMinutes,
    estimatedDrivingMinutes,
    estimatedTripMinutes: estimatedDrivingMinutes + totalChargingMinutes,
    constrainedVehicleId: initialConstraint.state.vehicle.id,
    constrainedVehicleName,
    groupStatus,
    summary,
  };
}

export function recommendedDepartureSoc(nextLegMiles: number, planningRangeMiles: number) {
  return Math.ceil((nextLegMiles / Math.max(1, planningRangeMiles)) * 100 + PLANNER_CONFIG.reservePercent + PLANNER_CONFIG.planningBufferPercent);
}

export function isStationCompatibleWithGroup(station: ChargingStation, vehicles: EVVehicle[]) {
  return vehicles.every(vehicle => effectiveVehicleSpecs(vehicle).connectors.some(connector => station.connectors.includes(connector)));
}

function selectSharedStations(trip: GroupTrip, stations: ChargingStation[], states: VehicleState[]): RouteSelection {
  const compatibleStations = stations.filter(station => isStationCompatibleWithGroup(station, trip.vehicles));
  const nearestCompatible = compatibleStations[0];
  const destinationReachableNow = canEveryVehicleTravel(states, trip.totalDistanceMiles);
  const stationReachableNow = nearestCompatible ? canEveryVehicleTravel(states, nearestCompatible.distanceMiles) : false;
  const originChargeRequired = !destinationReachableNow && (!stationReachableNow || states.some(state => state.batteryPercent <= PLANNER_CONFIG.reservePercent + 5));
  const maximumLegMiles = maxFeasibleGroupLeg(trip.vehicles);
  const selected: ChargingStation[] = [];
  let currentDistance = 0;
  let currentLimit = originChargeRequired ? maximumLegMiles : currentSafeGroupMiles(states);

  while (trip.totalDistanceMiles - currentDistance > currentLimit && selected.length < PLANNER_CONFIG.maxStops) {
    const candidates = compatibleStations
      .filter(station => station.distanceMiles > currentDistance + PLANNER_CONFIG.minimumStationGapMiles && station.distanceMiles - currentDistance <= currentLimit)
      .filter(station => hasFeasibleForwardPoint(station.distanceMiles, trip.totalDistanceMiles, compatibleStations, maximumLegMiles))
      .sort((a, b) => b.distanceMiles - a.distanceMiles);
    const station = candidates[0];
    if (!station) {
      const constraint = findConstraint(states);
      return {
        stations: selected,
        originChargeRequired,
        blockedWarning: {
          stationName: "No feasible shared next leg",
          distanceMiles: Math.round(currentDistance + currentLimit),
          missingConnectors: [],
          message: `${constraint.state.vehicle.nickname} cannot reach a compatible next point while preserving the ${PLANNER_CONFIG.reservePercent}% reserve and ${PLANNER_CONFIG.planningBufferPercent}% planning buffer. The planner did not cap the required charge at 100%.`,
        },
      };
    }
    selected.push(station);
    currentDistance = station.distanceMiles;
    currentLimit = maximumLegMiles;
  }

  if (trip.totalDistanceMiles - currentDistance > currentLimit) {
    return {
      stations: selected,
      originChargeRequired,
      blockedWarning: {
        stationName: "Shared route exceeds stop limit",
        distanceMiles: currentDistance,
        missingConnectors: [],
        message: "The demonstration route needs more shared stops than the planner allows, so it is marked infeasible.",
      },
    };
  }
  return { stations: selected, originChargeRequired };
}

function createVehicleStopPlan(state: VehicleState, station: ChargingStation, nextLegMiles: number): VehicleStopPlan {
  const specs = effectiveVehicleSpecs(state.vehicle);
  const connectorCompatible = specs.connectors.some(connector => station.connectors.includes(connector));
  const arrivalBatteryPercent = clamp(state.batteryPercent, 0, 100);
  const requiredDeparture = recommendedDepartureSoc(nextLegMiles, specs.estimatedRangeMiles);
  const feasible = requiredDeparture <= 100;
  const chargeNeeded = connectorCompatible && feasible && arrivalBatteryPercent < requiredDeparture;
  const chargePercent = chargeNeeded ? requiredDeparture - arrivalBatteryPercent : 0;
  const energyNeededKwh = specs.batteryCapacityKwh * (chargePercent / 100);
  const effectivePower = connectorCompatible ? Math.min(specs.maxChargingSpeedKw, station.maxPowerKw, connectorPowerCap(specs.connectors, station.connectors)) * PLANNER_CONFIG.chargingTaperFactor : 0;
  const estimatedChargingMinutes = chargeNeeded && effectivePower > 0 ? Math.ceil((energyNeededKwh / effectivePower) * 60) : 0;
  return {
    vehicleId: state.vehicle.id,
    nickname: state.vehicle.nickname,
    vehicleLabel: vehicleDisplayName(state.vehicle),
    arrivalBatteryPercent: Math.round(arrivalBatteryPercent),
    departureBatteryPercent: requiredDeparture,
    estimatedChargingMinutes,
    connectorCompatible,
    chargeNeeded,
    feasible,
  };
}

function applyDepartures(states: VehicleState[], plans: VehicleStopPlan[]) {
  states.forEach(state => {
    const plan = plans.find(item => item.vehicleId === state.vehicle.id);
    if (plan?.connectorCompatible && plan.feasible) state.batteryPercent = Math.max(state.batteryPercent, plan.departureBatteryPercent);
  });
}

function buildStopReason(plans: VehicleStopPlan[], longest: VehicleStopPlan) {
  const noCharge = plans.filter(plan => !plan.chargeNeeded && plan.feasible).map(plan => plan.nickname);
  const noChargeMessage = noCharge.length === 0 ? "" : noCharge.length === plans.length
    ? "Every EV already has enough charge for the next leg. "
    : `${formatNames(noCharge)} ${noCharge.length === 1 ? "already has" : "already have"} enough charge for the next leg. `;
  if (longest.estimatedChargingMinutes === 0) return `${noChargeMessage}The group can continue without a charging delay.`;
  return `${noChargeMessage}${longest.nickname} requires the longest charging session and sets the group stop duration at ${longest.estimatedChargingMinutes} minutes.`;
}

function originStation(trip: GroupTrip): ChargingStation {
  return { id: "origin-precharge", name: "Pre-departure charging required", locationLabel: trip.startingLocation, distanceMiles: 0, maxPowerKw: 250, connectors: ["NACS", "CCS", "CHAdeMO", "J1772"], stalls: trip.vehicles.length, isDemoData: true };
}

function buildCompatibilityWarnings(stations: ChargingStation[], vehicles: EVVehicle[]): CompatibilityWarning[] {
  return stations.filter(station => !isStationCompatibleWithGroup(station, vehicles)).map(station => {
    const incompatibleVehicles = vehicles.filter(vehicle => !effectiveVehicleSpecs(vehicle).connectors.some(connector => station.connectors.includes(connector)));
    return {
      stationName: station.name,
      distanceMiles: station.distanceMiles,
      missingConnectors: [...new Set(incompatibleVehicles.flatMap(vehicle => effectiveVehicleSpecs(vehicle).connectors))],
      message: `${station.name} is not a good group stop because it does not support ${incompatibleVehicles.map(vehicle => vehicle.nickname).join(", ")}.`,
    };
  });
}

function findConstraint(states: VehicleState[]) {
  return states.map(state => ({ state, safeMiles: safeMilesAtSoc(state.vehicle, state.batteryPercent) })).sort((a, b) => a.safeMiles - b.safeMiles)[0];
}

function currentSafeGroupMiles(states: VehicleState[]) {
  return Math.min(...states.map(state => safeMilesAtSoc(state.vehicle, state.batteryPercent)));
}

function safeMilesAtSoc(vehicle: EVVehicle, soc: number) {
  const range = effectiveVehicleSpecs(vehicle).estimatedRangeMiles;
  return range * Math.max(0, soc - PLANNER_CONFIG.reservePercent - PLANNER_CONFIG.planningBufferPercent) / 100;
}

function maxFeasibleGroupLeg(vehicles: EVVehicle[]) {
  return Math.min(...vehicles.map(vehicle => effectiveVehicleSpecs(vehicle).estimatedRangeMiles * (100 - PLANNER_CONFIG.reservePercent - PLANNER_CONFIG.planningBufferPercent) / 100));
}

function canEveryVehicleTravel(states: VehicleState[], miles: number) {
  return states.every(state => safeMilesAtSoc(state.vehicle, state.batteryPercent) >= miles);
}

function hasFeasibleForwardPoint(currentDistance: number, totalDistance: number, stations: ChargingStation[], maximumLegMiles: number) {
  if (totalDistance - currentDistance <= maximumLegMiles) return true;
  return stations.some(station => station.distanceMiles > currentDistance + PLANNER_CONFIG.minimumStationGapMiles && station.distanceMiles - currentDistance <= maximumLegMiles);
}

function longestCharge(plans: VehicleStopPlan[]) {
  return [...plans].sort((a, b) => b.estimatedChargingMinutes - a.estimatedChargingMinutes)[0];
}

function connectorPowerCap(vehicleConnectors: ConnectorType[], stationConnectors: ConnectorType[]) {
  const shared = vehicleConnectors.filter(connector => stationConnectors.includes(connector));
  return Math.max(...shared.map(connector => connector === "J1772" ? 19 : connector === "CHAdeMO" ? 100 : 400), 0);
}

function milesToPercent(miles: number, vehicle: EVVehicle) {
  return (miles / Math.max(1, effectiveVehicleSpecs(vehicle).estimatedRangeMiles)) * 100;
}

function formatNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return hours ? `${hours}h ${remainder}m` : `${remainder} min`;
}
