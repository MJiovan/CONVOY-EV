import { buildDemoStations } from "@/data/demo-route";
import type { ChargingStation, CompatibilityWarning, ConnectorType, EVVehicle, GroupChargingPlan, GroupChargingStop, GroupTrip, VehicleStopPlan } from "@/types";

const RESERVE_PERCENT = 12;
const ROUTE_SPEED_MPH = 62;
const MAX_STOPS = 8;

type VehicleState = { vehicle: EVVehicle; batteryPercent: number };

export function calculateGroupPlan(trip: GroupTrip): GroupChargingPlan {
  const stations = buildDemoStations(trip.totalDistanceMiles);
  const states: VehicleState[] = trip.vehicles.map(vehicle => ({ vehicle, batteryPercent: clamp(vehicle.startingBatteryPercent, 0, 100) }));
  const initialConstraint = findConstraint(states);
  const stops: GroupChargingStop[] = [];
  const warnings = buildCompatibilityWarnings(stations, trip.vehicles);
  let currentDistance = 0;
  let routeBlocked = false;

  if (states.some(state => state.batteryPercent <= RESERVE_PERCENT + 5)) {
    const originStation: ChargingStation = {
      id: "origin-precharge",
      name: "Pre-departure charging required",
      locationLabel: trip.startingLocation,
      distanceMiles: 0,
      maxPowerKw: 250,
      connectors: ["NACS", "CCS", "CHAdeMO", "J1772"],
      stalls: trip.vehicles.length,
      isDemoData: true,
    };
    const vehiclePlans = states.map(state => createVehicleStopPlan(state, originStation, 0, Math.max(65, state.batteryPercent)));
    applyDepartures(states, vehiclePlans);
    const constrained = longestCharge(vehiclePlans);
    stops.push({ station: originStation, vehiclePlans, groupStopMinutes: constrained.estimatedChargingMinutes, compatibleWithAllVehicles: true, constrainedVehicleId: constrained.vehicleId, reason: `${constrained.nickname}'s starting battery is too close to the ${RESERVE_PERCENT}% planning reserve, so the group should charge before departure.` });
  }

  while (currentDistance < trip.totalDistanceMiles && stops.length < MAX_STOPS) {
    const remaining = trip.totalDistanceMiles - currentDistance;
    const constraint = findConstraint(states);
    if (remaining <= constraint.safeMiles) break;

    const reachableLimit = currentDistance + Math.max(0, constraint.safeMiles * 0.92);
    const reachable = stations.filter(station => station.distanceMiles > currentDistance + 8 && station.distanceMiles <= reachableLimit);
    const compatible = reachable.filter(station => isStationCompatibleWithGroup(station, trip.vehicles));
    const station = compatible.at(-1) ?? reachable.at(-1);
    if (!station) {
      routeBlocked = true;
      warnings.unshift({ stationName: "No reachable shared station", distanceMiles: Math.round(reachableLimit), missingConnectors: [], message: `${constraint.state.vehicle.nickname} cannot reach the next mock station while keeping the ${RESERVE_PERCENT}% reserve. Increase departure charge, add range, or use real route data.` });
      break;
    }

    const segmentMiles = station.distanceMiles - currentDistance;
    states.forEach(state => { state.batteryPercent = state.batteryPercent - milesToPercent(segmentMiles, state.vehicle); });
    const nextLegEstimate = estimateNextLeg(station.distanceMiles, trip.totalDistanceMiles, stations, trip.vehicles);
    const vehiclePlans = states.map(state => {
      const requiredDeparture = clamp(RESERVE_PERCENT + milesToPercent(nextLegEstimate, state.vehicle) + 10, 62, 90);
      return createVehicleStopPlan(state, station, segmentMiles, Math.max(state.batteryPercent, requiredDeparture));
    });
    const allCompatible = vehiclePlans.every(plan => plan.connectorCompatible);
    if (!allCompatible) routeBlocked = true;
    applyDepartures(states, vehiclePlans);
    const constrained = longestCharge(vehiclePlans);
    const arrivalConstraint = [...vehiclePlans].sort((a, b) => a.arrivalBatteryPercent - b.arrivalBatteryPercent)[0];
    stops.push({
      station,
      vehiclePlans,
      groupStopMinutes: constrained.estimatedChargingMinutes,
      compatibleWithAllVehicles: allCompatible,
      constrainedVehicleId: constrained.vehicleId,
      reason: `${arrivalConstraint.nickname} reaches this point with the group's lowest projected battery. ${constrained.nickname} sets the stop duration at ${constrained.estimatedChargingMinutes} minutes.`,
    });
    currentDistance = station.distanceMiles;
    if (routeBlocked) break;
  }

  if (stops.length >= MAX_STOPS && currentDistance < trip.totalDistanceMiles) routeBlocked = true;
  const totalChargingMinutes = stops.reduce((sum, stop) => sum + stop.groupStopMinutes, 0);
  const estimatedDrivingMinutes = Math.round((trip.totalDistanceMiles / ROUTE_SPEED_MPH) * 60);
  const groupStatus = routeBlocked ? "Route blocked" : warnings.length > 0 ? "Review needed" : "Ready";
  const constrainedVehicleName = initialConstraint.state.vehicle.nickname;
  const summary = routeBlocked
    ? "The mock station set cannot produce a fully compatible, safely reachable route for every EV."
    : `${constrainedVehicleName} has the shortest starting buffer and influences the first shared stop. The group waits for the longest charging vehicle at each stop.`;

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

export function isStationCompatibleWithGroup(station: ChargingStation, vehicles: EVVehicle[]) {
  return vehicles.every(vehicle => vehicle.connectors.some(connector => station.connectors.includes(connector)));
}

function buildCompatibilityWarnings(stations: ChargingStation[], vehicles: EVVehicle[]): CompatibilityWarning[] {
  return stations.filter(station => !isStationCompatibleWithGroup(station, vehicles)).map(station => {
    const incompatibleVehicles = vehicles.filter(vehicle => !vehicle.connectors.some(connector => station.connectors.includes(connector)));
    const missingConnectors = [...new Set(incompatibleVehicles.flatMap(vehicle => vehicle.connectors))];
    return {
      stationName: station.name,
      distanceMiles: station.distanceMiles,
      missingConnectors,
      message: `${station.name} is not a good group stop because it does not support ${incompatibleVehicles.map(vehicle => vehicle.nickname).join(", ")}.`,
    };
  });
}

function findConstraint(states: VehicleState[]) {
  return states.map(state => ({ state, safeMiles: state.vehicle.estimatedRangeMiles * Math.max(0, state.batteryPercent - RESERVE_PERCENT) / 100 })).sort((a, b) => a.safeMiles - b.safeMiles)[0];
}

function estimateNextLeg(currentDistance: number, totalDistance: number, stations: ChargingStation[], vehicles: EVVehicle[]) {
  const nextCompatible = stations.find(station => station.distanceMiles > currentDistance + 8 && isStationCompatibleWithGroup(station, vehicles));
  return Math.min(totalDistance - currentDistance, nextCompatible ? nextCompatible.distanceMiles - currentDistance : totalDistance - currentDistance);
}

function createVehicleStopPlan(state: VehicleState, station: ChargingStation, _segmentMiles: number, departureBatteryPercent: number): VehicleStopPlan {
  const connectorCompatible = state.vehicle.connectors.some(connector => station.connectors.includes(connector));
  const arrivalBatteryPercent = clamp(state.batteryPercent, 0, 100);
  const target = clamp(departureBatteryPercent, arrivalBatteryPercent, 95);
  const energyNeededKwh = estimatedBatteryCapacity(state.vehicle) * ((target - arrivalBatteryPercent) / 100);
  const effectivePower = connectorCompatible ? Math.min(state.vehicle.maxChargingSpeedKw, station.maxPowerKw, connectorPowerCap(state.vehicle.connectors, station.connectors)) * 0.72 : 0;
  const estimatedChargingMinutes = effectivePower > 0 ? Math.ceil((energyNeededKwh / effectivePower) * 60) : 0;
  return {
    vehicleId: state.vehicle.id,
    nickname: state.vehicle.nickname,
    vehicleLabel: `${state.vehicle.manufacturer} ${state.vehicle.model}`,
    arrivalBatteryPercent: Math.round(arrivalBatteryPercent),
    departureBatteryPercent: Math.round(target),
    estimatedChargingMinutes,
    connectorCompatible,
  };
}

function applyDepartures(states: VehicleState[], plans: VehicleStopPlan[]) {
  states.forEach(state => {
    const plan = plans.find(item => item.vehicleId === state.vehicle.id);
    if (plan?.connectorCompatible) state.batteryPercent = plan.departureBatteryPercent;
  });
}

function longestCharge(plans: VehicleStopPlan[]) {
  return [...plans].sort((a, b) => b.estimatedChargingMinutes - a.estimatedChargingMinutes)[0];
}

function estimatedBatteryCapacity(vehicle: EVVehicle) {
  return clamp(vehicle.estimatedRangeMiles / 3.2, 45, 125);
}

function connectorPowerCap(vehicleConnectors: ConnectorType[], stationConnectors: ConnectorType[]) {
  const shared = vehicleConnectors.filter(connector => stationConnectors.includes(connector));
  return Math.max(...shared.map(connector => connector === "J1772" ? 19 : connector === "CHAdeMO" ? 100 : 400), 0);
}

function milesToPercent(miles: number, vehicle: EVVehicle) {
  return (miles / Math.max(1, vehicle.estimatedRangeMiles)) * 100;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return hours ? `${hours}h ${remainder}m` : `${remainder} min`;
}
