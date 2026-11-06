import assert from "node:assert/strict";
import { createSampleTrip } from "../data/demo-route";
import { calculateGroupPlan } from "../lib/group-planner";
import { OpenRouteServiceApiError, planOpenRouteServiceRoute } from "../lib/openrouteservice";
import { createPlanningInputs, demoProviderSet, getProviderSet } from "../providers";
import { OpenRouteServiceRouteProvider, openRouteServiceSource, RoutePlanningError } from "../providers/live/openrouteservice-provider";
import { getRouteErrorPresentation } from "../lib/route-error-presentation";
import type { PlannedRoute } from "../types";

const requests: Array<{ url: string; init?: RequestInit }> = [];
const serviceFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  requests.push({ url, init });
  if (url.includes("/geocode/search")) {
    const phoenix = url.includes("Phoenix");
    return Response.json({ features: [{ geometry: { coordinates: phoenix ? [-112.074, 33.4484] : [-117.1611, 32.7157] }, properties: { label: phoenix ? "Phoenix, Arizona, USA" : "San Diego, California, USA" } }] });
  }
  return Response.json({
    features: [{
      geometry: { type: "LineString", coordinates: [[-112.074, 33.4484], [-115, 33], [-117.1611, 32.7157]] },
      properties: { summary: { distance: 571327.12, duration: 20640 } },
    }],
  });
}) as typeof fetch;

const route = await planOpenRouteServiceRoute({ originLabel: "Phoenix, AZ", destinationLabel: "San Diego, CA" }, "test-key", serviceFetch);
assert.equal(route.totalDistanceMiles, 355, "ORS meters should convert to road miles");
assert.equal(route.estimatedDrivingMinutes, 344, "ORS seconds should convert to driving minutes");
assert.equal(route.geometry?.coordinates.length, 3, "GeoJSON route geometry should be retained");
assert.equal(route.source.mode, "live", "ORS routes should be marked as live data");
assert.equal(requests.length, 3, "routing should geocode both endpoints and request directions once");
assert.equal(requests[2].init?.headers && (requests[2].init.headers as Record<string, string>).Authorization, "test-key", "API key should be sent only by the server adapter");

const clientProvider = new OpenRouteServiceRouteProvider("/api/route-plan", (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body));
  assert.deepEqual(body, { originLabel: "Phoenix, AZ", destinationLabel: "San Diego, CA" }, "client provider should send only route labels");
  return Response.json({ route });
}) as typeof fetch);
assert.deepEqual(await clientProvider.planRoute({ originLabel: "Phoenix, AZ", destinationLabel: "San Diego, CA" }), route, "client provider should return the server route");

const failingProvider = new OpenRouteServiceRouteProvider("/api/route-plan", (async () => Response.json({ code: "ROUTING_NOT_CONFIGURED", message: "Routing needs a key." }, { status: 503 })) as typeof fetch);
await assert.rejects(
  () => failingProvider.planRoute({ originLabel: "A", destinationLabel: "B" }),
  error => error instanceof RoutePlanningError && error.code === "ROUTING_NOT_CONFIGURED",
  "client provider should expose a useful fallback error",
);

const missingLocationFetch = (async () => Response.json({ features: [] })) as typeof fetch;
await assert.rejects(
  () => planOpenRouteServiceRoute({ originLabel: "Missing", destinationLabel: "Nowhere" }, "test-key", missingLocationFetch),
  error => error instanceof OpenRouteServiceApiError && error.code === "LOCATION_NOT_FOUND",
  "missing geocoding results should produce a specific error",
);

const sample = createSampleTrip();
const injectedRoute: PlannedRoute = { ...route, totalDistanceMiles: 360, estimatedDrivingMinutes: 350 };
const inputs = await createPlanningInputs(sample, {
  ...demoProviderSet,
  mode: "live",
  routePlanning: { source: openRouteServiceSource, planRoute: () => injectedRoute },
});
const plan = calculateGroupPlan({ ...sample, totalDistanceMiles: injectedRoute.totalDistanceMiles, route: injectedRoute }, inputs);
assert.equal(plan.estimatedDrivingMinutes, 350, "group planner should use live route duration");
assert.equal(inputs.route.totalDistanceMiles, 360, "live road distance should reach planning inputs");
assert.equal(getProviderSet("live").routePlanning.source.providerId, "openrouteservice", "live registry should select openrouteservice");

const offlineGuidance = getRouteErrorPresentation("ROUTING_OFFLINE", "The connection was lost.");
assert.equal(offlineGuidance.title, "We could not reach the routing service", "offline errors should have a clear heading");
assert.ok(offlineGuidance.nextStep.includes("demo route"), "recoverable route errors should explain the demo fallback");

const locationGuidance = getRouteErrorPresentation("LOCATION_NOT_FOUND", "The destination was not found.");
assert.ok(locationGuidance.nextStep.includes("ZIP/postal code"), "location errors should tell the user how to make the search more specific");

console.log("Verified openrouteservice geocoding, directions, geometry, client errors, registry selection, and planner injection.");
