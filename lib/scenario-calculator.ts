import { getCityProfile } from "@/data/city-profiles";
import { buildRelocationTasks } from "@/data/relocation-tasks";
import { getCountry } from "@/data/countries";
import { calculateRelocationReadiness, RELOCATION_READINESS_WEIGHTS } from "@/lib/relocation-readiness";
import type { CityMovingCostProfile, RelocationPlan, RelocationScenarioInputs, ScenarioBlocker, ScenarioResult, VeteranProfile } from "@/types";

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));

export function calculateScenario(inputs: RelocationScenarioInputs, savedPlan?: RelocationPlan): ScenarioResult {
  const country = getCountry(inputs.countrySlug);
  const city = getCityProfile(inputs.countrySlug, inputs.cityId);
  if (!country || !city) throw new Error("A valid destination and city are required.");

  const monthlyIncome = inputs.veteranIncome + inputs.otherIncome;
  const monthlyLivingCost = inputs.rent + city.expenses.utilities + city.expenses.food + city.expenses.transportation + city.expenses.healthcare + city.expenses.other;
  const monthlySurplus = monthlyIncome - inputs.existingExpenses - monthlyLivingCost;
  const estimatedMovingCosts = Math.max(0, inputs.movingCosts);
  const initialCashNeeded = estimatedMovingCosts + monthlyLivingCost;
  const savingsAfterMove = inputs.currentSavings - estimatedMovingCosts;
  const projections = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, balance: savingsAfterMove + monthlySurplus * (index + 1) }));
  const firstNegativeMonth = projections.find(item => item.balance < 0)?.month ?? null;
  const savingsAfter3Months = projections[2].balance;
  const savingsAfter6Months = projections[5].balance;
  const savingsAfter12Months = projections[11].balance;
  const financialSustainability = monthlySurplus >= inputs.savingsGoal && inputs.currentSavings >= estimatedMovingCosts && savingsAfter12Months >= 0
    ? "Good"
    : monthlySurplus >= 0 && inputs.currentSavings >= estimatedMovingCosts * 0.75 && savingsAfter12Months >= 0
      ? "Watch"
      : "At Risk";

  const scenarioProfile: VeteranProfile = {
    vaIncome: inputs.veteranIncome,
    otherIncome: inputs.otherIncome,
    currentExpenses: inputs.existingExpenses,
    savingsGoal: inputs.savingsGoal,
    housingBudget: inputs.housingBudget,
    climate: country.climate[0],
    region: country.region,
    setting: country.settings[0],
    healthcareImportance: 3,
    englishImportance: 3,
    internetImportance: 3,
  };
  const plan: RelocationPlan = {
    countrySlug: country.slug,
    targetMoveDate: inputs.targetMoveDate,
    currentSavings: inputs.currentSavings,
    completedTaskIds: savedPlan?.completedTaskIds ?? [],
    createdAt: savedPlan?.createdAt ?? new Date().toISOString(),
    updatedAt: savedPlan?.updatedAt ?? new Date().toISOString(),
  };
  const baseReadiness = calculateRelocationReadiness(scenarioProfile, country, plan);
  const financialScore = clamp(
    (monthlySurplus >= inputs.savingsGoal ? 100 : monthlySurplus >= 0 ? 65 + (monthlySurplus / Math.max(1, inputs.savingsGoal)) * 35 : 35 + (monthlySurplus / Math.max(1, monthlyLivingCost)) * 35) * 0.45
    + clamp((inputs.currentSavings / Math.max(1, estimatedMovingCosts)) * 100) * 0.35
    + clamp((Math.max(0, savingsAfter12Months) / Math.max(1, initialCashNeeded)) * 100) * 0.2
  );
  const readinessScore = clamp(
    financialScore * (RELOCATION_READINESS_WEIGHTS.financial / 100)
    + baseReadiness.categories.documents * (RELOCATION_READINESS_WEIGHTS.documents / 100)
    + baseReadiness.categories.residency * (RELOCATION_READINESS_WEIGHTS.residency / 100)
    + baseReadiness.categories.healthcare * (RELOCATION_READINESS_WEIGHTS.healthcare / 100)
    + baseReadiness.categories.moving * (RELOCATION_READINESS_WEIGHTS.moving / 100)
  );
  const blockers = buildBlockers(inputs, monthlyIncome, monthlySurplus, estimatedMovingCosts, baseReadiness.monthsUntilMove, plan, country.slug);
  const concern = blockers.find(item => item.status === "Potential Blocker") ?? blockers.find(item => item.status === "Needs Attention");

  return {
    monthlyIncome,
    monthlyLivingCost,
    monthlySurplus,
    initialCashNeeded,
    estimatedMovingCosts,
    savingsAfterMove,
    savingsAfter3Months,
    savingsAfter6Months,
    savingsAfter12Months,
    firstNegativeMonth,
    financialSustainability,
    readinessScore,
    projections,
    blockers,
    biggestConcern: concern?.reason ?? "This scenario has no major planning blocker based on the current demonstration inputs.",
    suggestedNextStep: concern?.suggestion ?? "Continue verifying official requirements and completing your relocation checklist.",
  };
}

