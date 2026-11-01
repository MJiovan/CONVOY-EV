"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BatteryCharging, Cable, CarFront, ChevronDown, LoaderCircle, MapPin, Plus, RotateCcw, Route, Search, Trash2, UsersRound } from "lucide-react";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { connectorTypes, createSampleTrip } from "@/data/demo-route";
import { demoVehicleSpecificationProvider } from "@/providers/demo/vehicle-provider";
import { saveTrip } from "@/lib/trip-storage";
import { effectiveVehicleSpecs, vehicleDisplayName, vehicleFromCatalog } from "@/lib/vehicle-specs";
import { getProviderSet } from "@/providers";
import { RoutePlanningError } from "@/providers/live/openrouteservice-provider";
import { RouteValidationError, validateRouteRequest } from "@/lib/route-validation";
import type { ConnectorType, EVCatalogEntry, EVVehicle, GroupTrip, PlannedRoute } from "@/types";

const vehicleSpecifications = demoVehicleSpecificationProvider;

export default function NewTripPage() {
  const router = useRouter();
  const [trip, setTrip] = useState<GroupTrip>(() => createSampleTrip());
  const [notice, setNotice] = useState("");
  const [routing, setRouting] = useState(false);
  const [demoFallbackAvailable, setDemoFallbackAvailable] = useState(false);
  const updateTrip = (key: "name" | "startingLocation" | "destination", value: string) => {
    setTrip(current => ({ ...current, [key]: value, ...(key === "startingLocation" || key === "destination" ? { route: undefined } : {}) }));
    if (key === "startingLocation" || key === "destination") {
      setNotice("");
      setDemoFallbackAvailable(false);
    }
  };
  const replaceVehicle = (next: EVVehicle) => setTrip(current => ({ ...current, vehicles: current.vehicles.map(vehicle => vehicle.id === next.id ? next : vehicle) }));
  const addVehicle = () => setTrip(current => ({ ...current, vehicles: [...current.vehicles, blankVehicle(current.vehicles.length + 1)] }));
  const removeVehicle = (id: string) => {
    if (trip.vehicles.length <= 2) return setNotice("A group trip needs at least two EVs.");
    setNotice("");
    setTrip(current => ({ ...current, vehicles: current.vehicles.filter(vehicle => vehicle.id !== id) }));
  };
  const savePreparedTrip = (route?: PlannedRoute) => {
    const now = new Date().toISOString();
    saveTrip({
      ...trip,
      id: `trip-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      route,
      totalDistanceMiles: route?.totalDistanceMiles ?? Math.max(25, trip.totalDistanceMiles),
    });
    router.push("/trip");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (trip.vehicles.some(vehicle => !vehicle.catalogVehicleId)) return setNotice("Select a catalog vehicle for every driver.");
    if (trip.vehicles.some(vehicle => effectiveVehicleSpecs(vehicle).connectors.length === 0)) return setNotice("Choose at least one connector for every EV.");
    try {
      validateRouteRequest({ originLabel: trip.startingLocation, destinationLabel: trip.destination });
    } catch (error) {
      if (error instanceof RouteValidationError) return setNotice(error.message);
      return setNotice("Check the starting location and destination.");
    }
    setNotice("");
    setDemoFallbackAvailable(false);
    setRouting(true);
    try {
      const route = await getProviderSet("live").routePlanning.planRoute({ originLabel: trip.startingLocation, destinationLabel: trip.destination });
      savePreparedTrip(route);
    } catch (error) {
      const message = error instanceof RoutePlanningError ? error.message : "Real-world routing is temporarily unavailable.";
      setNotice(`${message} No trip was saved yet.`);
      setDemoFallbackAvailable(true);
    } finally {
      setRouting(false);
    }
  };

  return <main className="min-h-screen bg-[#f4f7f8] pb-16">
    <section className="border-b border-slate-200 bg-white"><div className="container-shell py-9">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#10212b]"><ArrowLeft size={16}/>Back to dashboard</Link>
      <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow">New group trip</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.04em] text-[#10212b] sm:text-5xl">Build your EV convoy.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-500">Choose each EV from the prototype catalog, add its starting battery, and let CONVOY EV load the planning specifications.</p></div><div className="rounded-2xl bg-[#071119] px-5 py-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Group size</p><p className="mt-1 text-2xl font-extrabold text-[#b8ff5a]">{trip.vehicles.length} EVs</p></div></div>
    </div></section>

    <form onSubmit={submit} className="container-shell py-8">
      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionHeading icon={<MapPin/>} step="01" title="Where is the group going?" copy="Enter the locations and CONVOY EV will calculate the road distance and estimated drive time before building the charging plan."/><div className="mt-7 grid gap-5 md:grid-cols-2"><TextField label="Trip name" ariaLabel="Trip name" value={trip.name} onChange={value => updateTrip("name", value)}/><div className="flex items-center gap-3 rounded-2xl border border-[#ccecf7] bg-[#f2fbfe] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dff5fc] text-[#137da3]"><Route size={19}/></span><div><p className="text-sm font-extrabold text-[#10212b]">Automatic road routing</p><p className="mt-1 text-xs text-slate-500">Distance, drive time, and route geometry via openrouteservice</p></div></div><TextField label="Starting location" ariaLabel="Starting location" value={trip.startingLocation} onChange={value => updateTrip("startingLocation", value)}/><TextField label="Destination" ariaLabel="Destination" value={trip.destination} onChange={value => updateTrip("destination", value)}/></div></section>

      <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><SectionHeading icon={<UsersRound/>} step="02" title="Who&apos;s driving with you?" copy="Choose each EV by year, make, model, and trim. Catalog values remain editable for real-world planning conditions."/><div className="mt-3 flex items-center gap-2"><DemoDataBadge/><span className="text-xs text-slate-400">Local prototype EV specifications—not live vehicle data</span></div></div><button type="button" onClick={addVehicle} className="btn-outline self-start"><Plus size={16}/>Add another EV</button></div>
        <div className="mt-7 space-y-5">{trip.vehicles.map((vehicle, index) => <VehicleEditor key={vehicle.id} vehicle={vehicle} index={index} canRemove={trip.vehicles.length > 2} onChange={replaceVehicle} onRemove={() => removeVehicle(vehicle.id)}/>)}</div>
      </section>

      {notice && <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"><p>{notice}</p>{demoFallbackAvailable && <button type="button" onClick={() => savePreparedTrip()} className="btn-dark mt-4">Continue with {trip.totalDistanceMiles}-mile Demo Route <ArrowRight size={16}/></button>}</div>}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-[#0e2835] p-6 text-white sm:flex-row sm:items-center"><div><p className="text-sm font-bold">Ready to calculate one shared plan?</p><p className="mt-1 text-xs text-white/50">The route is calculated first, then the most constrained EV determines the shared charging plan.</p></div><button type="submit" disabled={routing} aria-busy={routing} className="btn-electric w-full justify-center disabled:cursor-wait disabled:opacity-70 sm:w-auto">{routing ? <LoaderCircle className="animate-spin" size={17}/> : <ArrowRight size={17}/>} {routing ? "Calculating road route…" : "Create group charging plan"}</button></div>
    </form>
  </main>;
}

function VehicleEditor({ vehicle, index, canRemove, onChange, onRemove }: { vehicle: EVVehicle; index: number; canRemove: boolean; onChange: (vehicle: EVVehicle) => void; onRemove: () => void }) {
  const initialCatalogVehicle = vehicleSpecifications.getVehicle(vehicle.catalogVehicleId);
  const [year, setYear] = useState(initialCatalogVehicle?.year ? String(initialCatalogVehicle.year) : "");
  const [manufacturer, setManufacturer] = useState(initialCatalogVehicle?.manufacturer ?? "");
  const [model, setModel] = useState(initialCatalogVehicle?.model ?? "");
  const [trim, setTrim] = useState(initialCatalogVehicle?.trim ?? "");
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState(vehicle.catalogVehicleId ? vehicleDisplayName(vehicle) : "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingSpecs, setEditingSpecs] = useState(Boolean(vehicle.planningOverrides));
  const results = useMemo(() => vehicleSpecifications.searchVehicles(query), [query]);
  const years = useMemo(() => vehicleSpecifications.getYears(), []);
  const manufacturers = useMemo(() => year ? vehicleSpecifications.getManufacturers(Number(year)) : [], [year]);
  const models = useMemo(() => year && manufacturer ? vehicleSpecifications.getModels(Number(year), manufacturer) : [], [year, manufacturer]);
  const trims = useMemo(() => year && manufacturer && model ? vehicleSpecifications.getTrims(Number(year), manufacturer, model) : [], [year, manufacturer, model]);
  const specs = effectiveVehicleSpecs(vehicle);
  const selectVehicle = (entry: EVCatalogEntry) => {
    const next = vehicleFromCatalog(entry, vehicle);
    onChange(next);
    setYear(String(entry.year));
    setManufacturer(entry.manufacturer);
    setModel(entry.model);
    setTrim(entry.trim);
    setQuery(vehicleSpecifications.labelVehicle(entry));
    setOpen(false);
    setActiveIndex(0);
    setEditingSpecs(false);
  };
  const clearCatalogVehicle = () => {
    onChange({ ...vehicle, catalogVehicleId: undefined, year: undefined, manufacturer: "", model: "", trim: undefined, estimatedRangeMiles: 240, maxChargingSpeedKw: 150, batteryCapacityKwh: undefined, connectors: [], planningOverrides: undefined });
    setQuery("");
    setOpen(false);
    setEditingSpecs(false);
  };
  const chooseYear = (value: string) => {
    setYear(value);
    setManufacturer("");
    setModel("");
    setTrim("");
    clearCatalogVehicle();
  };
  const chooseManufacturer = (value: string) => {
    setManufacturer(value);
    setModel("");
    setTrim("");
    clearCatalogVehicle();
  };
  const chooseModel = (value: string) => {
    setModel(value);
    setTrim("");
    clearCatalogVehicle();
  };
  const chooseTrim = (value: string) => {
    setTrim(value);
    const entry = vehicleSpecifications.getVehicleBySelection(Number(year), manufacturer, model, value);
    if (entry) selectVehicle(entry);
    else clearCatalogVehicle();
  };
  const updateOverride = (key: "estimatedRangeMiles" | "maxChargingSpeedKw", value: number) => onChange({ ...vehicle, [key]: value, planningOverrides: { ...vehicle.planningOverrides, [key]: value } });
  const toggleConnector = (connector: ConnectorType) => {
    const current = effectiveVehicleSpecs(vehicle).connectors;
    const connectors = current.includes(connector) ? current.filter(item => item !== connector) : [...current, connector];
    onChange({ ...vehicle, connectors, planningOverrides: { ...vehicle.planningOverrides, connectors } });
  };
  const resetOverrides = () => {
    const catalogVehicle = vehicleSpecifications.getVehicle(vehicle.catalogVehicleId);
    onChange(catalogVehicle ? vehicleFromCatalog(catalogVehicle, vehicle) : { ...vehicle, planningOverrides: undefined });
    setEditingSpecs(false);
  };
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex(current => Math.min(results.length - 1, current + 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex(current => Math.max(0, current - 1)); }
    if (event.key === "Enter" && open && results[activeIndex]) { event.preventDefault(); selectVehicle(results[activeIndex]); }
    if (event.key === "Escape") setOpen(false);
  };

  return <article className="rounded-2xl border border-slate-200 bg-[#f9fbfc] p-5 sm:p-6">
    <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f7fd] text-[#137da3]"><CarFront size={20}/></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle {String(index + 1).padStart(2, "0")}</p><p className="text-sm font-extrabold text-[#10212b]">{vehicle.nickname || "Unnamed driver"}</p></div></div><button type="button" onClick={onRemove} disabled={!canRemove} aria-label={`Remove ${vehicle.nickname || `vehicle ${index + 1}`}`} className="rounded-full p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={17}/></button></div>
    <div className="mt-5"><TextField label="Driver or vehicle nickname" ariaLabel={`Vehicle ${index + 1} nickname`} value={vehicle.nickname} onChange={nickname => onChange({ ...vehicle, nickname })}/></div>
    <div className="mt-5 flex items-center justify-between gap-3"><p className="field-label">Your EV</p><button type="button" onClick={() => { setSearchMode(value => !value); setOpen(false); }} className="inline-flex items-center gap-2 text-xs font-bold text-[#137da3] hover:text-[#0d607e]"><Search size={14}/>{searchMode ? "Use guided selection" : "Search instead"}</button></div>
    {!searchMode ? <div className="mt-3 grid gap-4 sm:grid-cols-2">
      <CatalogSelect id={`${vehicle.id}-year`} label="Year" value={year} placeholder="Select year" options={years.map(String)} onChange={chooseYear}/>
      <CatalogSelect id={`${vehicle.id}-make`} label="Make" value={manufacturer} placeholder={year ? "Select make" : "Choose year first"} options={manufacturers} disabled={!year} onChange={chooseManufacturer}/>
      <CatalogSelect id={`${vehicle.id}-model`} label="Model" value={model} placeholder={manufacturer ? "Select model" : "Choose make first"} options={models} disabled={!manufacturer} onChange={chooseModel}/>
      <CatalogSelect id={`${vehicle.id}-trim`} label="Trim" value={trim} placeholder={model ? "Select trim" : "Choose model first"} options={trims} disabled={!model} onChange={chooseTrim}/>
    </div> : <div className="relative mt-3"><label htmlFor={`${vehicle.id}-search`} className="sr-only">Search EV catalog</label><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input id={`${vehicle.id}-search`} role="combobox" aria-expanded={open} aria-controls={`${vehicle.id}-results`} aria-activedescendant={open && results[activeIndex] ? `${vehicle.id}-option-${activeIndex}` : undefined} autoComplete="off" className="field-input pl-11 pr-10" placeholder="Search year, make, model, or trim..." value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }} onKeyDown={onSearchKeyDown}/><ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/></div>{open && <div id={`${vehicle.id}-results`} role="listbox" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{results.length ? results.map((entry, resultIndex) => <button id={`${vehicle.id}-option-${resultIndex}`} role="option" aria-selected={activeIndex === resultIndex} key={entry.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => selectVehicle(entry)} className={`w-full rounded-xl px-4 py-3 text-left ${activeIndex === resultIndex ? "bg-[#e8f7fc]" : "hover:bg-slate-50"}`}><span className="block text-sm font-extrabold text-[#10212b]">{entry.year} {entry.manufacturer} {entry.model}</span><span className="mt-0.5 block text-xs text-slate-500">{entry.trim}</span></button>) : <p className="px-4 py-5 text-center text-sm text-slate-500">No catalog vehicles match that search.</p>}</div>}</div>}

    {vehicle.catalogVehicleId ? <div className="mt-5 rounded-2xl border border-[#ccecf7] bg-white p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-[#1683a8]">Selected vehicle</p><DemoDataBadge/></div><h3 className="mt-2 text-lg font-extrabold text-[#10212b]">{vehicleDisplayName(vehicle)}</h3></div>{specs.isOverridden && <span className="self-start rounded-full bg-amber-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Custom planning specs</span>}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Spec icon={<CarFront/>} label="Range" value={`${specs.estimatedRangeMiles} mi`}/><Spec icon={<BatteryCharging/>} label="Max DC charge" value={`${specs.maxChargingSpeedKw} kW`}/><Spec icon={<Cable/>} label="Connector" value={specs.connectors.join(" + ")}/><Spec icon={<BatteryCharging/>} label="Battery estimate" value={`${vehicle.batteryCapacityKwh ?? "—"} kWh`}/></div><div className="mt-5 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-end"><NumberField label="Starting battery" ariaLabel={`${vehicle.nickname} starting battery`} value={vehicle.startingBatteryPercent} suffix="%" min={1} max={100} onChange={startingBatteryPercent => onChange({ ...vehicle, startingBatteryPercent })}/><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setEditingSpecs(value => !value)} className="btn-outline">Edit planning specs</button>{specs.isOverridden && <button type="button" onClick={resetOverrides} className="inline-flex items-center gap-2 px-2 py-3 text-xs font-bold text-slate-500 hover:text-[#10212b]"><RotateCcw size={14}/>Use catalog values</button>}</div></div>
      {editingSpecs && <div className="mt-5 rounded-2xl bg-[#f4f7f8] p-5"><p className="text-xs leading-5 text-slate-500">Adjust for weather, degradation, towing, wheels, adapters, or vehicle-specific knowledge. These values feed directly into the group planner.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField label="Planning range" ariaLabel={`${vehicle.nickname} planning range override`} value={specs.estimatedRangeMiles} suffix="miles" min={40} onChange={value => updateOverride("estimatedRangeMiles", value)}/><NumberField label="Maximum charging speed" ariaLabel={`${vehicle.nickname} charging speed override`} value={specs.maxChargingSpeedKw} suffix="kW" min={3} onChange={value => updateOverride("maxChargingSpeedKw", value)}/></div><div className="mt-4"><span className="field-label">Connector compatibility</span><div className="mt-2 flex flex-wrap gap-2">{connectorTypes.map(connector => { const selected = specs.connectors.includes(connector); return <button key={connector} type="button" aria-pressed={selected} onClick={() => toggleConnector(connector)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${selected ? "border-[#1683a8] bg-[#e6f7fd] text-[#0d6d8e]" : "border-slate-200 bg-white text-slate-500"}`}><Cable size={13}/>{connector}</button>; })}</div></div></div>}
    </div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">Choose the year, make, model, and trim to load its planning specifications.</div>}
  </article>;
}

