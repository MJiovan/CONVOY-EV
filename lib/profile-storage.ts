"use client";

import { defaultProfile } from "@/lib/matching";
import type { VeteranProfile } from "@/types";

const PROFILE_KEY = "vet-nomad-profile-v2";
const COMPARE_KEY = "vet-nomad-compare-v2";

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
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(0, 3) : [];
  }
  catch { return []; }
}

export const saveComparison = (slugs: string[]) => localStorage.setItem(COMPARE_KEY, JSON.stringify(slugs));
