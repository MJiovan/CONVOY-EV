import { buildRelocationTasks } from "@/data/relocation-tasks";
import type { Country, ReadinessCategory, RelocationPlan, RelocationReadinessResult, RelocationTask, VeteranProfile } from "@/types";

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));

export const RELOCATION_READINESS_WEIGHTS: Record<ReadinessCategory, number> = {
  financial: 30,
  documents: 20,
  residency: 20,
  healthcare: 15,
  moving: 15,
};

export function calculateRelocationReadiness(profile: VeteranProfile, country: Country, plan: RelocationPlan): RelocationReadinessResult {
  const tasks = buildRelocationTasks(country);
  const complete = new Set(plan.completedTaskIds);
  const monthlyIncome = profile.vaIncome + profile.otherIncome;
  const remaining = monthlyIncome - profile.currentExpenses - country.monthlyCost;
  const monthsUntilMove = getMonthsUntil(plan.targetMoveDate);
  const projectedSavings = plan.currentSavings + Math.max(0, remaining) * Math.max(0, monthsUntilMove);
  const budgetScore = remaining >= profile.savingsGoal ? 100 : remaining >= 0 ? clamp(65 + (remaining / Math.max(1, profile.savingsGoal)) * 35) : clamp(65 + (remaining / Math.max(1, country.monthlyCost)) * 65);
  const savingsScore = clamp((plan.currentSavings / Math.max(1, country.initialMovingCost)) * 100);
  const projectionScore = clamp((projectedSavings / Math.max(1, country.initialMovingCost)) * 100);

  const documents = completionScore(tasks, complete, ["documents"]);
  const residency = completionScore(tasks, complete, ["residency"]);
  const healthcare = completionScore(tasks, complete, ["va-benefits", "healthcare"]);
  const movingCompletion = completionScore(tasks, complete, ["housing", "moving"]);
  const scheduleBuffer = monthsUntilMove >= 6 ? 100 : monthsUntilMove >= 3 ? 75 : monthsUntilMove >= 1 ? 50 : 25;

  const categories: Record<ReadinessCategory, number> = {
    financial: clamp(budgetScore * 0.4 + savingsScore * 0.35 + projectionScore * 0.25),
    documents,
    residency,
    healthcare,
    moving: clamp(movingCompletion * 0.8 + scheduleBuffer * 0.2),
  };
  const score = clamp(Object.entries(RELOCATION_READINESS_WEIGHTS).reduce((total, [key, weight]) => total + categories[key as ReadinessCategory] * (weight / 100), 0));
  const progress = clamp((complete.size / Math.max(1, tasks.length)) * 100);
  const reasons = buildReadinessReasons(tasks, complete, country, profile, plan, remaining, monthsUntilMove, projectedSavings);
  return { score, progress, categories, reasons, monthsUntilMove, projectedSavings };
}

export function unmetDependencies(task: RelocationTask, tasks: RelocationTask[], completedTaskIds: string[]) {
  const complete = new Set(completedTaskIds);
  return (task.dependsOn ?? []).filter(id => !complete.has(id)).map(id => tasks.find(candidate => candidate.id === id)?.title ?? id);
}

function completionScore(tasks: RelocationTask[], complete: Set<string>, categories: RelocationTask["category"][]) {
  const relevant = tasks.filter(task => categories.includes(task.category));
  return clamp((relevant.filter(task => complete.has(task.id)).length / Math.max(1, relevant.length)) * 100);
}

function getMonthsUntil(date: string) {
  const target = new Date(`${date}T12:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const days = (target.getTime() - Date.now()) / 86_400_000;
  return Math.max(0, Math.ceil(days / 30.44));
}

function buildReadinessReasons(tasks: RelocationTask[], complete: Set<string>, country: Country, profile: VeteranProfile, plan: RelocationPlan, remaining: number, months: number, projectedSavings: number) {
  const completedDocuments = tasks.filter(task => task.category === "documents" && complete.has(task.id)).length;
  const reasons = [`You have completed ${complete.size} of ${tasks.length} relocation tasks${completedDocuments ? `, including ${completedDocuments} document task${completedDocuments === 1 ? "" : "s"}` : ""}.`];
  if (remaining < 0) reasons.push(`Financial readiness is limited because the demo monthly estimate exceeds income after ongoing expenses by ${money(Math.abs(remaining))}.`);
  else reasons.push(`Your estimated monthly cushion is ${money(remaining)} after ongoing expenses and the demo cost for ${country.name}.`);
  const savingsPercent = clamp((plan.currentSavings / Math.max(1, country.initialMovingCost)) * 100);
  reasons.push(`Current savings cover ${savingsPercent}% of the illustrative ${money(country.initialMovingCost)} initial moving-cost estimate; projected savings by the target date are ${money(projectedSavings)}.`);
  reasons.push(`${months} month${months === 1 ? "" : "s"} remain before the target move date, so unfinished time-sensitive tasks affect moving readiness.`);
  if (profile.savingsGoal > 0) reasons.push(`The monthly savings goal used in your veteran profile is ${money(profile.savingsGoal)}.`);
  return reasons;
}

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
