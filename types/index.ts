export type ConnectorType = "NACS" | "CCS" | "CHAdeMO" | "J1772";

export interface EVVehicle {
  id: string;
  nickname: string;
  manufacturer: string;
  model: string;
  estimatedRangeMiles: number;
  startingBatteryPercent: number;
  maxChargingSpeedKw: number;
  connectors: ConnectorType[];
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
  isDemoData: true;
}

export interface VehicleStopPlan {
  vehicleId: string;
  nickname: string;
  vehicleLabel: string;
  arrivalBatteryPercent: number;
  departureBatteryPercent: number;
  estimatedChargingMinutes: number;
  connectorCompatible: boolean;
}

export interface GroupChargingStop {
  station: ChargingStation;
  vehiclePlans: VehicleStopPlan[];
  groupStopMinutes: number;
  compatibleWithAllVehicles: boolean;
  constrainedVehicleId: string;
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
