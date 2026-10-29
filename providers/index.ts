import type { GroupTrip } from "@/types";
import type { GroupPlanningInputs, ProviderMode, ProviderSet } from "@/providers/contracts";
import { demoRoutePlanningProvider } from "@/providers/demo/route-provider";
import { demoChargingStationProvider } from "@/providers/demo/station-provider";
import { demoVehicleSpecificationProvider } from "@/providers/demo/vehicle-provider";
import { demoEnergyCalculationProvider } from "@/providers/demo/energy-provider";

export const demoProviderSet: ProviderSet = {
  mode: "demo",
  routePlanning: demoRoutePlanningProvider,
  chargingStations: demoChargingStationProvider,
  vehicleSpecifications: demoVehicleSpecificationProvider,
  energyCalculations: demoEnergyCalculationProvider,
};

const providerRegistry = new Map<ProviderMode, ProviderSet>([["demo", demoProviderSet]]);

export function registerProviderSet(providerSet: ProviderSet) {
  providerRegistry.set(providerSet.mode, providerSet);
}

export function getProviderSet(mode: ProviderMode = "demo") {
  const providerSet = providerRegistry.get(mode);
  if (!providerSet) throw new Error(`No ${mode} provider set has been registered.`);
  return providerSet;
}

export async function createPlanningInputs(trip: GroupTrip, providerSet: ProviderSet = getProviderSet()): Promise<GroupPlanningInputs> {
  const route = await providerSet.routePlanning.planRoute({
    originLabel: trip.startingLocation,
    destinationLabel: trip.destination,
    distanceHintMiles: trip.totalDistanceMiles,
  });
  const stations = await providerSet.chargingStations.findStations({ route, vehicles: trip.vehicles });
  return { route, stations, energyCalculations: providerSet.energyCalculations };
}

export function createDemoPlanningInputs(trip: GroupTrip): GroupPlanningInputs {
  const route = demoRoutePlanningProvider.planRoute({
    originLabel: trip.startingLocation,
    destinationLabel: trip.destination,
    distanceHintMiles: trip.totalDistanceMiles,
  });
  const stations = demoChargingStationProvider.findStations({ route, vehicles: trip.vehicles });
  return { route, stations, energyCalculations: demoEnergyCalculationProvider };
}

export type { GroupPlanningInputs, ProviderMode, ProviderSet } from "@/providers/contracts";
