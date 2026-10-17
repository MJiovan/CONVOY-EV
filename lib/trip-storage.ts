"use client";

import type { GroupTrip } from "@/types";

const TRIP_KEY = "convoy-ev-active-trip-v1";
export const TRIP_CHANGED_EVENT = "convoy-ev:trip-changed";

export function loadTrip(): GroupTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(TRIP_KEY) || "null");
    return isTrip(parsed) ? parsed : null;
  } catch { return null; }
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
