import type { ChargingStation, EVCatalogEntry, EVVehicle } from "@/types";

export type ProviderMode = "demo" | "live";
export type Awaitable<T> = T | Promise<T>;

export interface ProviderSource {
  mode: ProviderMode;
  providerId: string;
  label: string;
  isDemoData: boolean;
  retrievedAt?: string;
}

export interface RouteLeg {
  id: string;
  startLabel: string;
  endLabel: string;
  distanceMiles: number;
  estimatedDrivingMinutes: number;
}

export interface PlannedRoute {
  originLabel: string;
  destinationLabel: string;
  totalDistanceMiles: number;
  estimatedDrivingMinutes: number;
  legs: RouteLeg[];
  source: ProviderSource;
}

export interface RoutePlanningRequest {
  originLabel: string;
  destinationLabel: string;
  distanceHintMiles?: number;
}

export interface RoutePlanningProvider {
  readonly source: ProviderSource;
  planRoute(request: RoutePlanningRequest): Awaitable<PlannedRoute>;
}

export interface ChargingStationRequest {
  route: PlannedRoute;
  vehicles: EVVehicle[];
}

export interface ChargingStationProvider {
  readonly source: ProviderSource;
  findStations(request: ChargingStationRequest): Awaitable<ChargingStation[]>;
}

export interface VehicleSpecificationProvider {
  readonly source: ProviderSource;
  getVehicle(id: string | undefined): Awaitable<EVCatalogEntry | undefined>;
  searchVehicles(query: string, limit?: number): Awaitable<EVCatalogEntry[]>;
  listVehicles(): Awaitable<EVCatalogEntry[]>;
  getYears(): Awaitable<number[]>;
  getManufacturers(year: number): Awaitable<string[]>;
  getModels(year: number, manufacturer: string): Awaitable<string[]>;
  getTrims(year: number, manufacturer: string, model: string): Awaitable<string[]>;
  getVehicleBySelection(year: number, manufacturer: string, model: string, trim: string): Awaitable<EVCatalogEntry | undefined>;
  labelVehicle(vehicle: Pick<EVCatalogEntry, "year" | "manufacturer" | "model" | "trim">): string;
}

export interface EnergyPlanningAssumptions {
  reservePercent: number;
  planningBufferPercent: number;
}

export interface ChargingTimeRequest {
  vehicle: EVVehicle;
  station: ChargingStation;
  arrivalBatteryPercent: number;
  departureBatteryPercent: number;
  connectorCompatible: boolean;
}

export interface EnergyCalculationProvider {
  readonly source: ProviderSource;
  readonly assumptions: EnergyPlanningAssumptions;
  usableMilesAtStateOfCharge(vehicle: EVVehicle, batteryPercent: number): number;
  maximumUsableMiles(vehicle: EVVehicle): number;
  batteryPercentForDistance(vehicle: EVVehicle, distanceMiles: number): number;
  recommendedDepartureSoc(vehicle: EVVehicle, nextLegMiles: number): number;
  estimateChargingMinutes(request: ChargingTimeRequest): number;
}

export interface GroupPlanningInputs {
  route: PlannedRoute;
  stations: ChargingStation[];
  energyCalculations: EnergyCalculationProvider;
}

export interface ProviderSet {
  mode: ProviderMode;
  routePlanning: RoutePlanningProvider;
  chargingStations: ChargingStationProvider;
  vehicleSpecifications: VehicleSpecificationProvider;
  energyCalculations: EnergyCalculationProvider;
}
