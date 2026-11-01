import assert from "node:assert/strict";
import { createSampleTrip } from "../data/demo-route";
import { calculateGroupPlan } from "../lib/group-planner";
import { validateRouteRequest, RouteValidationError } from "../lib/route-validation";
import { effectiveVehicleSpecs } from "../lib/vehicle-specs";
import { createDemoPlanningInputs } from "../providers";
import { demoEnergyCalculationProvider } from "../providers/demo/energy-provider";
import { OpenRouteServiceRouteProvider, RoutePlanningError } from "../providers/live/openrouteservice-provider";
import type { ChargingStation, GroupTrip } from "../types";

const sample = createSampleTrip();

// 9. A battery percentage above 100% must be treated as 100% by the planner.
const overcharged = structuredClone(sample);
overcharged.vehicles[0].startingBatteryPercent = 150;
const atMaximum = structuredClone(sample);
atMaximum.vehicles[0].startingBatteryPercent = 100;
const overchargedPlan = calculateGroupPlan(overcharged, createDemoPlanningInputs(overcharged));
const maximumPlan = calculateGroupPlan(atMaximum, createDemoPlanningInputs(atMaximum));
assert.equal(overchargedPlan.totalChargingMinutes, maximumPlan.totalChargingMinutes, "battery values above 100% should be clamped to 100%");

// 10. Invalid negative specifications must never produce negative planning values.
const invalidSpecsVehicle = {
  ...structuredClone(sample.vehicles[0]),
  batteryCapacityKwh: -80,
  estimatedRangeMiles: -300,
  maxChargingSpeedKw: -250,
  planningOverrides: { estimatedRangeMiles: -300, maxChargingSpeedKw: -250, connectors: ["NACS" as const] },
};
const safeSpecs = effectiveVehicleSpecs(invalidSpecsVehicle);
assert.ok(safeSpecs.batteryCapacityKwh > 0 && safeSpecs.estimatedRangeMiles > 0 && safeSpecs.maxChargingSpeedKw > 0, "invalid vehicle specifications should be replaced with safe positive values");
const safeChargeMinutes = demoEnergyCalculationProvider.estimateChargingMinutes({
  vehicle: invalidSpecsVehicle,
  station: createDemoPlanningInputs(sample).stations[0],
  arrivalBatteryPercent: 10,
  departureBatteryPercent: 80,
  connectorCompatible: true,
});
assert.ok(Number.isFinite(safeChargeMinutes) && safeChargeMinutes >= 0, "invalid specifications must not produce a negative or non-finite charging time");

// 11. A route with no group-compatible stations must be blocked with a warning.
const incompatibleStations: ChargingStation[] = createDemoPlanningInputs(sample).stations.map(station => ({ ...station, connectors: ["CHAdeMO"] }));
const incompatiblePlan = calculateGroupPlan(sample, { ...createDemoPlanningInputs(sample), stations: incompatibleStations });
assert.equal(incompatiblePlan.groupStatus, "Route blocked", "a route without compatible shared stations should be blocked");
assert.ok(incompatiblePlan.compatibilityWarnings.length > 0, "the blocked route should explain station incompatibility");

// 12. A long route at 1% must require pre-departure charging and remain bounded.
const lowBatteryLongTrip = structuredClone(sample);
lowBatteryLongTrip.totalDistanceMiles = 1200;
lowBatteryLongTrip.vehicles[0].startingBatteryPercent = 1;
const lowBatteryLongPlan = calculateGroupPlan(lowBatteryLongTrip, createDemoPlanningInputs(lowBatteryLongTrip));
assert.equal(lowBatteryLongPlan.stops[0]?.station.id, "origin-precharge", "a 1% vehicle should receive a pre-departure charging stop");
assert.ok(lowBatteryLongPlan.stops.length <= 9, "the long route should respect the eight-stop limit plus pre-departure charging");

// 13. The planner must support a 20-vehicle group.
const twentyVehicleTrip: GroupTrip = {
  ...structuredClone(sample),
  vehicles: Array.from({ length: 20 }, (_, index) => ({
    ...structuredClone(sample.vehicles[index % sample.vehicles.length]),
    id: `load-test-vehicle-${index + 1}`,
    nickname: `Driver ${index + 1}`,
    startingBatteryPercent: 55 + (index % 40),
  })),
};
const twentyVehiclePlan = calculateGroupPlan(twentyVehicleTrip, createDemoPlanningInputs(twentyVehicleTrip));
assert.ok(twentyVehiclePlan.stops.every(stop => stop.vehiclePlans.length === 20), "every stop should include all 20 vehicles");

// 15. A network loss must produce a specific, recoverable routing error.
const offlineProvider = new OpenRouteServiceRouteProvider("/api/route-plan", (async () => { throw new TypeError("offline"); }) as typeof fetch);
await assert.rejects(
  () => offlineProvider.planRoute({ originLabel: "Phoenix, AZ", destinationLabel: "San Diego, CA" }),
  error => error instanceof RoutePlanningError && error.code === "ROUTING_OFFLINE" && error.message.includes("demo route"),
  "network loss should offer the demo fallback",
);

// 17 and 20. Rapid and repeated calculations must stay deterministic and immutable.
const repeatedTrip = structuredClone(twentyVehicleTrip);
const repeatedSnapshot = JSON.stringify(repeatedTrip);
const repeatedBaseline = calculateGroupPlan(repeatedTrip, createDemoPlanningInputs(repeatedTrip));
for (let index = 0; index < 500; index += 1) {
  const result = calculateGroupPlan(repeatedTrip, createDemoPlanningInputs(repeatedTrip));
  assert.equal(result.totalChargingMinutes, repeatedBaseline.totalChargingMinutes, `rapid calculation ${index + 1} should keep the same charging time`);
  assert.equal(result.groupStatus, repeatedBaseline.groupStatus, `rapid calculation ${index + 1} should keep the same status`);
}
assert.equal(JSON.stringify(repeatedTrip), repeatedSnapshot, "repeated calculations should not mutate a 20-vehicle trip");

// 18. Overly long locations must fail, while distinct special-character labels remain valid.
assert.throws(
  () => validateRouteRequest({ originLabel: "A".repeat(201), destinationLabel: "Valid destination" }),
  error => error instanceof RouteValidationError && error.code === "LOCATION_TOO_LONG",
  "locations longer than 200 characters should be rejected",
);
assert.deepEqual(
  validateRouteRequest({ originLabel: "St. John's / Route #7", destinationLabel: "Montréal, QC — Centre-Ville" }),
  { originLabel: "St. John's / Route #7", destinationLabel: "Montréal, QC — Centre-Ville" },
  "distinct locations containing punctuation and non-ASCII characters should be accepted",
);

console.log("Verified tests 9-13, 15, 17-18, and 20: bounds, invalid specs, compatibility, low battery, 20 vehicles, offline recovery, unusual locations, and 500 repeated calculations.");
