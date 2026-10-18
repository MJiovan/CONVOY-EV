"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BatteryCharging, Cable, CarFront, CheckCircle2, ChevronDown, Clock3, Gauge, LoaderCircle, MapPin, RefreshCw, Route, ShieldCheck, Zap } from "lucide-react";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { createSampleTrip } from "@/data/demo-route";
import { calculateGroupPlan, formatDuration } from "@/lib/group-planner";
import { loadTrip, saveTrip } from "@/lib/trip-storage";
import type { GroupChargingPlan, GroupChargingStop, GroupTrip } from "@/types";

export default function TripDashboardPage() {
  const [trip, setTrip] = useState<GroupTrip>(() => createSampleTrip());
  const [draftSoc, setDraftSoc] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = loadTrip();
      const initial = saved ?? createSampleTrip();
      setTrip(initial);
      setDraftSoc(Object.fromEntries(initial.vehicles.map(vehicle => [vehicle.id, vehicle.startingBatteryPercent])));
      setUsingDemo(!saved);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const plan = useMemo(() => calculateGroupPlan(trip), [trip]);
  const hasChanges = trip.vehicles.some(vehicle => draftSoc[vehicle.id] !== undefined && draftSoc[vehicle.id] !== vehicle.startingBatteryPercent);

  const recalculate = () => {
    if (!hasChanges || calculating) return;
    setCalculating(true);
    setFeedback([]);
    const next: GroupTrip = {
      ...trip,
      updatedAt: new Date().toISOString(),
      vehicles: trip.vehicles.map(vehicle => ({ ...vehicle, startingBatteryPercent: Math.max(1, Math.min(100, draftSoc[vehicle.id] ?? vehicle.startingBatteryPercent)) })),
    };
    const nextPlan = calculateGroupPlan(next);
    window.setTimeout(() => {
      setTrip(next);
      saveTrip(next);
      setUsingDemo(false);
      setFeedback(describeChanges(plan, nextPlan));
      setSelectedStop(null);
      setExpandedStops(new Set());
      setCalculating(false);
    }, 180);
  };

  const focusStop = (key: string) => {
    setSelectedStop(key);
    setExpandedStops(current => new Set(current).add(key));
    window.setTimeout(() => document.getElementById(`charging-stop-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  if (!ready) return <main className="min-h-screen bg-[#f4f7f8] py-20 text-center text-sm font-bold uppercase tracking-wider text-slate-400">Calculating the group route…</main>;

  return <main className="min-h-screen bg-[#f4f7f8] pb-16">
    <section className="bg-[#071119] text-white"><div className="container-shell py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#68d5ff]">Trip plan</p>{usingDemo && <DemoDataBadge inverse/>}</div><h1 className="mt-3 text-4xl font-extrabold tracking-[-.045em] sm:text-5xl">{trip.name}</h1><p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/55"><span className="inline-flex items-center gap-2"><MapPin size={15}/>{trip.startingLocation}</span><ArrowRight size={15}/><span>{trip.destination}</span></p></div><div className={`rounded-2xl border px-5 py-4 ${statusStyle(plan.groupStatus)}`}><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">Group status</p><p className="mt-1 text-xl font-extrabold">{plan.groupStatus}</p></div></div>
      <TripTimeline trip={trip} plan={plan} selectedStop={selectedStop} onSelect={focusStop}/>
    </div></section>

    <section className="container-shell py-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Route/>} label="Total distance" value={`${trip.totalDistanceMiles} mi`}/><Metric icon={<BatteryCharging/>} label="Shared stops" value={String(plan.stops.length)}/><Metric icon={<Clock3/>} label="Group charging" value={formatDuration(plan.totalChargingMinutes)}/><Metric icon={<Gauge/>} label="Current constraint" value={plan.constrainedVehicleName}/></div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_350px]"><div className="min-w-0 space-y-7">
        <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="eyebrow">Vehicles in the group</p><h2 className="mt-2 text-2xl font-extrabold text-[#10212b]">Update actual battery levels</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Select an EV to trace it through the plan, or adjust a battery level and recalculate.</p></div><a href="/trip/new" className="btn-outline self-start">Create different trip</a></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">{trip.vehicles.map(vehicle => {
            const focused = selectedVehicle === vehicle.id;
            const constrained = vehicle.id === plan.constrainedVehicleId;
            return <article key={vehicle.id} className={`rounded-2xl border p-5 transition-all ${focused ? "border-[#1683a8] bg-[#effaff] ring-2 ring-[#68d5ff]/30" : constrained ? "border-[#68d5ff] bg-[#effaff]" : "border-slate-200 bg-[#f9fbfc] hover:border-slate-300"}`}>
              <div className="flex items-start justify-between gap-3"><button type="button" aria-pressed={focused} onClick={() => setSelectedVehicle(current => current === vehicle.id ? null : vehicle.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#0e2835] text-[#b8ff5a] hover:scale-105" aria-label={`Highlight ${vehicle.nickname} throughout the plan`}><CarFront size={19}/></button>{constrained && <span className="rounded-full bg-[#dff5fc] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#0d7193]">Sets first stop</span>}</div>
              <button type="button" aria-pressed={focused} onClick={() => setSelectedVehicle(current => current === vehicle.id ? null : vehicle.id)} className="mt-5 text-left"><h3 className="text-lg font-extrabold text-[#10212b]">{vehicle.nickname}</h3><p className="text-sm text-slate-500">{vehicle.year} {vehicle.manufacturer} {vehicle.model}</p></button>
              <div className="mt-4 flex flex-wrap gap-2">{vehicle.connectors.map(connector => <span key={connector} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">{connector}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><MiniStat label="Range" value={`${vehicle.estimatedRangeMiles} mi`}/><MiniStat label="Max charge" value={`${vehicle.maxChargingSpeedKw} kW`}/></div>
              <label className="mt-5 block"><span className="flex items-center justify-between text-xs font-bold text-slate-600"><span>Expected: {vehicle.startingBatteryPercent}%</span><span className={draftSoc[vehicle.id] !== vehicle.startingBatteryPercent ? "text-[#1683a8]" : "text-slate-400"}>Actual: {draftSoc[vehicle.id] ?? vehicle.startingBatteryPercent}%</span></span><input aria-label={`${vehicle.nickname} actual battery`} type="range" min="1" max="100" value={draftSoc[vehicle.id] ?? vehicle.startingBatteryPercent} onChange={event => setDraftSoc(current => ({ ...current, [vehicle.id]: Number(event.target.value) }))} className="mt-3 w-full accent-[#1683a8]"/></label>
            </article>;
          })}</div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#0e2835] p-5 text-white sm:flex-row sm:items-center"><div><p className="text-sm font-bold">{calculating ? "Rebuilding the shared plan…" : hasChanges ? "Battery assumptions changed" : "Plan matches the displayed battery levels"}</p><p className="mt-1 text-xs text-white/45">The calculation preserves a 12% demonstration reserve.</p></div><button type="button" onClick={recalculate} disabled={!hasChanges || calculating} aria-busy={calculating} className="btn-electric w-full justify-center disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto">{calculating ? <LoaderCircle className="animate-spin" size={16}/> : <RefreshCw size={16}/>} {calculating ? "Calculating…" : "Recalculate Group Plan"}</button></div>
          {feedback.length > 0 && <div role="status" aria-live="polite" className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm font-extrabold text-emerald-800">Plan updated</p><ul className="mt-2 space-y-1 text-xs leading-5 text-emerald-700">{feedback.map(item => <li key={item}>• {item}</li>)}</ul></div>}
        </section>

        <section><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">One route, shared stops</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#10212b]">Group charging plan</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Select a timeline node to reveal its details. Group time equals the longest required vehicle session.</p></div>
          {plan.stops.length > 0 ? <div className="mt-6 space-y-5">{plan.stops.map((stop, index) => {
            const key = stopKey(stop, index);
            return <ChargingStopCard key={key} stop={stop} index={index} stopKey={key} selected={selectedStop === key} expanded={expandedStops.has(key)} selectedVehicle={selectedVehicle} onToggle={() => setExpandedStops(current => toggleSet(current, key))}/>;
          })}</div> : <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500"/><h3 className="mt-4 text-xl font-extrabold text-[#10212b]">No shared charging stop needed.</h3><p className="mt-2 text-sm text-slate-500">Every EV can reach the destination while keeping the demonstration reserve.</p></div>}
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start"><section className="rounded-[24px] bg-[#0e2835] p-6 text-white"><Gauge className="text-[#b8ff5a]"/><p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-[#68d5ff]">Current constraint</p><h2 className="mt-2 text-2xl font-extrabold">{plan.constrainedVehicleName}</h2><p className="mt-3 text-sm leading-6 text-white/60">{plan.summary}</p></section><CompatibilityPanel plan={plan}/><section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-700"/><div><h2 className="text-sm font-extrabold text-amber-950">Prototype planning only</h2><p className="mt-2 text-xs leading-5 text-amber-900/70">Stations, distances, availability, battery behavior, and charge curves are Demo Data. Verify a real trip with live routing and charging networks.</p></div></div></section></aside>
      </div>
    </section>
  </main>;
}

function TripTimeline({ trip, plan, selectedStop, onSelect }: { trip: GroupTrip; plan: GroupChargingPlan; selectedStop: string | null; onSelect: (key: string) => void }) {
  return <div className="mt-9 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#68d5ff]">Interactive trip timeline</p><p className="mt-1 text-xs text-white/45">Select a charging stop for its full breakdown.</p></div><DemoDataBadge inverse/></div><div className="overflow-x-auto pb-2"><div className="flex min-w-[680px] items-start">
    <TimelineEndpoint label={trip.startingLocation} start/>
    {plan.stops.map((stop, index) => {
      const previousDistance = index === 0 ? 0 : plan.stops[index - 1].station.distanceMiles;
      const segment = Math.max(0, stop.station.distanceMiles - previousDistance);
      const key = stopKey(stop, index);
      return <div key={key} className="contents"><TimelineSegment miles={segment}/><button type="button" onClick={() => onSelect(key)} aria-pressed={selectedStop === key} className={`group w-32 shrink-0 rounded-2xl p-2 text-center focus:outline-none focus:ring-2 focus:ring-[#b8ff5a] ${selectedStop === key ? "bg-white/10" : "hover:bg-white/5"}`}><span className={`mx-auto grid h-11 w-11 place-items-center rounded-full border-4 border-[#071119] transition-transform group-hover:scale-105 ${selectedStop === key ? "bg-white text-[#071119] ring-2 ring-[#b8ff5a]" : "bg-[#b8ff5a] text-[#071119]"}`}><Zap size={18} fill="currentColor"/></span><span className="mt-2 block truncate text-xs font-extrabold text-white">{stop.station.name}</span><span className="mt-0.5 block text-[10px] text-white/45">{stop.groupStopMinutes} min stop</span></button></div>;
    })}
    <TimelineSegment miles={Math.max(0, trip.totalDistanceMiles - (plan.stops.at(-1)?.station.distanceMiles ?? 0))}/><TimelineEndpoint label={trip.destination}/>
  </div></div></div>;
}

function TimelineEndpoint({ label, start = false }: { label: string; start?: boolean }) { return <div className="w-28 shrink-0 text-center"><span className={`mx-auto block h-11 w-11 rounded-full border-4 border-[#071119] ${start ? "bg-[#68d5ff]" : "bg-white"}`}/><span className="mt-2 block truncate text-xs font-extrabold text-white">{label}</span><span className="mt-0.5 block text-[10px] text-white/40">{start ? "Start" : "Destination"}</span></div>; }
function TimelineSegment({ miles }: { miles: number }) { return <div className="mt-5 min-w-14 flex-1"><div className="h-1 bg-gradient-to-r from-[#68d5ff] to-[#b8ff5a]"/><p className="mt-2 text-center text-[10px] font-bold text-white/45">{miles} mi</p></div>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-[#1683a8] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-xl font-extrabold text-[#10212b]">{value}</p></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold text-[#10212b]">{value}</p></div>; }

function ChargingStopCard({ stop, index, stopKey: key, selected, expanded, selectedVehicle, onToggle }: { stop: GroupChargingStop; index: number; stopKey: string; selected: boolean; expanded: boolean; selectedVehicle: string | null; onToggle: () => void }) {
  const paceSetter = stop.vehiclePlans.find(vehicle => vehicle.vehicleId === stop.constrainedVehicleId);
  return <article id={`charging-stop-${key}`} className={`scroll-mt-28 overflow-hidden rounded-[26px] border bg-white shadow-sm transition-all ${selected ? "border-[#1683a8] ring-4 ring-[#68d5ff]/20" : stop.compatibleWithAllVehicles ? "border-slate-200 hover:border-slate-300" : "border-rose-300"}`}>
    <div className="grid gap-5 bg-[#0e2835] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#68d5ff]">{index === 0 && stop.station.distanceMiles === 0 ? "Before departure" : `Group charging stop ${index + 1}`}</p><DemoDataBadge inverse/></div><h3 className="mt-2 text-2xl font-extrabold">{stop.station.name}</h3><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/65"><span>Next leg <b className="text-white">{stop.nextLegMiles} mi</b></span><span>Sets duration <b className="text-white">{paceSetter?.nickname ?? "Group"}</b></span><span>At mile <b className="text-white">{stop.station.distanceMiles}</b></span></div></div><div className="rounded-2xl bg-[#b8ff5a] px-5 py-4 text-[#071119]"><p className="text-[9px] font-extrabold uppercase tracking-wider opacity-55">Group stop time</p><p className="mt-1 text-2xl font-extrabold">{stop.groupStopMinutes} min</p></div></div>
    <div className="p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{stop.station.connectors.map(connector => <span key={connector} className="inline-flex items-center gap-1 rounded-full bg-[#e8f7fc] px-2.5 py-1 text-[10px] font-bold text-[#0e7193]"><Cable size={11}/>{connector}</span>)}</div><button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={`stop-details-${key}`} className="btn-outline py-2 text-xs">{expanded ? "Hide vehicle details" : "Show vehicle details"}<ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`}/></button></div>
      <div id={`stop-details-${key}`} aria-hidden={!expanded} className={`grid transition-[grid-template-rows,opacity] duration-200 ${expanded ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400"><th className="pb-3">Vehicle</th><th className="pb-3">Arrival</th><th className="pb-3">Required departure</th><th className="pb-3">Charge time</th><th className="pb-3">Connector</th></tr></thead><tbody>{stop.vehiclePlans.map(vehicle => {
        const focused = selectedVehicle === vehicle.vehicleId;
        return <tr key={vehicle.vehicleId} className={`border-b border-slate-100 transition-colors last:border-0 ${focused ? "bg-[#e8f7fc]" : vehicle.vehicleId === stop.constrainedVehicleId && stop.groupStopMinutes > 0 ? "bg-[#f7fce8]" : selectedVehicle ? "opacity-55" : ""}`}><td className="py-4 pl-2"><p className="text-sm font-extrabold text-[#10212b]">{vehicle.nickname}</p><p className="text-xs text-slate-400">{vehicle.vehicleLabel}</p>{vehicle.vehicleId === stop.constrainedVehicleId && stop.groupStopMinutes > 0 && <span className="mt-1 inline-block text-[9px] font-extrabold uppercase tracking-wider text-[#5b7d1d]">Sets group time</span>}</td><td className="py-4 text-sm font-bold text-slate-600">{vehicle.arrivalBatteryPercent}%</td><td className={`py-4 text-sm font-extrabold ${vehicle.feasible ? "text-[#137da3]" : "text-rose-600"}`}>{vehicle.departureBatteryPercent}%</td><td className="py-4 text-sm font-extrabold text-[#10212b]">{vehicle.chargeNeeded ? `${vehicle.estimatedChargingMinutes} min` : <span className="text-emerald-700">No charge needed</span>}</td><td className="py-4"><span className={`text-xs font-bold ${vehicle.connectorCompatible ? "text-emerald-600" : "text-rose-600"}`}>{vehicle.connectorCompatible ? "Compatible" : "Unavailable"}</span></td></tr>;
      })}</tbody></table></div><p className="mt-4 rounded-xl bg-[#f4f7f8] p-4 text-xs leading-5 text-slate-600">{stop.reason}</p></div></div>
    </div>
  </article>;
}

function CompatibilityPanel({ plan }: { plan: GroupChargingPlan }) { return <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8e7] text-[#4f8a24]"><ShieldCheck size={19}/></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compatibility scan</p><h2 className="text-lg font-extrabold text-[#10212b]">{plan.compatibilityWarnings.length} station warning{plan.compatibilityWarnings.length === 1 ? "" : "s"}</h2></div></div>{plan.compatibilityWarnings.length ? <div className="mt-5 space-y-3">{plan.compatibilityWarnings.map(warning => <div key={`${warning.stationName}-${warning.distanceMiles}`} className="rounded-xl border border-amber-100 bg-amber-50 p-3"><p className="text-xs font-extrabold text-amber-900">{warning.stationName} · mile {warning.distanceMiles}</p><p className="mt-1 text-[11px] leading-4 text-amber-800/70">{warning.message}</p></div>)}</div> : <p className="mt-4 text-sm leading-6 text-slate-500">Every mock station on this route supports at least one connector for each EV.</p>}</section>; }

function stopKey(stop: GroupChargingStop, index: number) { return `${stop.station.id}-${index}`; }
function toggleSet(current: Set<string>, key: string) { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; }
function statusStyle(status: GroupChargingPlan["groupStatus"]) { return status === "Route blocked" ? "border-rose-400/30 bg-rose-400/10" : status === "Review needed" ? "border-amber-300/30 bg-amber-300/10" : "border-[#b8ff5a]/30 bg-[#b8ff5a]/10"; }
function describeChanges(previous: GroupChargingPlan, next: GroupChargingPlan) {
  const changes: string[] = [];
  changes.push(previous.constrainedVehicleId === next.constrainedVehicleId ? `Constraint remains ${next.constrainedVehicleName}.` : `Constraint changed from ${previous.constrainedVehicleName} to ${next.constrainedVehicleName}.`);
  const previousStops = previous.stops.map(stop => stop.station.id).join("|");
  const nextStops = next.stops.map(stop => stop.station.id).join("|");
  changes.push(previousStops === nextStops ? `Shared stops remain at ${next.stops.length}.` : `Shared stops changed from ${previous.stops.length} to ${next.stops.length}.`);
  const delta = next.totalChargingMinutes - previous.totalChargingMinutes;
  changes.push(delta === 0 ? `Group charging time remains ${formatDuration(next.totalChargingMinutes)}.` : `Group charging time ${delta > 0 ? "increased" : "decreased"} by ${formatDuration(Math.abs(delta))} to ${formatDuration(next.totalChargingMinutes)}.`);
  return changes;
}
