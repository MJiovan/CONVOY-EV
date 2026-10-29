import type { EVCatalogEntry } from "@/types";
import type { VehicleSpecificationProvider } from "@/providers/contracts";
import { evCatalog, getCatalogManufacturers, getCatalogModels, getCatalogTrims, getCatalogVehicle, getCatalogVehicleBySelection, getCatalogYears, searchEVCatalog, vehicleLabel } from "@/data/ev-catalog";
import { demoProviderSource } from "@/providers/demo/source";

export class DemoVehicleSpecificationProvider implements VehicleSpecificationProvider {
  readonly source = demoProviderSource;

  getVehicle(id: string | undefined): EVCatalogEntry | undefined {
    return getCatalogVehicle(id);
  }

  searchVehicles(query: string, limit?: number): EVCatalogEntry[] {
    return searchEVCatalog(query, limit);
  }

  listVehicles(): EVCatalogEntry[] {
    return evCatalog;
  }

  getYears() { return getCatalogYears(); }
  getManufacturers(year: number) { return getCatalogManufacturers(year); }
  getModels(year: number, manufacturer: string) { return getCatalogModels(year, manufacturer); }
  getTrims(year: number, manufacturer: string, model: string) { return getCatalogTrims(year, manufacturer, model); }
  getVehicleBySelection(year: number, manufacturer: string, model: string, trim: string) { return getCatalogVehicleBySelection(year, manufacturer, model, trim); }
  labelVehicle(vehicle: Pick<EVCatalogEntry, "year" | "manufacturer" | "model" | "trim">) { return vehicleLabel(vehicle); }
}

export const demoVehicleSpecificationProvider = new DemoVehicleSpecificationProvider();
