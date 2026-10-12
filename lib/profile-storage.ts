"use client";

import { defaultProfile } from "@/lib/matching";
import type { VeteranProfile } from "@/types";

const PROFILE_KEY = "vet-nomad-profile";
const COMPARE_KEY = "vet-nomad-compare";

export function loadProfile(): VeteranProfile {
  if (typeof window === "undefined") return defaultProfile;
  try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; }
  catch { return defaultProfile; }
}

export const saveProfile = (profile: VeteranProfile) => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

export function loadComparison(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]"); }
  catch { return []; }
}

export const saveComparison = (slugs: string[]) => localStorage.setItem(COMPARE_KEY, JSON.stringify(slugs));
