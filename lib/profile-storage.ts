"use client";

import { defaultProfile } from "@/lib/matching";
import { countries } from "@/data/countries";
import type { VeteranProfile } from "@/types";

const PROFILE_KEY = "vet-nomad-profile-v2";
const COMPARE_KEY = "vet-nomad-compare-v2";
export const COMPARISON_CHANGED_EVENT = "vet-nomad:comparison-changed";

export function loadProfile(): VeteranProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return { ...defaultProfile, ...parsed };
  }
  catch { return defaultProfile; }
}

export const saveProfile = (profile: VeteranProfile) => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

export function loadComparison(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
    const allowed = new Set(countries.map((country) => country.slug));
    return Array.isArray(parsed) ? [...new Set(parsed.filter((value): value is string => typeof value === "string" && allowed.has(value)))].slice(0, 3) : [];
  }
  catch { return []; }
}

export function saveComparison(slugs: string[]) {
  const allowed = new Set(countries.map((country) => country.slug));
  const safeSlugs = [...new Set(slugs.filter((value) => typeof value === "string" && allowed.has(value)))].slice(0, 3);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(safeSlugs));
  window.dispatchEvent(new Event(COMPARISON_CHANGED_EVENT));
}

export const isValidComparison = (slugs: string[]) => slugs.length >= 2 && slugs.length <= 3;
