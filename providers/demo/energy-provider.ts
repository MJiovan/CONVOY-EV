import type { ConnectorType, EVVehicle } from "@/types";
import type { ChargingTimeRequest, EnergyCalculationProvider } from "@/providers/contracts";
import { effectiveVehicleSpecs } from "@/lib/vehicle-specs";
import { demoProviderSource } from "@/providers/demo/source";

export const DEMO_ENERGY_CONFIG = {
  reservePercent: 12,
  planningBufferPercent: 1,
  chargingTaperFactor: 0.72,
} as const;

export class DemoEnergyCalculationProvider implements EnergyCalculationProvider {
  readonly source = demoProviderSource;
  readonly assumptions = {
    reservePercent: DEMO_ENERGY_CONFIG.reservePercent,
    planningBufferPercent: DEMO_ENERGY_CONFIG.planningBufferPercent,
  };

  usableMilesAtStateOfCharge(vehicle: EVVehicle, batteryPercent: number) {
    const range = effectiveVehicleSpecs(vehicle).estimatedRangeMiles;
    return range * Math.max(0, batteryPercent - this.assumptions.reservePercent - this.assumptions.planningBufferPercent) / 100;
  }

  maximumUsableMiles(vehicle: EVVehicle) {
    return this.usableMilesAtStateOfCharge(vehicle, 100);
  }

  batteryPercentForDistance(vehicle: EVVehicle, distanceMiles: number) {
    return (distanceMiles / Math.max(1, effectiveVehicleSpecs(vehicle).estimatedRangeMiles)) * 100;
  }

  recommendedDepartureSoc(vehicle: EVVehicle, nextLegMiles: number) {
    const range = effectiveVehicleSpecs(vehicle).estimatedRangeMiles;
    return Math.ceil((nextLegMiles / Math.max(1, range)) * 100 + this.assumptions.reservePercent + this.assumptions.planningBufferPercent);
  }

  estimateChargingMinutes(request: ChargingTimeRequest) {
    if (!request.connectorCompatible || request.arrivalBatteryPercent >= request.departureBatteryPercent) return 0;
    const specs = effectiveVehicleSpecs(request.vehicle);
    const chargePercent = request.departureBatteryPercent - request.arrivalBatteryPercent;
    const energyNeededKwh = specs.batteryCapacityKwh * (chargePercent / 100);
    const effectivePower = Math.min(
      specs.maxChargingSpeedKw,
      request.station.maxPowerKw,
      connectorPowerCap(specs.connectors, request.station.connectors),
    ) * DEMO_ENERGY_CONFIG.chargingTaperFactor;
    return effectivePower > 0 ? Math.ceil((energyNeededKwh / effectivePower) * 60) : 0;
  }
}

function connectorPowerCap(vehicleConnectors: ConnectorType[], stationConnectors: ConnectorType[]) {
  const shared = vehicleConnectors.filter(connector => stationConnectors.includes(connector));
  return Math.max(...shared.map(connector => connector === "J1772" ? 19 : connector === "CHAdeMO" ? 100 : 400), 0);
}

export const demoEnergyCalculationProvider = new DemoEnergyCalculationProvider();
