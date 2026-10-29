export type ConnectorType = "NACS" | "CCS" | "CHAdeMO" | "J1772";

export interface EVCatalogEntry {
  id: string;
  year: number;
  manufacturer: string;
  model: string;
  trim: string;
  estimatedRangeMiles: number;
  maxChargingSpeedKw: number;
  batteryCapacityKwh: number;
  connectors: ConnectorType[];
  isPrototypeData: boolean;
}

export interface EVPlanningOverrides {
  estimatedRangeMiles?: number;
  maxChargingSpeedKw?: number;
  connectors?: ConnectorType[];
}

export interface EVVehicle {
  id: string;
  nickname: string;
  catalogVehicleId?: string;
  year?: number;
  manufacturer: string;
  model: string;
  trim?: string;
  estimatedRangeMiles: number;
  startingBatteryPercent: number;
  maxChargingSpeedKw: number;
  batteryCapacityKwh?: number;
  connectors: ConnectorType[];
  planningOverrides?: EVPlanningOverrides;
}

export interface GroupTrip {
  id: string;
  name: string;
  startingLocation: string;
  destination: string;
  totalDistanceMiles: number;
  vehicles: EVVehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  locationLabel: string;
  distanceMiles: number;
  maxPowerKw: number;
  connectors: ConnectorType[];
  stalls: number;
  isDemoData: boolean;
}

export interface VehicleStopPlan {
  vehicleId: string;
  nickname: string;
  vehicleLabel: string;
  arrivalBatteryPercent: number;
  departureBatteryPercent: number;
  estimatedChargingMinutes: number;
  connectorCompatible: boolean;
  chargeNeeded: boolean;
  feasible: boolean;
}

export interface GroupChargingStop {
  station: ChargingStation;
  vehiclePlans: VehicleStopPlan[];
  groupStopMinutes: number;
  compatibleWithAllVehicles: boolean;
  constrainedVehicleId: string;
  nextPointLabel: string;
  nextLegMiles: number;
  reason: string;
}

export interface CompatibilityWarning {
  stationName: string;
  distanceMiles: number;
  missingConnectors: ConnectorType[];
  message: string;
}

export interface GroupChargingPlan {
  stops: GroupChargingStop[];
  compatibilityWarnings: CompatibilityWarning[];
  totalChargingMinutes: number;
  estimatedDrivingMinutes: number;
  estimatedTripMinutes: number;
  constrainedVehicleId: string;
  constrainedVehicleName: string;
  groupStatus: "Ready" | "Review needed" | "Route blocked";
  summary: string;
}
