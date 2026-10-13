export type Climate = "Tropical" | "Warm" | "Temperate" | "Four seasons";
export type Region = "Southeast Asia" | "East Asia" | "Latin America" | "Europe" | "Open to anywhere";
export type Setting = "City" | "Suburban" | "Rural" | "Flexible";

export interface VeteranProfile {
  vaIncome: number;
  otherIncome: number;
  currentExpenses: number;
  savingsGoal: number;
  housingBudget: number;
  climate: Climate;
  region: Region;
  setting: Setting;
  healthcareImportance: number;
  englishImportance: number;
  internetImportance: number;
}

export interface Country {
  slug: string;
  name: string;
  city: string;
  flag: string;
  region: Exclude<Region, "Open to anywhere">;
  climate: Climate[];
  settings: Exclude<Setting, "Flexible">[];
  monthlyCost: number;
  housingCost: number;
  healthcareScore: number;
  healthcare: string;
  englishScore: number;
  english: string;
  internetScore: number;
  internet: string;
  residencyScore: number;
  residencyCategory: string;
  residency: string;
  financialRequirements: string;
  documents: string[];
  transportation: string;
  lifestyle: string;
  initialMovingCost: number;
  veteranConsiderations: string[];
  movingTasks: string[];
  officialSources?: OfficialSource[];
  accent: string;
}

export interface OfficialSource {
  label: string;
  url: string;
  verifiedAt: string;
}

export interface ScoreBreakdown {
  affordability: number;
  savings: number;
  housing: number;
  lifestyle: number;
  residency: number;
}

export interface MatchFactor {
  tone: "positive" | "neutral" | "warning";
  text: string;
}

export interface MatchResult {
  country: Country;
  score: number;
  monthlyIncome: number;
  availableAfterExpenses: number;
  remaining: number;
  status: "Strong Match" | "Possible Match" | "Needs More Research";
  breakdown: ScoreBreakdown;
  reasons: MatchFactor[];
}

export type RelocationCategory = "finances" | "residency" | "documents" | "va-benefits" | "healthcare" | "housing" | "moving";
export type TimelineStage = "start-now" | "3-6-months" | "1-3-months" | "final-month" | "before-departure";
export type ReadinessCategory = "financial" | "documents" | "residency" | "healthcare" | "moving";

export interface RelocationTask {
  id: string;
  category: RelocationCategory;
  title: string;
  detail: string;
  timeline: TimelineStage;
  dependsOn?: string[];
  officialSourceLabel?: string;
  officialSourceUrl?: string;
}

export interface RelocationPlan {
  countrySlug: string;
  targetMoveDate: string;
  currentSavings: number;
  completedTaskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RelocationPlanStore {
  activeCountrySlug: string | null;
  plans: Record<string, RelocationPlan>;
}

export interface RelocationReadinessResult {
  score: number;
  progress: number;
  categories: Record<ReadinessCategory, number>;
  reasons: string[];
  monthsUntilMove: number;
  projectedSavings: number;
}

export type CityType = "Major City" | "Mid-Size City" | "Smaller City";

export interface CityExpenseProfile {
  rent: number;
  utilities: number;
  food: number;
  transportation: number;
  healthcare: number;
  other: number;
}

export interface CityMovingCostProfile {
  flight: number;
  housingDeposit: number;
  setup: number;
  other: number;
}

export interface CityProfile {
  id: string;
  countrySlug: string;
  name: string;
  type: CityType;
  expenses: CityExpenseProfile;
  movingCosts: CityMovingCostProfile;
  dataStatus: "Demo Data";
}

export interface RelocationScenarioInputs {
  countrySlug: string;
  cityId: string;
  targetMoveDate: string;
  veteranIncome: number;
  otherIncome: number;
  existingExpenses: number;
  currentSavings: number;
  housingBudget: number;
  savingsGoal: number;
  rent: number;
  movingCosts: number;
}

export type BlockerStatus = "Ready" | "Needs Attention" | "Potential Blocker";

export interface ScenarioBlocker {
  id: string;
  label: string;
  status: BlockerStatus;
  reason: string;
  suggestion: string;
}

export interface MonthlyProjection {
  month: number;
  balance: number;
}

export interface ScenarioResult {
  monthlyIncome: number;
  monthlyLivingCost: number;
  monthlySurplus: number;
  initialCashNeeded: number;
  estimatedMovingCosts: number;
  savingsAfterMove: number;
  savingsAfter3Months: number;
  savingsAfter6Months: number;
  savingsAfter12Months: number;
  firstNegativeMonth: number | null;
  financialSustainability: "Good" | "Watch" | "At Risk";
  readinessScore: number;
  projections: MonthlyProjection[];
  blockers: ScenarioBlocker[];
  biggestConcern: string;
  suggestedNextStep: string;
}

export interface SavedRelocationScenario {
  id: string;
  name: string;
  inputs: RelocationScenarioInputs;
  result: ScenarioResult;
  createdAt: string;
  updatedAt: string;
}