function CatalogSelect({ id, label, value, placeholder, options, disabled = false, onChange }: { id: string; label: string; value: string; placeholder: string; options: string[]; disabled?: boolean; onChange: (value: string) => void }) {
  return <label htmlFor={id}><span className="field-label">{label}</span><span className="relative mt-2 block"><select id={id} aria-label={label} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className="field-input appearance-none pr-11 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><option value="">{placeholder}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/></span></label>;
}

function blankVehicle(position: number): EVVehicle { return { id: `ev-${Date.now()}-${position}`, nickname: `Driver ${position}`, manufacturer: "", model: "", estimatedRangeMiles: 240, startingBatteryPercent: 75, maxChargingSpeedKw: 150, connectors: [] }; }
function SectionHeading({ icon, step, title, copy }: { icon: React.ReactNode; step: string; title: string; copy: string }) { return <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e6f7fd] text-[#137da3] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#1683a8]">Step {step}</p><h2 className="mt-1 text-xl font-extrabold text-[#10212b]">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{copy}</p></div></div>; }
function TextField({ label, ariaLabel, value, onChange }: { label: string; ariaLabel: string; value: string; onChange: (value: string) => void }) { return <label><span className="field-label">{label}</span><input aria-label={ariaLabel} className="field-input mt-2" value={value} onChange={event => onChange(event.target.value)} required/></label>; }
function NumberField({ label, ariaLabel, value, suffix, min, max, onChange }: { label: string; ariaLabel: string; value: number; suffix: string; min: number; max?: number; onChange: (value: number) => void }) {
  const commitValue = (input: HTMLInputElement) => {
    const parsed = Number(input.value);
    const safeValue = Number.isFinite(parsed) ? Math.max(min, Math.min(max ?? Number.MAX_SAFE_INTEGER, parsed)) : min;
    input.value = String(safeValue);
    onChange(safeValue);
  };
  return <label><span className="field-label">{label}</span><span className="relative mt-2 block"><input aria-label={ariaLabel} className="field-input pr-16" type="number" min={min} max={max} value={value} onInput={event => commitValue(event.currentTarget)} onBlur={event => commitValue(event.currentTarget)}/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{suffix}</span></span></label>;
}
function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-xl bg-[#f4f7f8] p-3"><span className="text-[#1683a8] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold text-[#10212b]">{value}</p></div>; }
