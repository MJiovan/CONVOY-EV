import type { Country, RelocationCategory, RelocationTask, TimelineStage } from "@/types";

export const relocationCategoryLabels: Record<RelocationCategory, string> = {
  finances: "Finances",
  residency: "Residency / Visa",
  documents: "Documents",
  "va-benefits": "VA Benefits",
  healthcare: "Healthcare Abroad",
  housing: "Housing",
  moving: "Moving Preparation",
};

export const timelineLabels: Record<TimelineStage, string> = {
  "start-now": "Start Now",
  "3-6-months": "3–6 Months Before Move",
  "1-3-months": "1–3 Months Before Move",
  "final-month": "Final Month",
  "before-departure": "Before Departure",
};

export const timelineOrder: TimelineStage[] = ["start-now", "3-6-months", "1-3-months", "final-month", "before-departure"];

export function buildRelocationTasks(country: Country): RelocationTask[] {
  const tasks: RelocationTask[] = [
    task("finances-savings", "finances", "Reach your moving savings goal", `Build savings toward the illustrative ${country.name} initial moving-cost estimate.`, "start-now"),
    task("finances-budget", "finances", "Review the estimated monthly budget", `Review income, ongoing expenses, and the demo monthly cost for ${country.city}.`, "start-now"),
    task("finances-moving-costs", "finances", "Set aside money for initial moving costs", "Plan for flights, temporary housing, deposits, document fees, and setup expenses.", "3-6-months"),

    task("documents-passport", "documents", "Verify passport expiration date", "Confirm that the passport validity will meet the rules for the intended travel and application dates.", "start-now", undefined, "U.S. Department of State"),
    task("documents-income", "documents", "Gather proof of income", "Collect benefit letters, pension evidence, bank records, or other financial documents that may be requested.", "start-now"),
    task("documents-personal", "documents", "Gather important personal documents", `Collect the civil records and supporting documents that may be relevant for ${country.name}.`, "3-6-months"),

    task("residency-official", "residency", "Verify current visa or residency requirements", `Use the official ${country.name} immigration or residency authority before making decisions.`, "start-now", ["documents-income"], `${country.name} official immigration authority`),
    task("residency-income", "residency", "Review proof-of-income requirements", country.financialRequirements, "start-now", ["documents-income"]),
    task("residency-documents", "residency", "Review required application documents", country.residency, "3-6-months", ["documents-personal"]),

    task("va-overseas", "va-benefits", "Review receiving VA benefits overseas", "Confirm current guidance for receiving eligible VA payments while living outside the United States.", "start-now", undefined, "U.S. Department of Veterans Affairs"),
    task("va-banking", "va-benefits", "Verify address and banking changes", "Review whether VA, banking, tax, or mailing details need to change before departure.", "1-3-months"),
    task("va-official", "va-benefits", "Review official VA overseas resources", "Use official VA guidance rather than relying on demonstration planning information.", "start-now", undefined, "U.S. Department of Veterans Affairs"),

    task("healthcare-fmp", "healthcare", "Review Foreign Medical Program information", "Confirm eligibility, enrollment, covered service-connected care, and claim procedures directly with VA.", "start-now", undefined, "VA Foreign Medical Program"),
    task("healthcare-local", "healthcare", `Research healthcare options in ${country.city}`, country.healthcare, "3-6-months"),
    task("healthcare-coverage", "healthcare", "Identify coverage needed outside the U.S.", "Compare local enrollment, private coverage, emergency care, and self-pay plans.", "1-3-months", ["healthcare-local"]),

    task("housing-rent", "housing", "Research expected rent", `Compare the illustrative housing estimate with current listings in ${country.city}.`, "3-6-months"),
    task("housing-neighborhoods", "housing", `Review neighborhoods in ${country.city}`, "Compare safety, healthcare access, transportation, daily services, and internet availability.", "3-6-months"),
    task("housing-move-in", "housing", "Estimate move-in costs", "Plan for deposits, temporary lodging, furnishings, utilities, and local setup costs.", "1-3-months", ["housing-rent"]),

    task("moving-flights", "moving", "Estimate flight costs", "Compare realistic one-way travel and baggage costs without treating prices as guaranteed.", "1-3-months"),
    task("moving-connectivity", "moving", "Review phone and internet options", country.internet, "1-3-months"),
    task("moving-banking", "moving", "Review banking and payment options overseas", "Plan access to funds, cards, fees, exchange rates, and backup payment methods.", "1-3-months"),
    task("moving-belongings", "moving", "Plan what to move, sell, or store", "Create a practical inventory and compare baggage, shipping, selling, and storage options.", "final-month"),
    task("moving-documents", "moving", "Prepare a departure document folder", "Keep secure physical and digital copies of travel, financial, healthcare, and residency records.", "before-departure", ["documents-passport", "documents-personal"]),
  ];

  return tasks;
}

function task(id: string, category: RelocationCategory, title: string, detail: string, timeline: TimelineStage, dependsOn?: string[], officialSourceLabel?: string): RelocationTask {
  return { id, category, title, detail, timeline, dependsOn, officialSourceLabel };
}
