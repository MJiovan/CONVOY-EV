"use client";

import { countries } from "@/data/countries";
import type { RelocationPlan, RelocationPlanStore } from "@/types";

const PLAN_KEY = "vet-nomad-relocation-plans-v1";
export const RELOCATION_PLAN_CHANGED_EVENT = "vet-nomad:relocation-plan-changed";

const emptyStore = (): RelocationPlanStore => ({ activeCountrySlug: null, plans: {} });

export function loadRelocationPlans(): RelocationPlanStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const parsed = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
    const allowed = new Set(countries.map(country => country.slug));
    const plans = Object.entries(parsed.plans || {}).reduce<Record<string, RelocationPlan>>((result, [slug, value]) => {
      if (allowed.has(slug) && isPlan(value, slug)) result[slug] = value;
      return result;
    }, {});
    const activeCountrySlug = typeof parsed.activeCountrySlug === "string" && plans[parsed.activeCountrySlug] ? parsed.activeCountrySlug : Object.keys(plans)[0] ?? null;
    return { activeCountrySlug, plans };
  } catch { return emptyStore(); }
}

export function saveRelocationPlans(store: RelocationPlanStore) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(RELOCATION_PLAN_CHANGED_EVENT));
}

export function createRelocationPlan(countrySlug: string): RelocationPlan {
  const now = new Date();
  const target = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return {
    countrySlug,
    targetMoveDate: target.toISOString().slice(0, 10),
    currentSavings: 0,
    completedTaskIds: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function ensureRelocationPlan(store: RelocationPlanStore, countrySlug: string): RelocationPlanStore {
  if (!countries.some(country => country.slug === countrySlug)) return store;
  const plan = store.plans[countrySlug] ?? createRelocationPlan(countrySlug);
  return { activeCountrySlug: countrySlug, plans: { ...store.plans, [countrySlug]: plan } };
}

export function updateRelocationPlan(store: RelocationPlanStore, plan: RelocationPlan): RelocationPlanStore {
  const updated = { ...plan, updatedAt: new Date().toISOString() };
  return { activeCountrySlug: plan.countrySlug, plans: { ...store.plans, [plan.countrySlug]: updated } };
}

function isPlan(value: unknown, slug: string): value is RelocationPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<RelocationPlan>;
  return plan.countrySlug === slug
    && typeof plan.targetMoveDate === "string"
    && typeof plan.currentSavings === "number"
    && Array.isArray(plan.completedTaskIds);
}
