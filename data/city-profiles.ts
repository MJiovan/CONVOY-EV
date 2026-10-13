import { countries } from "@/data/countries";
import type { CityProfile, CityType, Country } from "@/types";

const cityNames: Record<string, [string, string, string]> = {
  philippines: ["Manila", "Dumaguete", "Tagbilaran"],
  thailand: ["Bangkok", "Chiang Mai", "Hua Hin"],
  mexico: ["Mexico City", "Mérida", "San Miguel de Allende"],
  portugal: ["Lisbon", "Braga", "Coimbra"],
  "costa-rica": ["San José", "San Ramón", "Grecia"],
  vietnam: ["Ho Chi Minh City", "Da Nang", "Hoi An"],
  malaysia: ["Kuala Lumpur", "George Town", "Ipoh"],
  indonesia: ["Jakarta", "Yogyakarta", "Ubud"],
  japan: ["Tokyo", "Fukuoka", "Matsuyama"],
  "south-korea": ["Seoul", "Busan", "Jeonju"],
  panama: ["Panama City", "David", "Boquete"],
  colombia: ["Bogotá", "Medellín", "Manizales"],
  ecuador: ["Quito", "Cuenca", "Loja"],
  spain: ["Madrid", "Valencia", "Granada"],
  greece: ["Athens", "Thessaloniki", "Kalamata"],
  croatia: ["Zagreb", "Rijeka", "Zadar"],
  italy: ["Rome", "Lecce", "Perugia"],
  georgia: ["Tbilisi", "Batumi", "Kutaisi"],
  "dominican-republic": ["Santo Domingo", "Santiago", "Puerto Plata"],
  belize: ["Belize City", "San Ignacio", "Corozal"],
};

const variants: Array<{ type: CityType; cost: number; rent: number; moving: number }> = [
  { type: "Major City", cost: 1.2, rent: 1.3, moving: 1.18 },
  { type: "Mid-Size City", cost: 1, rent: 1, moving: 1 },
  { type: "Smaller City", cost: 0.84, rent: 0.78, moving: 0.88 },
];

export const cityProfiles: CityProfile[] = countries.flatMap(country => {
  const names = cityNames[country.slug] ?? [`${country.city} Central`, country.city, `${country.city} Outskirts`];
  return variants.map((variant, index) => createCityProfile(country, names[index], variant.type, variant.cost, variant.rent, variant.moving));
});

export function getCityProfiles(countrySlug: string) {
  return cityProfiles.filter(city => city.countrySlug === countrySlug);
}

export function getCityProfile(countrySlug: string, cityId: string) {
  return cityProfiles.find(city => city.countrySlug === countrySlug && city.id === cityId);
}

function createCityProfile(country: Country, name: string, type: CityType, costFactor: number, rentFactor: number, movingFactor: number): CityProfile {
  const monthlyTotal = round10(country.monthlyCost * costFactor);
  const rent = round10(country.housingCost * rentFactor);
  const remaining = Math.max(0, monthlyTotal - rent);
  const utilities = round10(remaining * 0.15);
  const food = round10(remaining * 0.36);
  const transportation = round10(remaining * 0.14);
  const healthcare = round10(remaining * 0.13);
  const other = Math.max(0, monthlyTotal - rent - utilities - food - transportation - healthcare);
  const movingTotal = round10(country.initialMovingCost * movingFactor);
  const flight = round10(movingTotal * 0.22);
  const housingDeposit = round10(movingTotal * 0.28);
  const setup = round10(movingTotal * 0.25);
  const movingOther = Math.max(0, movingTotal - flight - housingDeposit - setup);
  return {
    id: `${country.slug}-${slugify(name)}`,
    countrySlug: country.slug,
    name,
    type,
    expenses: { rent, utilities, food, transportation, healthcare, other },
    movingCosts: { flight, housingDeposit, setup, other: movingOther },
    dataStatus: "Demo Data",
  };
}

function round10(value: number) { return Math.round(value / 10) * 10; }
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
