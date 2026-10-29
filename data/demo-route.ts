import type { ChargingStation, ConnectorType, GroupTrip } from "@/types";
import { vehicleFromCatalog } from "@/lib/vehicle-specs";
import { demoVehicleSpecificationProvider } from "@/providers/demo/vehicle-provider";

export const connectorTypes: ConnectorType[] = ["NACS", "CCS", "CHAdeMO", "J1772"];

const stationTemplates: Array<Omit<ChargingStation, "id" | "distanceMiles"> & { ratio: number }> = [
  { ratio: 0.12, name: "Pulse North", locationLabel: "Route sector A", maxPowerKw: 250, connectors: ["NACS"], stalls: 12, isDemoData: true },
  { ratio: 0.22, name: "Crossroads Energy Hub", locationLabel: "Route sector B", maxPowerKw: 350, connectors: ["NACS", "CCS", "CHAdeMO", "J1772"], stalls: 18, isDemoData: true },
  { ratio: 0.33, name: "Vector Charge Point", locationLabel: "Route sector C", maxPowerKw: 200, connectors: ["CCS", "CHAdeMO"], stalls: 8, isDemoData: true },
  { ratio: 0.44, name: "Relay Fast Charge", locationLabel: "Route sector D", maxPowerKw: 300, connectors: ["NACS", "CCS"], stalls: 14, isDemoData: true },
  { ratio: 0.56, name: "Waypoint EV Center", locationLabel: "Route sector E", maxPowerKw: 250, connectors: ["NACS", "CCS", "CHAdeMO", "J1772"], stalls: 16, isDemoData: true },
  { ratio: 0.68, name: "Amp Ridge", locationLabel: "Route sector F", maxPowerKw: 250, connectors: ["NACS"], stalls: 10, isDemoData: true },
  { ratio: 0.78, name: "Common Ground Charging", locationLabel: "Route sector G", maxPowerKw: 350, connectors: ["NACS", "CCS", "CHAdeMO", "J1772"], stalls: 20, isDemoData: true },
  { ratio: 0.9, name: "Final Stretch Fast Charge", locationLabel: "Route sector H", maxPowerKw: 300, connectors: ["NACS", "CCS"], stalls: 12, isDemoData: true },
];

export function buildDemoStations(totalDistanceMiles: number): ChargingStation[] {
  return stationTemplates
    .map((station, index) => ({ ...station, id: `station-${index + 1}`, distanceMiles: Math.max(20, Math.round(totalDistanceMiles * station.ratio)) }))
    .filter((station, index, all) => station.distanceMiles < totalDistanceMiles - 10 && all.findIndex(item => item.distanceMiles === station.distanceMiles) === index);
}

export function createSampleTrip(): GroupTrip {
  const now = new Date().toISOString();
  const jio = demoVehicleSpecificationProvider.getVehicle("2022-tesla-model-y-performance")!;
  const alex = demoVehicleSpecificationProvider.getVehicle("2024-hyundai-ioniq5-limited-awd")!;
  const chris = demoVehicleSpecificationProvider.getVehicle("2023-ford-mach-e-premium-awd")!;
  return {
    id: "demo-convoy",
    name: "Desert Weekend Convoy",
    startingLocation: "Phoenix, AZ",
    destination: "San Diego, CA",
    totalDistanceMiles: 355,
    createdAt: now,
    updatedAt: now,
    vehicles: [
      vehicleFromCatalog(jio, { id: "jio-model-y", nickname: "Jio", startingBatteryPercent: 82 }),
      vehicleFromCatalog(alex, { id: "alex-ioniq-5", nickname: "Alex", startingBatteryPercent: 64 }),
      vehicleFromCatalog(chris, { id: "chris-mach-e", nickname: "Chris", startingBatteryPercent: 71 }),
    ],
  };
}
