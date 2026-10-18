"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BatteryCharging, CarFront, Clock3, MapPin, Plus, Route, UsersRound } from "lucide-react";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { loadTrip } from "@/lib/trip-storage";
import type { GroupTrip } from "@/types";

export default function DashboardPage() {
  const [savedTrip, setSavedTrip] = useState<GroupTrip | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { setSavedTrip(loadTrip()); setReady(true); }, 0); return () => window.clearTimeout(timer); }, []);

  return <main className="min-h-screen bg-[#f4f7f8] pb-20">
    <section className="bg-[#071119] text-white"><div className="container-shell py-14 sm:py-20">
      <p className="text-xs font-bold uppercase tracking-[.17em] text-[#68d5ff]">Convoy dashboard</p>
      <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><h1 className="max-w-3xl text-4xl font-extrabold tracking-[-.045em] sm:text-6xl">Plan one route for every EV in the group.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/60">Add each vehicle and starting battery. CONVOY EV calculates compatible shared stops and an individual charging target for every driver.</p></div><a href="/trip/new" className="btn-electric self-start px-7 py-4 text-base"><Plus size={18}/>New group trip</a></div>
    </div></section>

    <section className="container-shell py-9"><div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Recent trip</p><h2 className="mt-2 text-2xl font-extrabold text-[#10212b]">{savedTrip ? savedTrip.name : "No saved trip yet"}</h2></div>{savedTrip && <DemoDataBadge/>}</div>
        {!ready ? <p className="mt-8 text-sm text-slate-400">Loading saved trip…</p> : savedTrip ? <><p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"><MapPin size={15}/>{savedTrip.startingLocation}<ArrowRight size={14}/>{savedTrip.destination}</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3"><DashboardStat icon={<Route/>} label="Distance" value={`${savedTrip.totalDistanceMiles} mi`}/><DashboardStat icon={<UsersRound/>} label="Group" value={`${savedTrip.vehicles.length} EVs`}/><DashboardStat icon={<Clock3/>} label="Updated" value={new Date(savedTrip.updatedAt).toLocaleDateString()}/></div><a href="/trip" className="btn-dark mt-7">Open trip plan <ArrowRight size={16}/></a></> : <><p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">Start a group trip to save it on this device and return to its charging plan later.</p><a href="/trip/new" className="btn-dark mt-7">Create your first trip <ArrowRight size={16}/></a></>}
      </section>
      <section className="rounded-[28px] bg-[#0e2835] p-6 text-white sm:p-8"><BatteryCharging className="text-[#b8ff5a]"/><p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#68d5ff]">What CONVOY EV does</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">Shared stops. Individual targets.</h2><p className="mt-4 text-sm leading-7 text-white/60">The shortest safe driving buffer determines when the convoy stops. At each shared station, every EV receives only the charge it needs for the next leg.</p><div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b8ff5a] text-[#071119]"><CarFront size={19}/></span><p className="text-sm font-bold">Local prototype planning with clearly labeled Demo Data</p></div></section>
    </div></section>
  </main>;
}

function DashboardStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-[#f4f7f8] p-4"><span className="text-[#1683a8] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold text-[#10212b]">{value}</p></div>; }
