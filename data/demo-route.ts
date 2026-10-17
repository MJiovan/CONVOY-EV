import type { ChargingStation, ConnectorType, GroupTrip } from "@/types";

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
  return {
    id: "demo-convoy",
    name: "Desert Weekend Convoy",
    startingLocation: "Phoenix, AZ",
    destination: "San Diego, CA",
    totalDistanceMiles: 355,
    createdAt: now,
    updatedAt: now,
    vehicles: [
      { id: "jio-model-y", nickname: "Jio", manufacturer: "Tesla", model: "Model Y", estimatedRangeMiles: 240, startingBatteryPercent: 82, maxChargingSpeedKw: 250, connectors: ["NACS"] },
      { id: "alex-ioniq-5", nickname: "Alex", manufacturer: "Hyundai", model: "Ioniq 5", estimatedRangeMiles: 210, startingBatteryPercent: 64, maxChargingSpeedKw: 235, connectors: ["CCS", "NACS"] },
      { id: "chris-mach-e", nickname: "Chris", manufacturer: "Ford", model: "Mustang Mach-E", estimatedRangeMiles: 220, startingBatteryPercent: 71, maxChargingSpeedKw: 150, connectors: ["CCS", "NACS"] },
    ],
  };
}
