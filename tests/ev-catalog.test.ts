import assert from "node:assert/strict";
import { evCatalog, evCatalogStats, getCatalogVehicle, searchEVCatalog, vehicleLabel } from "../data/ev-catalog";
import { calculateGroupPlan } from "../lib/group-planner";
import { vehicleFromCatalog } from "../lib/vehicle-specs";
import type { GroupTrip } from "../types";

assert.ok(evCatalogStats.totalRecords >= 150 && evCatalogStats.totalRecords <= 250, "catalog should contain 150–250 records");
assert.ok(evCatalogStats.manufacturers >= 26, "catalog should represent at least 26 manufacturers");
assert.equal(new Set(evCatalog.map(vehicle => vehicle.id)).size, evCatalog.length, "catalog IDs must be unique");
assert.equal(new Set(evCatalog.map(vehicle => `${vehicle.year}|${vehicle.manufacturer}|${vehicle.model}|${vehicle.trim}`)).size, evCatalog.length, "year/make/model/trim combinations must be unique");

for (const vehicle of evCatalog) {
  assert.ok(vehicle.year >= 2017 && vehicle.year <= 2026, `${vehicle.id} has an unexpected year`);
  assert.ok(vehicle.estimatedRangeMiles > 0, `${vehicle.id} needs a range`);
  assert.ok(vehicle.maxChargingSpeedKw > 0, `${vehicle.id} needs a charging speed`);
  assert.ok(vehicle.batteryCapacityKwh > 0, `${vehicle.id} needs a battery estimate`);
  assert.ok(vehicle.connectors.length > 0, `${vehicle.id} needs a connector`);
  assert.ok(!/hybrid|phev|plug-in/i.test(vehicleLabel(vehicle)), `${vehicle.id} is not battery-only`);
}

const searches: Array<[string, string, string?]> = [
  ["2022 Tesla Model Y Performance", "Tesla", "Model Y"], ["Tesla Model 3", "Tesla", "Model 3"],
  ["Ford Mustang Mach-E", "Ford", "Mustang Mach-E"], ["Ford F-150 Lightning", "Ford", "F-150 Lightning"],
  ["Hyundai Ioniq 5", "Hyundai", "Ioniq 5"], ["Hyundai Ioniq 6", "Hyundai", "Ioniq 6"],
  ["Kia EV6", "Kia", "EV6"], ["Kia EV9", "Kia", "EV9"], ["Rivian R1T", "Rivian", "R1T"], ["Rivian R1S", "Rivian", "R1S"],
  ["Chevrolet Bolt EV", "Chevrolet", "Bolt EV"], ["Chevrolet Equinox EV", "Chevrolet", "Equinox EV"],
  ["Volkswagen ID.4", "Volkswagen", "ID.4"], ["BMW i4", "BMW", "i4"], ["Mercedes EQS", "Mercedes-Benz", "EQS"],
  ["Audi Q4 e-tron", "Audi", "Q4 e-tron"], ["Porsche Taycan", "Porsche", "Taycan"], ["Nissan Leaf", "Nissan", "Leaf"],
  ["Nissan Ariya", "Nissan", "Ariya"], ["Lucid Air", "Lucid", "Air"], ["Polestar 2", "Polestar", "2"],
  ["Volvo EX90", "Volvo", "EX90"], ["Genesis GV60", "Genesis", "GV60"], ["Toyota bZ4X", "Toyota", "bZ4X"],
  ["Subaru Solterra", "Subaru", "Solterra"], ["Honda Prologue", "Honda", "Prologue"], ["Acura ZDX", "Acura", "ZDX"],
];

for (const [query, manufacturer, model] of searches) {
  const result = searchEVCatalog(query, 20)[0];
  assert.ok(result, `${query} should return a result`);
  assert.equal(result.manufacturer, manufacturer, `${query} should prioritize the correct manufacturer`);
  if (model) assert.ok(result.model.includes(model), `${query} should prioritize the correct model`);
}

assert.equal(searchEVCatalog("mach e")[0]?.model, "Mustang Mach-E", "punctuation-insensitive Mach-E search should work");
assert.equal(searchEVCatalog("2017 nissan leaf sv")[0]?.year, 2017, "older model-year search should work");
assert.equal(searchEVCatalog("2018 tesla model 3 long range awd")[0]?.year, 2018, "older Tesla model-year search should work");
assert.equal(searchEVCatalog("2022 model y performance")[0]?.id, "2022-tesla-model-y-performance", "exact year/model/trim should rank first");
assert.equal(searchEVCatalog("").length, 8, "empty search should show only a small popular selection");
assert.deepEqual(searchEVCatalog("2023 kia ev6 gt-line")[0]?.connectors, ["CCS"], "pre-transition EV6 should remain native CCS");
assert.deepEqual(searchEVCatalog("2025 kia ev6 gt-line")[0]?.connectors, ["NACS"], "2025 EV6 should use its native NACS port");
assert.deepEqual(searchEVCatalog("2026 ioniq 9")[0]?.connectors, ["NACS"], "IONIQ 9 should use its native NACS port");
assert.deepEqual(searchEVCatalog("2025 lucid gravity")[0]?.connectors, ["NACS"], "Lucid Gravity should use its native NACS port");
assert.deepEqual(searchEVCatalog("2025 volvo ex90")[0]?.connectors, ["CCS"], "an included adapter must not be recorded as a native connector");

const selectedIds = ["2024-tesla-model-y-long-range-awd", "2024-hyundai-ioniq5-limited-awd", "2023-nissan-leaf-sv-plus"];
const selected = selectedIds.map((id, index) => vehicleFromCatalog(getCatalogVehicle(id)!, { id: `test-${index}`, nickname: `Driver ${index + 1}`, startingBatteryPercent: 72 - index * 5 }));
assert.equal(new Set(selected.map(vehicle => vehicle.estimatedRangeMiles)).size, 3, "different selections should load different ranges");
assert.ok(selected[2].connectors.includes("CHAdeMO"), "Leaf connector data should reach selected vehicle specs");

const trip: GroupTrip = { id: "catalog-test", name: "Catalog test", startingLocation: "Richmond, VA", destination: "Charlotte, NC", totalDistanceMiles: 293, vehicles: selected, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString() };
const plan = calculateGroupPlan(trip);
assert.ok(plan.stops.length > 0, "catalog selections should produce a group plan");
assert.ok(plan.compatibilityWarnings.length > 0, "mixed native connectors should produce relevant compatibility warnings");

console.log(`Verified ${evCatalogStats.totalRecords} BEV records across ${evCatalogStats.manufacturers} manufacturers and ${searches.length} required searches.`);