export function scaleMovingCosts(base: CityMovingCostProfile, total: number): CityMovingCostProfile {
  const baseTotal = base.flight + base.housingDeposit + base.setup + base.other;
  const factor = Math.max(0, total) / Math.max(1, baseTotal);
  const flight = Math.round(base.flight * factor);
  const housingDeposit = Math.round(base.housingDeposit * factor);
  const setup = Math.round(base.setup * factor);
  return { flight, housingDeposit, setup, other: Math.max(0, Math.round(total) - flight - housingDeposit - setup) };
}

function buildBlockers(inputs: RelocationScenarioInputs, monthlyIncome: number, monthlySurplus: number, movingCosts: number, monthsUntilMove: number, plan: RelocationPlan, countrySlug: string): ScenarioBlocker[] {
  const tasks = buildRelocationTasks(getCountry(countrySlug)!);
  const completed = new Set(plan.completedTaskIds);
  const categoryComplete = (categories: string[]) => {
    const relevant = tasks.filter(task => categories.includes(task.category));
    return relevant.length > 0 && relevant.every(task => completed.has(task.id));
  };
  const incomplete = tasks.filter(task => !completed.has(task.id)).length;
  return [
    {
      id: "moving-savings",
      label: "Initial moving savings",
      status: inputs.currentSavings >= movingCosts ? "Ready" : inputs.currentSavings >= movingCosts * 0.75 ? "Needs Attention" : "Potential Blocker",
      reason: inputs.currentSavings >= movingCosts ? "Current savings cover the estimated relocation costs." : `Current savings are $${Math.round(Math.max(0, movingCosts - inputs.currentSavings)).toLocaleString()} below the estimated relocation costs.`,
      suggestion: inputs.currentSavings >= movingCosts ? "Keep the estimate current as quotes change." : `Consider building another $${Math.round(Math.max(0, movingCosts - inputs.currentSavings)).toLocaleString()} before the target date.`,
    },
    {
      id: "monthly-cash-flow",
      label: "Monthly cash flow",
      status: monthlySurplus >= inputs.savingsGoal ? "Ready" : monthlySurplus >= 0 ? "Needs Attention" : "Potential Blocker",
      reason: monthlySurplus >= inputs.savingsGoal ? "Estimated monthly cash flow meets the selected savings goal." : monthlySurplus >= 0 ? "The scenario remains positive but falls below the selected monthly savings goal." : `Estimated monthly costs exceed income by $${Math.round(Math.abs(monthlySurplus)).toLocaleString()}.`,
      suggestion: monthlySurplus >= inputs.savingsGoal ? "Stress-test rent and income before committing." : "Adjust rent, destination costs, income, or continuing U.S. expenses and rerun the scenario.",
    },
    taskBlocker("residency", "Residency verification", categoryComplete(["residency"]), "Residency requirements still need verification.", "Complete the residency tasks and verify current requirements with the official destination authority."),
    taskBlocker("healthcare", "Healthcare planning", categoryComplete(["healthcare", "va-benefits"]), "Healthcare and VA overseas planning are not complete.", "Review official VA/FMP guidance and local coverage options."),
    taskBlocker("documents", "Passport and documents", categoryComplete(["documents"]), "Passport and supporting document preparation are incomplete.", "Complete the document checklist before relying on the target date."),
    {
      id: "preparation-time",
      label: "Preparation time",
      status: monthsUntilMove >= 6 ? "Ready" : monthsUntilMove >= 3 ? "Needs Attention" : "Potential Blocker",
      reason: monthsUntilMove >= 6 ? `${monthsUntilMove} months remain for preparation.` : `Only ${monthsUntilMove} month${monthsUntilMove === 1 ? "" : "s"} remain before the target date.`,
      suggestion: monthsUntilMove >= 6 ? "Use the relocation timeline to sequence remaining tasks." : "Consider a later target date or prioritize time-sensitive official requirements.",
    },
    {
      id: "plan-progress",
      label: "Relocation checklist",
      status: incomplete === 0 ? "Ready" : incomplete <= 5 ? "Needs Attention" : "Potential Blocker",
      reason: incomplete === 0 ? "All demonstration planning tasks are complete." : `${incomplete} relocation planning task${incomplete === 1 ? " remains" : "s remain"}.`,
      suggestion: incomplete === 0 ? "Recheck completed tasks as requirements change." : "Open the relocation plan and work through the highest-priority unfinished tasks.",
    },
    {
      id: "income-coverage",
      label: "Income coverage",
      status: monthlyIncome > 0 ? "Ready" : "Potential Blocker",
      reason: monthlyIncome > 0 ? "At least one monthly income source is included." : "No monthly income is included in this scenario.",
      suggestion: monthlyIncome > 0 ? "Verify that income can continue overseas." : "Add a reliable income assumption before using this scenario for planning.",
    },
  ];
}

function taskBlocker(id: string, label: string, complete: boolean, reason: string, suggestion: string): ScenarioBlocker {
  return { id, label, status: complete ? "Ready" : "Needs Attention", reason: complete ? `${label} tasks are complete in the saved relocation plan.` : reason, suggestion: complete ? "Continue verifying information as the move approaches." : suggestion };
}
