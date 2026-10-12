"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Pencil, SlidersHorizontal } from "lucide-react";
import { CountryCard } from "@/components/CountryCard";
import { Disclaimer } from "@/components/Disclaimer";
import { StepBar } from "@/components/StepBar";
import { defaultProfile, formatCurrency, rankCountries } from "@/lib/matching";
import { loadComparison, loadProfile, saveComparison } from "@/lib/profile-storage";
import type { VeteranProfile } from "@/types";

export default function MatchesPage() {
  const [profile, setProfile] = useState<VeteranProfile>(defaultProfile);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => { setProfile(loadProfile()); setSelected(loadComparison()); }, []);
  const results = useMemo(() => rankCountries(profile), [profile]);
  const toggle = (slug: string) => {
    let next = selected.includes(slug) ? selected.filter(s=>s!==slug) : selected.length < 3 ? [...selected, slug] : selected;
    if (next === selected) { setNotice("Choose up to three countries. Remove one before adding another."); return; }
    setNotice(""); setSelected(next); saveComparison(next);
  };
  return <main className="min-h-screen bg-[#f6f7f3] pb-28"><StepBar active={1}/><section className="container-shell py-10 sm:py-14">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="eyebrow">Personalized for your profile</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f] sm:text-5xl">Your country matches.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-500">Ranked using your income, housing limit, savings goal, lifestyle preferences, and general residency feasibility.</p></div><Link href="/profile" className="btn-outline self-start"><Pencil size={15}/> Edit profile</Link></div>
    <div className="mt-8 grid gap-3 rounded-[22px] bg-[#17392f] p-5 text-white sm:grid-cols-4"><ProfileStat label="Monthly income" value={formatCurrency(profile.vaIncome+profile.otherIncome)}/><ProfileStat label="Savings goal" value={formatCurrency(profile.savingsGoal)}/><ProfileStat label="Housing max" value={formatCurrency(profile.housingBudget)}/><ProfileStat label="Preference" value={`${profile.region} · ${profile.climate}`}/></div>
    <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-[#799333]"/><p className="text-sm font-semibold text-slate-700">Best fit first · 5 demonstration destinations</p></div><p className="text-xs font-medium text-slate-400">Costs are illustrative monthly estimates</p></div>
    {notice && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">{notice}</p>}
    <div className="mt-6 grid gap-6 lg:grid-cols-2">{results.map(result=><CountryCard key={result.country.slug} result={result} selected={selected.includes(result.country.slug)} onToggle={()=>toggle(result.country.slug)}/>)}</div>
    <div className="mt-10"><Disclaimer/></div>
  </section>
  {selected.length > 0 && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-12px_40px_rgba(20,45,35,.1)] backdrop-blur-xl"><div className="container-shell flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#17392f]">{selected.length} countr{selected.length===1?"y":"ies"} selected</p><p className="hidden text-xs text-slate-400 sm:block">Choose up to three for a side-by-side view.</p></div><Link href="/compare" className="btn-lime">Compare selected <ArrowRight size={17}/></Link></div></div>}
  </main>;
}

function ProfileStat({label,value}:{label:string;value:string}) { return <div className="border-white/10 sm:border-r sm:last:border-r-0"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-white/45">{label}</p><p className="mt-1 truncate text-sm font-bold text-white sm:text-base">{value}</p></div>; }
