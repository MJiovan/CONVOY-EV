import type { ConnectorType, EVCatalogEntry, EVVehicle } from "@/types";

export interface EffectiveVehicleSpecs {
  estimatedRangeMiles: number;
  maxChargingSpeedKw: number;
  batteryCapacityKwh: number;
  connectors: ConnectorType[];
  isOverridden: boolean;
}

export function effectiveVehicleSpecs(vehicle: EVVehicle): EffectiveVehicleSpecs {
  const overrides = vehicle.planningOverrides;
  return {
    estimatedRangeMiles: overrides?.estimatedRangeMiles ?? vehicle.estimatedRangeMiles,
    maxChargingSpeedKw: overrides?.maxChargingSpeedKw ?? vehicle.maxChargingSpeedKw,
    batteryCapacityKwh: vehicle.batteryCapacityKwh ?? clamp(vehicle.estimatedRangeMiles / 3.2, 45, 125),
    connectors: overrides?.connectors ?? vehicle.connectors,
    isOverridden: Boolean(overrides && (overrides.estimatedRangeMiles !== undefined || overrides.maxChargingSpeedKw !== undefined || overrides.connectors !== undefined)),
  };
}

export function vehicleFromCatalog(entry: EVCatalogEntry, existing: Pick<EVVehicle, "id" | "nickname" | "startingBatteryPercent">): EVVehicle {
  return {
    ...existing,
    catalogVehicleId: entry.id,
    year: entry.year,
    manufacturer: entry.manufacturer,
    model: entry.model,
    trim: entry.trim,
    estimatedRangeMiles: entry.estimatedRangeMiles,
    maxChargingSpeedKw: entry.maxChargingSpeedKw,
    batteryCapacityKwh: entry.batteryCapacityKwh,
    connectors: [...entry.connectors],
    planningOverrides: undefined,
  };
}

export function vehicleDisplayName(vehicle: EVVehicle) {
  return [vehicle.year, vehicle.manufacturer, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
