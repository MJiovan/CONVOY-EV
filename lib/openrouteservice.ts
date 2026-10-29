import type { PlannedRoute, ProviderSource, RouteCoordinate } from "@/types";
import type { RoutePlanningRequest } from "@/providers/contracts";

const GEOCODE_URL = "https://api.openrouteservice.org/geocode/search";
const DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const METERS_PER_MILE = 1609.344;

export class OpenRouteServiceApiError extends Error {
  constructor(message: string, readonly code: string, readonly status = 502) {
    super(message);
    this.name = "OpenRouteServiceApiError";
  }
}

export async function planOpenRouteServiceRoute(
  request: RoutePlanningRequest,
  apiKey: string,
  fetcher: typeof fetch = fetch,
): Promise<PlannedRoute> {
  const origin = await geocode(request.originLabel, apiKey, fetcher, "starting location");
  const destination = await geocode(request.destinationLabel, apiKey, fetcher, "destination");
  const response = await fetcher(DIRECTIONS_URL, {
    method: "POST",
    headers: { Authorization: apiKey, "content-type": "application/json" },
    body: JSON.stringify({ coordinates: [origin.coordinates, destination.coordinates] }),
  });
  if (!response.ok) throw new OpenRouteServiceApiError("The routing service could not calculate a driving route between those locations.", "DIRECTIONS_FAILED", response.status);
  const payload = await response.json() as OrsDirectionsResponse;
  const feature = payload.features?.[0];
  const distanceMeters = feature?.properties?.summary?.distance;
  const durationSeconds = feature?.properties?.summary?.duration;
  const coordinates = feature?.geometry?.coordinates;
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds) || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new OpenRouteServiceApiError("The routing service returned an incomplete driving route.", "INVALID_DIRECTIONS_RESPONSE");
  }

  const totalDistanceMiles = roundOne(distanceMeters! / METERS_PER_MILE);
  const estimatedDrivingMinutes = Math.max(1, Math.round(durationSeconds! / 60));
  const source: ProviderSource = {
    mode: "live",
    providerId: "openrouteservice",
    label: "openrouteservice",
    isDemoData: false,
    retrievedAt: new Date().toISOString(),
  };
  return {
    originLabel: origin.label,
    destinationLabel: destination.label,
    totalDistanceMiles,
    estimatedDrivingMinutes,
    legs: [{
      id: "openrouteservice-leg-1",
      startLabel: origin.label,
      endLabel: destination.label,
      distanceMiles: totalDistanceMiles,
      estimatedDrivingMinutes,
    }],
    geometry: { type: "LineString", coordinates: coordinates as RouteCoordinate[] },
    source,
  };
}

async function geocode(query: string, apiKey: string, fetcher: typeof fetch, field: string) {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("text", query);
  url.searchParams.set("size", "1");
  const response = await fetcher(url);
  if (!response.ok) throw new OpenRouteServiceApiError(`The routing service could not look up the ${field}.`, "GEOCODING_FAILED", response.status);
  const payload = await response.json() as OrsGeocodeResponse;
  const feature = payload.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new OpenRouteServiceApiError(`We could not find the ${field}. Try adding a city, state, or ZIP code.`, "LOCATION_NOT_FOUND", 422);
  }
  return { coordinates: coordinates as RouteCoordinate, label: feature?.properties?.label || query };
}

const roundOne = (value: number) => Math.round(value * 10) / 10;

interface OrsGeocodeResponse {
  features?: Array<{ geometry?: { coordinates?: number[] }; properties?: { label?: string } }>;
}

interface OrsDirectionsResponse {
  features?: Array<{
    geometry?: { coordinates?: number[][] };
    properties?: { summary?: { distance?: number; duration?: number } };
  }>;
}
