import type { EVCatalogEntry } from "@/types";

// Curated prototype records for demonstrating search and planning. Values are
// not live specifications and should be verified against the exact vehicle.
export const evCatalog: EVCatalogEntry[] = [
  ev("2022-tesla-model-y-performance", 2022, "Tesla", "Model Y", "Performance", 303, 250, 81, ["NACS"]),
  ev("2022-tesla-model-y-long-range", 2022, "Tesla", "Model Y", "Long Range AWD", 330, 250, 81, ["NACS"]),
  ev("2023-tesla-model-y-performance", 2023, "Tesla", "Model Y", "Performance", 303, 250, 81, ["NACS"]),
  ev("2023-tesla-model-3-long-range", 2023, "Tesla", "Model 3", "Long Range AWD", 333, 250, 79, ["NACS"]),
  ev("2023-ford-mach-e-premium-awd", 2023, "Ford", "Mustang Mach-E", "Premium Extended Range AWD", 290, 150, 91, ["CCS"]),
  ev("2023-ford-mach-e-gt", 2023, "Ford", "Mustang Mach-E", "GT", 270, 150, 91, ["CCS"]),
  ev("2023-ford-f150-lightning-lariat", 2023, "Ford", "F-150 Lightning", "Lariat Extended Range", 320, 155, 131, ["CCS"]),
  ev("2024-hyundai-ioniq5-limited-awd", 2024, "Hyundai", "Ioniq 5", "Limited AWD", 260, 235, 77.4, ["CCS"]),
  ev("2024-hyundai-ioniq5-se-rwd", 2024, "Hyundai", "Ioniq 5", "SE RWD", 303, 235, 77.4, ["CCS"]),
  ev("2024-kia-ev6-wind-rwd", 2024, "Kia", "EV6", "Wind RWD", 310, 235, 77.4, ["CCS"]),
  ev("2024-kia-ev6-gt", 2024, "Kia", "EV6", "GT", 218, 235, 77.4, ["CCS"]),
  ev("2024-rivian-r1t-dual-large", 2024, "Rivian", "R1T", "Dual Motor Large Pack", 352, 220, 135, ["CCS"]),
  ev("2024-rivian-r1s-dual-large", 2024, "Rivian", "R1S", "Dual Motor Large Pack", 352, 220, 135, ["CCS"]),
  ev("2024-chevrolet-blazer-ev-rs-rwd", 2024, "Chevrolet", "Blazer EV", "RS RWD", 324, 190, 102, ["CCS"]),
  ev("2024-chevrolet-equinox-ev-2lt", 2024, "Chevrolet", "Equinox EV", "2LT FWD", 319, 150, 85, ["CCS"]),
  ev("2023-chevrolet-bolt-ev-2lt", 2023, "Chevrolet", "Bolt EV", "2LT", 259, 55, 65, ["CCS"]),
  ev("2024-volkswagen-id4-pro-s", 2024, "Volkswagen", "ID.4", "Pro S RWD", 275, 175, 82, ["CCS"]),
  ev("2024-bmw-i4-edrive40", 2024, "BMW", "i4", "eDrive40", 301, 205, 83.9, ["CCS"]),
  ev("2024-bmw-ix-xdrive50", 2024, "BMW", "iX", "xDrive50", 307, 195, 111.5, ["CCS"]),
  ev("2024-mercedes-eqe-350-plus", 2024, "Mercedes-Benz", "EQE Sedan", "350+", 298, 170, 90.6, ["CCS"]),
  ev("2024-audi-q4-etron-55", 2024, "Audi", "Q4 e-tron", "55 quattro", 258, 175, 82, ["CCS"]),
  ev("2024-porsche-taycan-4s", 2024, "Porsche", "Taycan", "4S", 252, 270, 93.4, ["CCS"]),
  ev("2024-nissan-ariya-venture-plus", 2024, "Nissan", "Ariya", "Venture+ FWD", 304, 130, 91, ["CCS"]),
  ev("2023-nissan-leaf-sv-plus", 2023, "Nissan", "Leaf", "SV Plus", 212, 100, 60, ["CHAdeMO", "J1772"]),
  ev("2024-lucid-air-pure", 2024, "Lucid", "Air", "Pure RWD", 419, 250, 92, ["CCS"]),
  ev("2024-lucid-air-touring", 2024, "Lucid", "Air", "Touring AWD", 411, 300, 112, ["CCS"]),
  ev("2024-polestar-2-long-range", 2024, "Polestar", "2", "Long Range Single Motor", 320, 205, 82, ["CCS"]),
];

export function searchEVCatalog(query: string, limit = 8) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return evCatalog.slice(0, limit);
  return evCatalog
    .filter(vehicle => {
      const searchable = normalize(vehicleLabel(vehicle));
      return terms.every(term => searchable.includes(term));
    })
    .slice(0, limit);
}

export function getCatalogVehicle(id: string | undefined) {
  return evCatalog.find(vehicle => vehicle.id === id);
}

export function vehicleLabel(vehicle: Pick<EVCatalogEntry, "year" | "manufacturer" | "model" | "trim">) {
  return `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model} ${vehicle.trim}`;
}

function ev(id: string, year: number, manufacturer: string, model: string, trim: string, estimatedRangeMiles: number, maxChargingSpeedKw: number, batteryCapacityKwh: number, connectors: EVCatalogEntry["connectors"]): EVCatalogEntry {
  return { id, year, manufacturer, model, trim, estimatedRangeMiles, maxChargingSpeedKw, batteryCapacityKwh, connectors, isPrototypeData: true };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
