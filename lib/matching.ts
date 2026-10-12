import { countries } from "@/data/countries";
import type { Country, MatchResult, ScoreBreakdown, VeteranProfile } from "@/types";

export const defaultProfile: VeteranProfile = {
  vaIncome: 2800, otherIncome: 700, currentExpenses: 2400, savingsGoal: 500, housingBudget: 900,
  climate: "Warm", region: "Open to anywhere", setting: "City",
  healthcareImportance: 4, englishImportance: 4, internetImportance: 4,
};

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));

export function scoreCountry(profile: VeteranProfile, country: Country): MatchResult {
  const income = profile.vaIncome + profile.otherIncome;
  const remaining = income - country.monthlyCost;
  const affordability = clamp(100 - Math.max(0, country.monthlyCost - income * 0.72) / 12);
  const savings = clamp(70 + (remaining - profile.savingsGoal) / 12);
  const housing = clamp(82 + (profile.housingBudget - country.housingCost) / 10);
  const climateMatch = country.climate.includes(profile.climate) ? 100 : 58;
  const regionMatch = profile.region === "Open to anywhere" || country.region === profile.region ? 100 : 45;
  const settingMatch = profile.setting === "Flexible" || country.settings.includes(profile.setting) ? 100 : 58;
  const preferenceWeight = profile.healthcareImportance + profile.englishImportance + profile.internetImportance;
  const serviceMatch = preferenceWeight
    ? (country.healthcareScore * profile.healthcareImportance + country.englishScore * profile.englishImportance + country.internetScore * profile.internetImportance) / preferenceWeight
    : 75;
  const lifestyle = clamp(climateMatch * .24 + regionMatch * .24 + settingMatch * .18 + serviceMatch * .34);
  const residency = country.residencyScore;
  const breakdown: ScoreBreakdown = { affordability, savings, housing, lifestyle, residency };
  const score = clamp(affordability * .28 + savings * .2 + housing * .18 + lifestyle * .2 + residency * .14);
  const status = score >= 80 ? "Strong Match" : score >= 65 ? "Possible Match" : "Needs More Research";
  return { country, score, remaining, status, breakdown };
}

export const rankCountries = (profile: VeteranProfile) => countries.map((country) => scoreCountry(profile, country)).sort((a, b) => b.score - a.score);

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
