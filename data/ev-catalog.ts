import type { ConnectorType, EVCatalogEntry } from "@/types";

type Row = [number, string, string, number, number, number, ConnectorType[]?, string?];
const CCS: ConnectorType[] = ["CCS"];
const NACS: ConnectorType[] = ["NACS"];
const LEAF: ConnectorType[] = ["CHAdeMO", "J1772"];

// Curated, local prototype data. Every value is intentionally marked as Demo
// Data in the UI and should be verified against the exact vehicle before use.
export const evCatalog: EVCatalogEntry[] = [
  ...brand("Tesla", [
    [2017,"Model S","75D AWD",259,120,75,NACS],[2018,"Model S","100D AWD",335,120,100,NACS],[2019,"Model S","Long Range AWD",370,200,100,NACS],
    [2017,"Model X","100D AWD",295,120,100,NACS],[2018,"Model X","100D AWD",295,120,100,NACS],[2019,"Model X","Long Range AWD",325,200,100,NACS],
    [2017,"Model 3","Long Range RWD",310,170,75,NACS],[2018,"Model 3","Long Range AWD",310,250,75,NACS],[2019,"Model 3","Standard Range Plus",240,170,54,NACS],
    [2020,"Model 3","Standard Range Plus",250,170,54,NACS],[2020,"Model 3","Long Range AWD",322,250,75,NACS],
    [2021,"Model 3","Performance",315,250,78,NACS],[2022,"Model 3","Long Range AWD",358,250,79,NACS],
    [2023,"Model 3","Long Range AWD",333,250,79,NACS,"2023-tesla-model-3-long-range"],[2024,"Model 3","Long Range AWD",341,250,79,NACS],
    [2024,"Model 3","Performance",303,250,79,NACS],[2020,"Model Y","Long Range AWD",316,250,75,NACS],
    [2021,"Model Y","Performance",303,250,78,NACS],[2022,"Model Y","Long Range AWD",330,250,81,NACS,"2022-tesla-model-y-long-range"],
    [2022,"Model Y","Performance",303,250,81,NACS,"2022-tesla-model-y-performance"],[2023,"Model Y","Performance",303,250,81,NACS,"2023-tesla-model-y-performance"],
    [2024,"Model Y","Long Range AWD",310,250,81,NACS],[2025,"Model Y","Long Range AWD",320,250,81,NACS],
    [2020,"Model S","Long Range Plus",402,250,100,NACS],[2022,"Model S","Plaid",396,250,100,NACS],[2024,"Model S","Dual Motor",402,250,100,NACS],
    [2020,"Model X","Long Range Plus",351,250,100,NACS],[2022,"Model X","Plaid",333,250,100,NACS],[2024,"Model X","Dual Motor",335,250,100,NACS],
    [2024,"Cybertruck","All-Wheel Drive",325,250,123,NACS],[2024,"Cybertruck","Cyberbeast",301,250,123,NACS],
  ]),
  ...brand("Ford", [
    [2021,"Mustang Mach-E","Select RWD",230,115,68],[2021,"Mustang Mach-E","Premium Extended Range RWD",300,150,88],
    [2022,"Mustang Mach-E","GT",270,150,91],[2023,"Mustang Mach-E","Premium Extended Range AWD",290,150,91,CCS,"2023-ford-mach-e-premium-awd"],
    [2023,"Mustang Mach-E","GT",270,150,91,CCS,"2023-ford-mach-e-gt"],[2024,"Mustang Mach-E","Select RWD",250,150,72],
    [2024,"Mustang Mach-E","Premium Extended Range RWD",320,150,91],[2022,"F-150 Lightning","XLT Standard Range",240,120,98],
    [2022,"F-150 Lightning","Lariat Extended Range",320,155,131],[2023,"F-150 Lightning","Lariat Extended Range",320,155,131,CCS,"2023-ford-f150-lightning-lariat"],
    [2024,"F-150 Lightning","Flash Extended Range",320,155,131],[2024,"F-150 Lightning","Platinum",300,155,131],
  ]),
  ...brand("Rivian", [
    [2022,"R1T","Quad Motor Large Pack",314,220,135],[2023,"R1T","Dual Motor Large Pack",352,220,135],
    [2024,"R1T","Dual Motor Large Pack",352,220,135,CCS,"2024-rivian-r1t-dual-large"],[2024,"R1T","Dual Motor Max Pack",410,220,149],
    [2025,"R1T","Dual Standard",270,220,92],[2022,"R1S","Quad Motor Large Pack",316,220,135],
    [2023,"R1S","Dual Motor Large Pack",352,220,135],[2024,"R1S","Dual Motor Large Pack",352,220,135,CCS,"2024-rivian-r1s-dual-large"],
    [2024,"R1S","Dual Motor Max Pack",400,220,149],[2025,"R1S","Dual Standard",270,220,92],
  ]),
  ...brand("Chevrolet", [
    [2017,"Bolt EV","Premier",238,55,60],[2018,"Bolt EV","LT",238,55,60],[2019,"Bolt EV","Premier",238,55,60],
    [2020,"Bolt EV","LT",259,55,66],[2021,"Bolt EV","Premier",259,55,66],[2022,"Bolt EV","2LT",259,55,65],
    [2023,"Bolt EV","2LT",259,55,65,CCS,"2023-chevrolet-bolt-ev-2lt"],[2022,"Bolt EUV","LT",247,55,65],[2023,"Bolt EUV","Premier",247,55,65],
    [2024,"Blazer EV","LT AWD",279,190,102],[2024,"Blazer EV","RS RWD",324,190,102,CCS,"2024-chevrolet-blazer-ev-rs-rwd"],
    [2025,"Blazer EV","SS AWD",290,190,102],[2024,"Equinox EV","2LT FWD",319,150,85,CCS,"2024-chevrolet-equinox-ev-2lt"],
    [2024,"Equinox EV","3RS AWD",285,150,85],[2025,"Equinox EV","LT FWD",319,150,85],
    [2024,"Silverado EV","4WT",450,350,205],[2024,"Silverado EV","RST First Edition",440,350,205],
  ]),
  ...brand("Cadillac", [
    [2023,"Lyriq","Tech RWD",312,190,102],[2024,"Lyriq","Luxury RWD",314,190,102],[2024,"Lyriq","Sport AWD",307,190,102],
    [2025,"Optiq","Luxury AWD",300,150,85],[2025,"Escalade IQ","Luxury 1 AWD",450,350,200],[2026,"Vistiq","Luxury AWD",300,190,102],
    [2024,"Celestiq","AWD",300,200,111],
  ]),
  ...brand("GMC", [
    [2022,"Hummer EV Pickup","Edition 1",329,350,205],[2023,"Hummer EV Pickup","EV3X",355,350,205],
    [2024,"Hummer EV SUV","EV3X",314,300,170],[2024,"Sierra EV","Denali Edition 1",440,350,205],[2025,"Sierra EV","Denali Extended Range",390,350,170],
  ]),
  ...brand("Lucid", [
    [2022,"Air","Grand Touring",516,300,112],[2023,"Air","Pure AWD",410,250,92],[2024,"Air","Pure RWD",419,250,92,CCS,"2024-lucid-air-pure"],
    [2024,"Air","Touring AWD",411,300,112,CCS,"2024-lucid-air-touring"],[2024,"Air","Grand Touring",485,300,112],[2025,"Gravity","Grand Touring AWD",450,400,123,NACS],
  ]),
  ...brand("Hyundai", [
    [2019,"Kona Electric","Limited",258,77,64],
    [2021,"Kona Electric","SEL",258,77,64],[2022,"Kona Electric","Limited",258,77,64],[2023,"Kona Electric","Limited",258,77,64],[2024,"Kona Electric","SEL",261,100,64.8],
    [2022,"Ioniq 5","SE RWD",303,235,77.4],[2023,"Ioniq 5","Limited AWD",266,235,77.4],
    [2024,"Ioniq 5","SE RWD",303,235,77.4,CCS,"2024-hyundai-ioniq5-se-rwd"],[2024,"Ioniq 5","Limited AWD",260,235,77.4,CCS,"2024-hyundai-ioniq5-limited-awd"],
    [2025,"Ioniq 5","XRT AWD",259,235,84,NACS],[2023,"Ioniq 6","SE Long Range RWD",342,235,77.4],[2024,"Ioniq 6","Limited AWD",270,235,77.4],
    [2025,"Ioniq 6","SE Long Range RWD",342,235,77.4],[2026,"Ioniq 9","Long Range AWD",320,235,110.3,NACS],
  ]),
  ...brand("Kia", [
    [2019,"Niro EV","EX",239,77,64],
    [2020,"Niro EV","EX",239,77,64],[2022,"Niro EV","EX Premium",239,77,64],[2023,"Niro EV","Wave",253,85,64.8],[2024,"Niro EV","Wind",253,85,64.8],
    [2022,"EV6","Wind RWD",310,235,77.4],[2023,"EV6","GT-Line AWD",252,235,77.4],[2024,"EV6","Wind RWD",310,235,77.4,CCS,"2024-kia-ev6-wind-rwd"],
    [2024,"EV6","GT",218,235,77.4,CCS,"2024-kia-ev6-gt"],[2025,"EV6","GT-Line RWD",319,235,84,NACS],
    [2024,"EV9","Light Long Range RWD",304,210,99.8],[2024,"EV9","Land AWD",280,210,99.8],[2025,"EV9","GT-Line AWD",270,210,99.8],
  ]),
  ...brand("Nissan", [
    [2017,"Leaf","SV",107,50,30,LEAF],[2018,"Leaf","SV",151,50,40,LEAF],[2019,"Leaf","S Plus",226,100,62,LEAF],
    [2020,"Leaf","SV Plus",215,100,62,LEAF],[2021,"Leaf","S Plus",226,100,62,LEAF],[2022,"Leaf","SV Plus",215,100,62,LEAF],
    [2023,"Leaf","SV Plus",212,100,60,LEAF,"2023-nissan-leaf-sv-plus"],[2024,"Leaf","S",149,50,40,LEAF],
    [2023,"Ariya","Venture+ FWD",304,130,91],[2024,"Ariya","Venture+ FWD",304,130,91,CCS,"2024-nissan-ariya-venture-plus"],
    [2024,"Ariya","Platinum+ e-4ORCE",267,130,91],
  ]),
  ...brand("Genesis", [
    [2023,"GV60","Advanced AWD",248,235,77.4],[2024,"GV60","Performance AWD",235,235,77.4],
    [2023,"Electrified GV70","Advanced AWD",236,235,77.4],[2024,"Electrified GV70","Prestige AWD",236,235,77.4],
    [2023,"Electrified G80","AWD",282,187,87.2],[2024,"Electrified G80","Advanced AWD",282,187,87.2],
  ]),
  ...brand("Toyota", [[2023,"bZ4X","XLE FWD",252,150,71.4],[2023,"bZ4X","Limited AWD",222,100,72.8],[2024,"bZ4X","XLE FWD",252,150,71.4],[2024,"bZ4X","Limited AWD",222,100,72.8]]),
  ...brand("Subaru", [[2023,"Solterra","Premium AWD",228,100,72.8],[2023,"Solterra","Touring AWD",222,100,72.8],[2024,"Solterra","Premium AWD",227,100,72.8],[2024,"Solterra","Touring AWD",222,100,72.8]]),
  ...brand("Honda", [[2024,"Prologue","EX FWD",296,155,85],[2024,"Prologue","Touring AWD",281,155,85],[2025,"Prologue","Elite AWD",273,155,85]]),
  ...brand("Acura", [[2024,"ZDX","A-Spec RWD",313,190,102],[2024,"ZDX","A-Spec AWD",304,190,102],[2024,"ZDX","Type S AWD",278,190,102]]),
  ...brand("VinFast", [[2023,"VF 8","Eco AWD",264,160,87.7],[2024,"VF 8","Plus AWD",243,160,87.7],[2025,"VF 9","Eco AWD",330,160,123],[2025,"VF 9","Plus AWD",315,160,123]]),
  ...brand("Volkswagen", [
    [2021,"ID.4","Pro S RWD",250,125,82],[2022,"ID.4","Pro AWD",251,135,82],[2023,"ID.4","Pro S Plus AWD",255,170,82],
    [2024,"ID.4","Pro S RWD",275,175,82,CCS,"2024-volkswagen-id4-pro-s"],[2024,"ID.4","Pro S AWD",263,175,82],
    [2025,"ID. Buzz","Pro S RWD",234,200,91],[2025,"ID. Buzz","Pro S Plus AWD",231,200,91],
  ]),
  ...brand("BMW", [
    [2022,"i4","eDrive40",301,200,83.9],[2023,"i4","M50",271,205,83.9],[2024,"i4","eDrive40",301,205,83.9,CCS,"2024-bmw-i4-edrive40"],
    [2024,"i4","xDrive40",307,205,83.9],[2022,"iX","xDrive50",324,195,111.5],[2024,"iX","xDrive50",307,195,111.5,CCS,"2024-bmw-ix-xdrive50"],
    [2024,"iX","M60",285,195,111.5],[2024,"i5","eDrive40",295,205,84.3],[2024,"i5","M60 xDrive",256,205,84.3],[2024,"i7","xDrive60",317,195,105.7],
  ]),
  ...brand("Mercedes-Benz", [
    [2022,"EQS Sedan","450+",350,200,107.8],[2023,"EQS Sedan","580 4MATIC",340,200,107.8],[2023,"EQS SUV","450+",305,200,107.8],
    [2024,"EQS SUV","580 4MATIC",285,200,107.8],[2023,"EQE Sedan","350+",305,170,90.6],
    [2024,"EQE Sedan","350+",298,170,90.6,CCS,"2024-mercedes-eqe-350-plus"],[2024,"EQE SUV","350 4MATIC",253,170,90.6],
    [2022,"EQB","300 4MATIC",243,100,70.5],[2024,"EQB","250+",251,100,70.5],
  ]),
  ...brand("Audi", [
    [2019,"e-tron","Premium Plus",204,150,95],
    [2021,"e-tron","Premium Plus",222,150,95],[2022,"e-tron GT","Premium Plus",238,270,93.4],[2023,"Q4 e-tron","50 quattro",236,150,82],
    [2024,"Q4 e-tron","55 quattro",258,175,82,CCS,"2024-audi-q4-etron-55"],[2024,"Q8 e-tron","Premium quattro",285,170,114],
    [2024,"Q8 Sportback e-tron","Premium Plus",296,170,114],[2025,"Q6 e-tron","Premium quattro",307,270,100],
  ]),
  ...brand("Porsche", [
    [2020,"Taycan","4S",203,270,93.4],[2021,"Taycan","Turbo",212,270,93.4],[2022,"Taycan Cross Turismo","4",215,270,93.4],
    [2023,"Taycan","GTS",246,270,93.4],[2024,"Taycan","4S",252,270,93.4,CCS,"2024-porsche-taycan-4s"],
    [2024,"Taycan Cross Turismo","4S",235,270,93.4],[2024,"Macan Electric","4",308,270,100],[2024,"Macan Electric","Turbo",288,270,100],
  ]),
  ...brand("Polestar", [
    [2021,"2","Long Range Dual Motor",233,150,78],[2022,"2","Long Range Single Motor",270,155,78],[2023,"2","Long Range Dual Motor",260,155,78],
    [2024,"2","Long Range Single Motor",320,205,82,CCS,"2024-polestar-2-long-range"],[2024,"2","Long Range Dual Motor",276,205,82],
    [2025,"3","Long Range Dual Motor",315,250,111],[2025,"4","Long Range Single Motor",300,200,100],
  ]),
  ...brand("Volvo", [
    [2021,"XC40 Recharge","P8 AWD",208,150,78],[2022,"C40 Recharge","Twin AWD",226,150,78],[2023,"XC40 Recharge","Twin Ultimate AWD",223,150,78],
    [2024,"XC40 Recharge","Single Motor Extended Range",293,200,82],[2024,"C40 Recharge","Single Motor Extended Range",297,200,82],
    [2025,"EX30","Single Motor Extended Range",275,153,69],[2025,"EX30","Twin Motor Performance",265,153,69],[2025,"EX90","Twin Motor AWD",310,250,111],
    [2025,"EX40","Single Motor Extended Range",293,200,82],[2025,"EX40","Twin Motor AWD",254,200,82],
    [2025,"EC40","Single Motor Extended Range",297,200,82],[2025,"EC40","Twin Motor AWD",257,200,82],
  ]),
  ...brand("MINI", [[2020,"Cooper SE","Signature",110,50,32.6],[2021,"Cooper SE","Iconic",114,50,32.6],[2022,"Cooper SE","Signature Plus",114,50,32.6],[2024,"Cooper SE","Iconic",114,50,32.6],[2025,"Countryman Electric","SE ALL4",245,130,66.5]]),
  ...brand("Fiat", [[2024,"500e","INSPI(RED)",149,85,42],[2024,"500e","Inspired By Beauty",149,85,42],[2025,"500e","Inspired By Music",149,85,42]]),
  ...brand("Jaguar", [[2019,"I-PACE","HSE AWD",234,100,90],[2020,"I-PACE","SE AWD",234,100,90],[2021,"I-PACE","HSE AWD",234,100,90],[2022,"I-PACE","HSE AWD",222,100,90],[2024,"I-PACE","R-Dynamic HSE AWD",246,100,90]]),
];

