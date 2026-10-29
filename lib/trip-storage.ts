"use client";

import type { GroupTrip } from "@/types";
import { demoVehicleSpecificationProvider } from "@/providers/demo/vehicle-provider";
import { vehicleFromCatalog } from "@/lib/vehicle-specs";

const TRIP_KEY = "convoy-ev-active-trip-v1";
export const TRIP_CHANGED_EVENT = "convoy-ev:trip-changed";

export function loadTrip(): GroupTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(TRIP_KEY) || "null");
    return isTrip(parsed) ? migrateTrip(parsed) : null;
  } catch { return null; }
}

function migrateTrip(trip: GroupTrip): GroupTrip {
  return {
    ...trip,
    vehicles: trip.vehicles.map(vehicle => {
      if (vehicle.catalogVehicleId || vehicle.year || vehicle.trim) return vehicle;
      const match = demoVehicleSpecificationProvider.listVehicles().find(entry => entry.manufacturer.toLowerCase() === vehicle.manufacturer.toLowerCase() && entry.model.toLowerCase() === vehicle.model.toLowerCase());
      if (!match) return vehicle;
      const migrated = vehicleFromCatalog(match, vehicle);
      return {
        ...migrated,
        planningOverrides: {
          estimatedRangeMiles: vehicle.estimatedRangeMiles,
          maxChargingSpeedKw: vehicle.maxChargingSpeedKw,
          connectors: vehicle.connectors,
        },
      };
    }),
  };
}

export function saveTrip(trip: GroupTrip) {
  localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  window.dispatchEvent(new Event(TRIP_CHANGED_EVENT));
}

export function clearTrip() {
  localStorage.removeItem(TRIP_KEY);
  window.dispatchEvent(new Event(TRIP_CHANGED_EVENT));
}

function isTrip(value: unknown): value is GroupTrip {
  if (!value || typeof value !== "object") return false;
  const trip = value as Partial<GroupTrip>;
  return typeof trip.id === "string"
    && typeof trip.name === "string"
    && typeof trip.startingLocation === "string"
    && typeof trip.destination === "string"
    && typeof trip.totalDistanceMiles === "number"
    && trip.totalDistanceMiles > 0
    && (trip.route === undefined || isStoredRoute(trip.route))
    && Array.isArray(trip.vehicles)
    && trip.vehicles.length >= 2
    && trip.vehicles.every(vehicle => typeof vehicle.id === "string"
      && typeof vehicle.nickname === "string"
      && typeof vehicle.estimatedRangeMiles === "number"
      && typeof vehicle.startingBatteryPercent === "number"
      && typeof vehicle.maxChargingSpeedKw === "number"
      && Array.isArray(vehicle.connectors)
      && vehicle.connectors.length > 0);
}

function isStoredRoute(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const route = value as NonNullable<GroupTrip["route"]>;
  return typeof route.originLabel === "string"
    && typeof route.destinationLabel === "string"
    && typeof route.totalDistanceMiles === "number"
    && route.totalDistanceMiles > 0
    && typeof route.estimatedDrivingMinutes === "number"
    && Array.isArray(route.legs)
    && Boolean(route.source && typeof route.source.providerId === "string");
}
