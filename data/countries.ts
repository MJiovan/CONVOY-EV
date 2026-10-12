import type { Country } from "@/types";

export const countries: Country[] = [
  {
    slug: "philippines", name: "Philippines", city: "Dumaguete", flag: "🇵🇭", region: "Southeast Asia",
    climate: ["Tropical", "Warm"], settings: ["City", "Suburban"], monthlyCost: 1480, housingCost: 530,
    healthcareScore: 67, healthcare: "Private hospitals and clinics are available in larger cities; complex care may require travel to Cebu or Manila.",
    englishScore: 92, english: "English is widely used in business, healthcare, and everyday services.",
    internetScore: 72, internet: "Fiber is available in many urban areas, though reliability varies by neighborhood.",
    residencyScore: 82, residencyCategory: "Retirement pathway available",
    residency: "Several long-stay and retirement pathways may be available depending on age, pension income, and current rules.",
    financialRequirements: "Income, pension, or deposit requirements vary by pathway and should be confirmed with the Philippine Retirement Authority or embassy.",
    documents: ["Valid U.S. passport", "Police clearance", "Proof of pension or income", "Birth and marriage records as applicable"],
    transportation: "Tricycles, jeepneys, taxis, and ferries are common; a car is often optional in central areas.",
    lifestyle: "A relaxed coastal city with an established international community and easy access to nature.", initialMovingCost: 4200,
    veteranConsiderations: ["VA compensation can generally be paid to eligible beneficiaries abroad.", "The VA Foreign Medical Program may cover care for service-connected conditions; enrollment is separate.", "Keep direct-deposit and contact details current with VA."],
    movingTasks: ["Compare neighborhoods and fiber availability", "Request official visa guidance", "Enroll in or review FMP eligibility", "Budget for flights, deposits, and temporary housing"], accent: "#e7a53d"
  },
  {
    slug: "thailand", name: "Thailand", city: "Chiang Mai", flag: "🇹🇭", region: "Southeast Asia",
    climate: ["Tropical", "Warm"], settings: ["City", "Suburban"], monthlyCost: 1620, housingCost: 590,
    healthcareScore: 86, healthcare: "Well-regarded private hospitals are available in major cities, often with international patient services.",
    englishScore: 68, english: "English is common in tourism and private healthcare but less consistent in local services.",
    internetScore: 91, internet: "Fast, affordable fiber and mobile data are widely available in urban areas.",
    residencyScore: 72, residencyCategory: "Long-stay options with conditions",
    residency: "Retirement and long-stay visa categories exist, with age, funds, insurance, and reporting conditions that can change.",
    financialRequirements: "Common pathways may require age eligibility plus income or a Thai bank deposit. Confirm current thresholds officially.",
    documents: ["Valid U.S. passport", "Proof of funds", "Health insurance documents", "Background check for some categories"],
    transportation: "Ride-hailing, songthaews, and scooters are common; walkability depends heavily on neighborhood.",
    lifestyle: "A creative northern city with food, markets, mountains, and a large remote-work community.", initialMovingCost: 4700,
    veteranConsiderations: ["VA payments can generally continue abroad for eligible beneficiaries.", "FMP reimbursement is limited to qualifying service-connected care.", "Private insurance or self-pay planning remains important."],
    movingTasks: ["Confirm visa and insurance rules", "Choose a neighborhood around transport needs", "Request an international driving permit if needed", "Create a heat and air-quality plan"], accent: "#d9866a"
  },
  {
    slug: "mexico", name: "Mexico", city: "Mérida", flag: "🇲🇽", region: "Latin America",
    climate: ["Tropical", "Warm"], settings: ["City", "Suburban"], monthlyCost: 1770, housingCost: 680,
    healthcareScore: 80, healthcare: "Private hospitals and specialists are accessible in major cities; costs and quality vary by provider.",
    englishScore: 64, english: "English is available in expat-oriented services, while Spanish is valuable for daily life.",
    internetScore: 84, internet: "Fiber and cable service are common in established urban neighborhoods.",
    residencyScore: 78, residencyCategory: "Temporary residency may fit",
    residency: "Temporary or permanent residency may be possible based on financial solvency, family ties, or other categories.",
    financialRequirements: "Consulates apply current income or savings thresholds. Amounts and accepted evidence can vary by consulate.",
    documents: ["Valid U.S. passport", "Consular application", "Bank or pension statements", "Civil records if using family eligibility"],
    transportation: "Buses and ride-hailing are readily available; central neighborhoods can be walkable.",
    lifestyle: "A historic, culturally rich city known for food, warm weather, and access to the Yucatán coast.", initialMovingCost: 3900,
    veteranConsiderations: ["Eligible VA benefits generally remain payable abroad.", "FMP may reimburse eligible service-connected treatment from foreign providers.", "Some border-area VA resources may require travel back to the U.S."],
    movingTasks: ["Check requirements with the relevant Mexican consulate", "Visit during the hottest season", "Compare local and international health coverage", "Build a Spanish-language essentials list"], accent: "#4c9b76"
  },
  {
    slug: "portugal", name: "Portugal", city: "Braga", flag: "🇵🇹", region: "Europe",
    climate: ["Temperate", "Four seasons"], settings: ["City", "Suburban"], monthlyCost: 2310, housingCost: 980,
    healthcareScore: 90, healthcare: "Public and private systems are available; access rules depend on residency and registration.",
    englishScore: 85, english: "English is commonly spoken in cities and professional services, though Portuguese helps with administration.",
    internetScore: 94, internet: "High-quality fiber and mobile coverage are broadly available in cities.",
    residencyScore: 70, residencyCategory: "Income-based routes to research",
    residency: "National visas for people with recurring income may lead to residency, subject to documentation, housing, and current rules.",
    financialRequirements: "Applicants generally need proof of stable means, accommodation, insurance, and other supporting records.",
    documents: ["Valid U.S. passport", "FBI background check", "Proof of income and accommodation", "Health coverage documentation"],
    transportation: "Urban buses and regional rail are useful; many historic districts are walkable.",
    lifestyle: "A compact northern city with historic streets, a mild climate, and rail access to Porto.", initialMovingCost: 6800,
    veteranConsiderations: ["Eligible VA compensation generally continues overseas.", "FMP is not comprehensive insurance and focuses on qualifying service-connected care.", "Plan for local healthcare registration and supplemental coverage."],
    movingTasks: ["Confirm the current visa category and sequence", "Apostille required U.S. records", "Plan for tax-residency advice", "Secure temporary accommodation before a long lease"], accent: "#5886a6"
  },
  {
    slug: "costa-rica", name: "Costa Rica", city: "San Ramón", flag: "🇨🇷", region: "Latin America",
    climate: ["Tropical", "Temperate"], settings: ["Suburban", "Rural"], monthlyCost: 2050, housingCost: 790,
    healthcareScore: 84, healthcare: "Public and private care are available; residents may need to join the national system while also using private care.",
    englishScore: 73, english: "English is common in tourism and some private services; Spanish improves daily independence.",
    internetScore: 78, internet: "Good service exists in many towns, but exact speeds should be checked by address.",
    residencyScore: 76, residencyCategory: "Pensionado route to research",
    residency: "Pension-based and other temporary residency categories may be available, with documentary and renewal requirements.",
    financialRequirements: "Pensionado applications commonly rely on proof of qualifying lifetime pension income; verify the current rule and process.",
    documents: ["Valid U.S. passport", "Birth certificate", "Police record", "Official pension or benefit letter"],
    transportation: "Intercity buses are extensive; a car can be useful outside town centers.",
    lifestyle: "A greener, quieter central-valley town with a moderate elevation and easy access to nature.", initialMovingCost: 5200,
    veteranConsiderations: ["VA benefits can generally be deposited while living abroad.", "FMP may cover qualifying service-connected care, not routine comprehensive healthcare.", "Consider travel time to larger hospitals when choosing a town."],
    movingTasks: ["Verify pensionado eligibility", "Price mandatory local healthcare contributions", "Test internet at the exact property", "Plan document authentication and translation"], accent: "#6b9b76"
  }
];

export const getCountry = (slug: string) => countries.find((country) => country.slug === slug);
