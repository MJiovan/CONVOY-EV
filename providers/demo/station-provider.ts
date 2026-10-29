import type { ChargingStation } from "@/types";
import type { ChargingStationProvider, ChargingStationRequest } from "@/providers/contracts";
import { buildDemoStations } from "@/data/demo-route";
import { demoProviderSource } from "@/providers/demo/source";

export class DemoChargingStationProvider implements ChargingStationProvider {
  readonly source = demoProviderSource;

  findStations(request: ChargingStationRequest): ChargingStation[] {
    return buildDemoStations(request.route.totalDistanceMiles);
  }
}

export const demoChargingStationProvider = new DemoChargingStationProvider();
