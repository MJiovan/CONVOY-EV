export type Climate = "Tropical" | "Warm" | "Temperate" | "Four seasons";
export type Region = "Southeast Asia" | "Latin America" | "Europe" | "Open to anywhere";
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
  accent: string;
}

export interface ScoreBreakdown {
  affordability: number;
  savings: number;
  housing: number;
  lifestyle: number;
  residency: number;
}

export interface MatchResult {
  country: Country;
  score: number;
  remaining: number;
  status: "Strong Match" | "Possible Match" | "Needs More Research";
  breakdown: ScoreBreakdown;
}
