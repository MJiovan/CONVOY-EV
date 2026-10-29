import assert from "node:assert/strict";
import { createSampleTrip } from "../data/demo-route";
import { calculateGroupPlan, recommendedDepartureSoc } from "../lib/group-planner";
import { effectiveVehicleSpecs } from "../lib/vehicle-specs";
import { createDemoPlanningInputs, getProviderSet } from "../providers";
import type { GroupTrip } from "../types";

const sample = createSampleTrip();
const plan = calculateGroupPlan(sample, createDemoPlanningInputs(sample));
assert.equal(plan.stops.length, 2, "sample route should preserve its two shared stops");
assert.equal(plan.totalChargingMinutes, 34, "sample route should preserve its 34-minute group charging total");
assert.equal(plan.constrainedVehicleName, "Alex", "sample route should preserve Alex as its initial constraint");
assert.deepEqual(plan.stops.map(stop => stop.station.name), ["Crossroads Energy Hub", "Common Ground Charging"], "provider refactor should preserve the selected demo stations");

const firstStop = plan.stops[0];
assert.ok(new Set(firstStop.vehiclePlans.map(vehicle => vehicle.departureBatteryPercent)).size > 1, "different ranges should produce different departure SOC values");

const noChargeTrip = cloneTrip(sample);
noChargeTrip.vehicles[0] = { ...noChargeTrip.vehicles[0], startingBatteryPercent: 100, estimatedRangeMiles: 600, planningOverrides: { ...noChargeTrip.vehicles[0].planningOverrides, estimatedRangeMiles: 600 } };
const noChargeResult = calculateGroupPlan(noChargeTrip, createDemoPlanningInputs(noChargeTrip));
const noChargePlan = noChargeResult.stops.flatMap(stop => stop.vehiclePlans).find(vehicle => vehicle.vehicleId === noChargeTrip.vehicles[0].id && vehicle.estimatedChargingMinutes === 0);
assert.ok(noChargePlan && !noChargePlan.chargeNeeded, "an EV with enough battery should receive zero charging minutes");

for (const stop of plan.stops) {
  assert.equal(stop.groupStopMinutes, Math.max(...stop.vehiclePlans.map(vehicle => vehicle.estimatedChargingMinutes)), "group stop time should equal the longest vehicle session");
}

const lowBatteryTrip = cloneTrip(sample);
lowBatteryTrip.vehicles[0].startingBatteryPercent = 10;
const lowBatteryPlan = calculateGroupPlan(lowBatteryTrip, createDemoPlanningInputs(lowBatteryTrip));
assert.equal(lowBatteryPlan.stops[0].station.distanceMiles, 0, "a low actual battery should add a pre-departure stop");
assert.ok(lowBatteryPlan.totalChargingMinutes > plan.totalChargingMinutes, "lower actual battery should increase charging time");

const baselineSoc = recommendedDepartureSoc(100, 303);
const overriddenSoc = recommendedDepartureSoc(100, 200);
assert.ok(overriddenSoc > baselineSoc, "a lower planning-range override should increase required departure SOC");

const infeasibleTrip = cloneTrip(sample);
infeasibleTrip.vehicles = infeasibleTrip.vehicles.map(vehicle => ({ ...vehicle, estimatedRangeMiles: 40, planningOverrides: { ...vehicle.planningOverrides, estimatedRangeMiles: 40 } }));
const infeasiblePlan = calculateGroupPlan(infeasibleTrip, createDemoPlanningInputs(infeasibleTrip));
assert.equal(infeasiblePlan.groupStatus, "Route blocked", "a leg requiring over 100% SOC should be infeasible");
assert.ok(infeasiblePlan.compatibilityWarnings.some(warning => warning.message.includes("did not cap")), "infeasible route should explain that SOC was not capped");

const finalStop = plan.stops.at(-1)!;
assert.equal(finalStop.nextPointLabel, sample.destination, "the final stop should point to the destination");
assert.equal(finalStop.nextLegMiles, sample.totalDistanceMiles - finalStop.station.distanceMiles, "the final next leg should use destination distance");
for (const vehiclePlan of finalStop.vehiclePlans) {
  const vehicle = sample.vehicles.find(item => item.id === vehiclePlan.vehicleId)!;
  assert.equal(vehiclePlan.departureBatteryPercent, recommendedDepartureSoc(finalStop.nextLegMiles, effectiveVehicleSpecs(vehicle).estimatedRangeMiles), "final departure SOC should use only the destination leg");
}

const injectedInputs = createDemoPlanningInputs(sample);
const injectedDrivingMinutes = 999;
const injectedPlan = calculateGroupPlan(sample, {
  ...injectedInputs,
  route: { ...injectedInputs.route, estimatedDrivingMinutes: injectedDrivingMinutes },
});
assert.equal(injectedPlan.estimatedDrivingMinutes, injectedDrivingMinutes, "planner should use injected route timing instead of generating it internally");
assert.equal(getProviderSet("demo").mode, "demo", "demo providers should be available through the provider registry");

console.log(`Verified ${plan.stops.length} shared stops, injected planning inputs, and all enhanced-planner scenarios.`);

function cloneTrip(trip: GroupTrip): GroupTrip {
  return JSON.parse(JSON.stringify(trip)) as GroupTrip;
}