const popularVehicleIds = [
  "2024-tesla-model-y-long-range-awd","2023-ford-mach-e-premium-awd","2024-hyundai-ioniq5-limited-awd",
  "2024-kia-ev6-wind-rwd","2024-rivian-r1t-dual-large","2024-chevrolet-equinox-ev-2lt",
  "2024-volkswagen-id4-pro-s","2023-nissan-leaf-sv-plus",
];

export function searchEVCatalog(query: string, limit = 8) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return popularVehicleIds.map(getCatalogVehicle).filter((vehicle): vehicle is EVCatalogEntry => Boolean(vehicle)).slice(0, limit);
  const terms = normalizedQuery.split(" ").filter(Boolean);
  return evCatalog
    .map((vehicle, index) => ({ vehicle, index, score: searchScore(vehicle, normalizedQuery, terms) }))
    .filter(result => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score || b.vehicle.year - a.vehicle.year || a.index - b.index)
    .slice(0, limit)
    .map(result => result.vehicle);
}

export function getCatalogVehicle(id: string | undefined) { return evCatalog.find(vehicle => vehicle.id === id); }
export function vehicleLabel(vehicle: Pick<EVCatalogEntry, "year" | "manufacturer" | "model" | "trim">) { return `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model} ${vehicle.trim}`; }
export function getCatalogYears() { return [...new Set(evCatalog.map(vehicle => vehicle.year))].sort((a, b) => b - a); }
export function getCatalogManufacturers(year: number) {
  return [...new Set(evCatalog.filter(vehicle => vehicle.year === year).map(vehicle => vehicle.manufacturer))].sort((a, b) => a.localeCompare(b));
}
export function getCatalogModels(year: number, manufacturer: string) {
  return [...new Set(evCatalog.filter(vehicle => vehicle.year === year && vehicle.manufacturer === manufacturer).map(vehicle => vehicle.model))].sort((a, b) => a.localeCompare(b));
}
export function getCatalogTrims(year: number, manufacturer: string, model: string) {
  return [...new Set(evCatalog.filter(vehicle => vehicle.year === year && vehicle.manufacturer === manufacturer && vehicle.model === model).map(vehicle => vehicle.trim))].sort((a, b) => a.localeCompare(b));
}
export function getCatalogVehicleBySelection(year: number, manufacturer: string, model: string, trim: string) {
  return evCatalog.find(vehicle => vehicle.year === year && vehicle.manufacturer === manufacturer && vehicle.model === model && vehicle.trim === trim);
}
export const evCatalogStats = {
  totalRecords: evCatalog.length,
  manufacturers: new Set(evCatalog.map(vehicle => vehicle.manufacturer)).size,
  uniqueModels: new Set(evCatalog.map(vehicle => `${vehicle.manufacturer}|${vehicle.model}`)).size,
  yearsRepresented: new Set(evCatalog.map(vehicle => vehicle.year)).size,
  earliestYear: Math.min(...evCatalog.map(vehicle => vehicle.year)),
  latestYear: Math.max(...evCatalog.map(vehicle => vehicle.year)),
};

