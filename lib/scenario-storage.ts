"use client";

import { getCityProfile } from "@/data/city-profiles";
import { getCountry } from "@/data/countries";
import type { SavedRelocationScenario } from "@/types";

const SCENARIO_KEY = "vet-nomad-scenarios-v1";
const COMPARE_KEY = "vet-nomad-scenario-compare-v1";
export const SCENARIO_CHANGED_EVENT = "vet-nomad:scenario-changed";

export function loadScenarios(): SavedRelocationScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SCENARIO_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isScenario).slice(0, 30) : [];
  } catch { return []; }
}

export function saveScenario(scenario: SavedRelocationScenario) {
  const existing = loadScenarios();
  const next = [scenario, ...existing.filter(item => item.id !== scenario.id)].slice(0, 30);
  localStorage.setItem(SCENARIO_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SCENARIO_CHANGED_EVENT));
  return next;
}

export function deleteScenario(id: string) {
  const next = loadScenarios().filter(item => item.id !== id);
  localStorage.setItem(SCENARIO_KEY, JSON.stringify(next));
  saveScenarioComparison(loadScenarioComparison().filter(item => item !== id));
  window.dispatchEvent(new Event(SCENARIO_CHANGED_EVENT));
  return next;
}

export function loadScenarioComparison(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const allowed = new Set(loadScenarios().map(item => item.id));
    const parsed = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && allowed.has(id)).slice(0, 3) : [];
  } catch { return []; }
}

export function saveScenarioComparison(ids: string[]) {
  const allowed = new Set(loadScenarios().map(item => item.id));
  const safe = [...new Set(ids.filter(id => allowed.has(id)))].slice(0, 3);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(safe));
  window.dispatchEvent(new Event(SCENARIO_CHANGED_EVENT));
}

function isScenario(value: unknown): value is SavedRelocationScenario {
  if (!value || typeof value !== "object") return false;
  const scenario = value as Partial<SavedRelocationScenario>;
  return typeof scenario.id === "string"
    && typeof scenario.name === "string"
    && !!scenario.inputs
    && !!getCountry(scenario.inputs.countrySlug)
    && !!getCityProfile(scenario.inputs.countrySlug, scenario.inputs.cityId)
    && !!scenario.result
    && Array.isArray(scenario.result.projections)
    && Array.isArray(scenario.result.blockers);
}
