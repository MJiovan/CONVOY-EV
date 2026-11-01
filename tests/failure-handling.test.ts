import assert from "node:assert/strict";
import { createSampleTrip } from "../data/demo-route";
import { calculateGroupPlan } from "../lib/group-planner";
import { MAX_SUPPORTED_ROUTE_MILES, OpenRouteServiceApiError, planOpenRouteServiceRoute } from "../lib/openrouteservice";
import { RouteValidationError, validateRouteRequest } from "../lib/route-validation";
import { createDemoPlanningInputs } from "../providers";

assert.throws(
  () => validateRouteRequest({ originLabel: "", destinationLabel: "San Diego, CA" }),
  error => error instanceof RouteValidationError && error.code === "MISSING_LOCATION",
  "missing starting location should be rejected",
);

assert.throws(
  () => validateRouteRequest({ originLabel: "Phoenix, AZ", destinationLabel: " phoenix az " }),
  error => error instanceof RouteValidationError && error.code === "SAME_LOCATION",
  "equivalent start and destination labels should be rejected before routing",
);

let geocodeCount = 0;
const invalidDestinationFetch = (async (input: RequestInfo | URL) => {
  if (String(input).includes("/geocode/search")) {
    geocodeCount += 1;
    return Response.json(geocodeCount === 1
      ? { features: [{ geometry: { coordinates: [-112.074, 33.4484] }, properties: { label: "Phoenix, Arizona, USA" } }] }
      : { features: [] });
  }
  throw new Error("directions should not run for an invalid destination");
}) as typeof fetch;
await assert.rejects(
  () => planOpenRouteServiceRoute({ originLabel: "Phoenix, AZ", destinationLabel: "not-a-real-place-440w" }, "test-key", invalidDestinationFetch),
  error => error instanceof OpenRouteServiceApiError && error.code === "LOCATION_NOT_FOUND",
  "invalid destination should receive a clear location-not-found error",
);

const invalidKeyFetch = (async () => Response.json({ error: "Access disallowed" }, { status: 403 })) as typeof fetch;
await assert.rejects(
  () => planOpenRouteServiceRoute({ originLabel: "Phoenix, AZ", destinationLabel: "San Diego, CA" }, "invalid-key", invalidKeyFetch),
  error => error instanceof OpenRouteServiceApiError && error.code === "ROUTING_AUTH_FAILED",
  "invalid API key should be identified separately from a bad location",
);

let longTripCall = 0;
const longTripFetch = (async () => {
  longTripCall += 1;
  if (longTripCall <= 2) return Response.json({ features: [{ geometry: { coordinates: [longTripCall, longTripCall] }, properties: { label: `Point ${longTripCall}` } }] });
  return Response.json({ features: [{ geometry: { coordinates: [[1, 1], [2, 2]] }, properties: { summary: { distance: (MAX_SUPPORTED_ROUTE_MILES + 100) * 1609.344, duration: 300000 } } }] });
}) as typeof fetch;
await assert.rejects(
  () => planOpenRouteServiceRoute({ originLabel: "Point A", destinationLabel: "Point B" }, "test-key", longTripFetch),
  error => error instanceof OpenRouteServiceApiError && error.code === "ROUTE_TOO_LONG",
  "extremely long routes should fail with a bounded, understandable error",
);

const negativeBatteryTrip = createSampleTrip();
negativeBatteryTrip.vehicles[0].startingBatteryPercent = -25;
const negativeBatteryPlan = calculateGroupPlan(negativeBatteryTrip, createDemoPlanningInputs(negativeBatteryTrip));
assert.ok(negativeBatteryPlan.stops.length > 0, "negative battery input should be clamped and produce a safe plan");
assert.ok(negativeBatteryPlan.stops.flatMap(stop => stop.vehiclePlans).every(vehicle => vehicle.arrivalBatteryPercent >= 0), "displayed arrival battery should never be negative");

const multiVehicleTrip = createSampleTrip();
const baseline = calculateGroupPlan(multiVehicleTrip, createDemoPlanningInputs(multiVehicleTrip));
assert.equal(multiVehicleTrip.vehicles.length, 3, "failure suite should exercise multiple vehicles");
assert.equal(baseline.stops.length, 2, "three-vehicle demo trip should retain two stops");

const snapshot = JSON.stringify(multiVehicleTrip);
for (let index = 0; index < 250; index += 1) {
  const repeated = calculateGroupPlan(multiVehicleTrip, createDemoPlanningInputs(multiVehicleTrip));
  assert.equal(repeated.totalChargingMinutes, baseline.totalChargingMinutes, `calculation ${index + 1} should remain deterministic`);
  assert.equal(repeated.groupStatus, baseline.groupStatus, `calculation ${index + 1} should keep the same status`);
}
assert.equal(JSON.stringify(multiVehicleTrip), snapshot, "repeated calculations should not mutate the trip");

console.log("Verified missing and identical locations, invalid destination, invalid key, route length limit, negative battery handling, three vehicles, and 250 repeated calculations.");
