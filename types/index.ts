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
