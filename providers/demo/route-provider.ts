import type { PlannedRoute, RoutePlanningProvider, RoutePlanningRequest } from "@/providers/contracts";
import { demoProviderSource } from "@/providers/demo/source";

export const DEMO_ROUTE_SPEED_MPH = 62;

export class DemoRoutePlanningProvider implements RoutePlanningProvider {
  readonly source = demoProviderSource;

  planRoute(request: RoutePlanningRequest): PlannedRoute {
    const totalDistanceMiles = Math.max(25, request.distanceHintMiles ?? 25);
    const estimatedDrivingMinutes = Math.round((totalDistanceMiles / DEMO_ROUTE_SPEED_MPH) * 60);
    return {
      originLabel: request.originLabel,
      destinationLabel: request.destinationLabel,
      totalDistanceMiles,
      estimatedDrivingMinutes,
      legs: [{
        id: "demo-route-leg-1",
        startLabel: request.originLabel,
        endLabel: request.destinationLabel,
        distanceMiles: totalDistanceMiles,
        estimatedDrivingMinutes,
      }],
      source: this.source,
    };
  }
}

export const demoRoutePlanningProvider = new DemoRoutePlanningProvider();