function brand(manufacturer: string, rows: Row[]): EVCatalogEntry[] {
  return rows.map(([year, model, trim, estimatedRangeMiles, maxChargingSpeedKw, batteryCapacityKwh, connectors = CCS, id]) => ({
    id: id ?? slug(`${year}-${manufacturer}-${model}-${trim}`), year, manufacturer, model, trim,
    estimatedRangeMiles, maxChargingSpeedKw, batteryCapacityKwh, connectors, isPrototypeData: true,
  }));
}
function searchScore(vehicle: EVCatalogEntry, query: string, terms: string[]) {
  const label = normalize(vehicleLabel(vehicle));
  const makeModel = normalize(`${vehicle.manufacturer} ${vehicle.model}`);
  const model = normalize(vehicle.model);
  if (!terms.every(term => label.includes(term))) return Number.POSITIVE_INFINITY;
  if (label === query) return 0;
  if (makeModel === query || model === query) return 1;
  if (label.startsWith(query)) return 2;
  if (makeModel.startsWith(query) || model.startsWith(query)) return 3;
  if (label.includes(query)) return 4;
  return 5;
}
function normalize(value: string) {
  return value.toLowerCase().replace(/\bf\s*150\b/g, "f 150").replace(/\bid\s*\.?\s*4\b/g, "id 4").replace(/[^a-z0-9]+/g, " ").trim();
}
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
