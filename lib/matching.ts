import { countries } from "@/data/countries";
import type { Country, MatchResult, ScoreBreakdown, VeteranProfile } from "@/types";

export const defaultProfile: VeteranProfile = {
  vaIncome: 2400,
  otherIncome: 400,
  currentExpenses: 500,
  savingsGoal: 500,
  housingBudget: 900,
  climate: "Warm",
  region: "Open to anywhere",
  setting: "City",
  healthcareImportance: 4,
  englishImportance: 4,
  internetImportance: 4,
};

export const SCORE_WEIGHTS = {
  affordability: 30,
  savings: 20,
  housing: 15,
  lifestyle: 20,
  residency: 15,
} as const;

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));

function affordabilityScore(availableAfterExpenses: number, monthlyCost: number) {
  if (availableAfterExpenses <= 0) return 0;
  const costShare = monthlyCost / availableAfterExpenses;
  if (costShare <= 0.7) return 100;
  if (costShare <= 1) return clamp(100 - ((costShare - 0.7) / 0.3) * 30);
  return clamp(70 - ((costShare - 1) / 0.4) * 70);
}

function savingsScore(remaining: number, savingsGoal: number) {
  if (savingsGoal <= 0) return remaining >= 0 ? 100 : 0;
  return clamp((remaining / savingsGoal) * 100);
}

function housingScore(housingBudget: number, housingCost: number) {
  if (housingCost <= 0) return 100;
  return clamp((housingBudget / housingCost) * 100);
}

function lifestyleScore(profile: VeteranProfile, country: Country) {
  const climate = country.climate.includes(profile.climate) ? 100 : 35;
  const region = profile.region === "Open to anywhere" || country.region === profile.region ? 100 : 25;
  const setting = profile.setting === "Flexible" || country.settings.includes(profile.setting) ? 100 : 45;
  const importanceTotal = profile.healthcareImportance + profile.englishImportance + profile.internetImportance;
  const services = importanceTotal > 0
    ? (country.healthcareScore * profile.healthcareImportance + country.englishScore * profile.englishImportance + country.internetScore * profile.internetImportance) / importanceTotal
    : 75;
  return clamp(climate * 0.2 + region * 0.2 + setting * 0.1 + services * 0.5);
}

function buildReasons(profile: VeteranProfile, country: Country, breakdown: ScoreBreakdown, remaining: number) {
  const reasons: string[] = [];
  if (remaining >= profile.savingsGoal) reasons.push(`Leaves ${formatCurrency(remaining)} after estimated costs, meeting your ${formatCurrency(profile.savingsGoal)} savings goal.`);
  else if (remaining >= 0) reasons.push(`Stays cash-flow positive, but falls short of your savings goal by ${formatCurrency(profile.savingsGoal - remaining)}.`);
  else reasons.push(`Runs about ${formatCurrency(Math.abs(remaining))} over the monthly amount available after ongoing expenses.`);
  reasons.push(country.housingCost <= profile.housingBudget
    ? `Sample housing is ${formatCurrency(profile.housingBudget - country.housingCost)} below your housing limit.`
    : `Sample housing is ${formatCurrency(country.housingCost - profile.housingBudget)} above your housing limit.`);
  if (country.climate.includes(profile.climate)) reasons.push(`Matches your ${profile.climate.toLowerCase()} climate preference.`);
  else reasons.push(`Climate differs from your ${profile.climate.toLowerCase()} preference.`);
  if (profile.region !== "Open to anywhere") reasons.push(country.region === profile.region ? `Located in your preferred region: ${profile.region}.` : `Outside your preferred region of ${profile.region}.`);
  const strongest = [
    { label: "healthcare", value: country.healthcareScore, importance: profile.healthcareImportance },
    { label: "English access", value: country.englishScore, importance: profile.englishImportance },
    { label: "internet", value: country.internetScore, importance: profile.internetImportance },
  ].sort((a, b) => (b.value * b.importance) - (a.value * a.importance))[0];
  if (breakdown.lifestyle >= 70) reasons.push(`${strongest.label[0].toUpperCase()}${strongest.label.slice(1)} supports the lifestyle score.`);
  return reasons.slice(0, 3);
}

export function scoreCountry(profile: VeteranProfile, country: Country): MatchResult {
  const monthlyIncome = profile.vaIncome + profile.otherIncome;
  const availableAfterExpenses = monthlyIncome - profile.currentExpenses;
  const remaining = availableAfterExpenses - country.monthlyCost;
  const breakdown: ScoreBreakdown = {
    affordability: affordabilityScore(availableAfterExpenses, country.monthlyCost),
    savings: savingsScore(remaining, profile.savingsGoal),
    housing: housingScore(profile.housingBudget, country.housingCost),
    lifestyle: lifestyleScore(profile, country),
    residency: country.residencyScore,
  };
  const score = clamp(
    breakdown.affordability * (SCORE_WEIGHTS.affordability / 100) +
    breakdown.savings * (SCORE_WEIGHTS.savings / 100) +
    breakdown.housing * (SCORE_WEIGHTS.housing / 100) +
    breakdown.lifestyle * (SCORE_WEIGHTS.lifestyle / 100) +
    breakdown.residency * (SCORE_WEIGHTS.residency / 100)
  );
  const status = score >= 80 ? "Strong Match" : score >= 60 ? "Possible Match" : "Needs More Research";
  return { country, score, monthlyIncome, availableAfterExpenses, remaining, status, breakdown, reasons: buildReasons(profile, country, breakdown, remaining) };
}

export const rankCountries = (profile: VeteranProfile) => countries
  .map((country) => scoreCountry(profile, country))
  .sort((a, b) => b.score - a.score);

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(value);
