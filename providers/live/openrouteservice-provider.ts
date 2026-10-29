import type { PlannedRoute, ProviderSource } from "@/types";
import type { RoutePlanningProvider, RoutePlanningRequest } from "@/providers/contracts";

export const openRouteServiceSource: ProviderSource = {
  mode: "live",
  providerId: "openrouteservice",
  label: "openrouteservice",
  isDemoData: false,
};

export class RoutePlanningError extends Error {
  constructor(message: string, readonly code = "ROUTING_FAILED") {
    super(message);
    this.name = "RoutePlanningError";
  }
}

export class OpenRouteServiceRouteProvider implements RoutePlanningProvider {
  readonly source = openRouteServiceSource;

  constructor(
    private readonly endpoint = "/api/route-plan",
    private readonly fetcher: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  async planRoute(request: RoutePlanningRequest): Promise<PlannedRoute> {
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ originLabel: request.originLabel, destinationLabel: request.destinationLabel }),
    });
    const payload = await readJson(response);
    if (!response.ok) {
      const message = typeof payload.message === "string" ? payload.message : "Real-world routing is unavailable right now.";
      const code = typeof payload.code === "string" ? payload.code : "ROUTING_FAILED";
      throw new RoutePlanningError(message, code);
    }
    if (!isPlannedRoute(payload.route)) throw new RoutePlanningError("The routing service returned an incomplete route.", "INVALID_ROUTE_RESPONSE");
    return payload.route;
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try { return await response.json() as Record<string, unknown>; }
  catch { return {}; }
}

function isPlannedRoute(value: unknown): value is PlannedRoute {
  if (!value || typeof value !== "object") return false;
  const route = value as Partial<PlannedRoute>;
  return typeof route.originLabel === "string"
    && typeof route.destinationLabel === "string"
    && typeof route.totalDistanceMiles === "number"
    && route.totalDistanceMiles > 0
    && typeof route.estimatedDrivingMinutes === "number"
    && Array.isArray(route.legs)
    && Boolean(route.source);
}

export const openRouteServiceRouteProvider = new OpenRouteServiceRouteProvider();
