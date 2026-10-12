"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Banknote, CloudSun, HeartPulse, Languages, Map, Wifi } from "lucide-react";
import { StepBar } from "@/components/StepBar";
import { Disclaimer } from "@/components/Disclaimer";
import { defaultProfile, formatCurrency } from "@/lib/matching";
import { loadProfile, saveProfile } from "@/lib/profile-storage";
import type { VeteranProfile } from "@/types";
import { FlowLoading } from "@/components/FlowLoading";

export default function ProfilePage() {
  const [profile, setProfile] = useState<VeteranProfile>(defaultProfile);
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { setProfile(loadProfile()); setReady(true); }, 0); return () => window.clearTimeout(timer); }, []);
  const totalIncome = profile.vaIncome + profile.otherIncome;
  const afterGoals = totalIncome - profile.currentExpenses - profile.savingsGoal;
  const setNumber = (key: keyof VeteranProfile, value: string) => setProfile(p => ({ ...p, [key]: Math.max(0, Number(value)) }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    // A native transition avoids the hosted runtime's stalled client-side route change.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/matches");
  };

  if (!ready) return <FlowLoading active={0}/>;
  return <main className="min-h-screen bg-[#f6f7f3]"><StepBar active={0}/><section className="container-shell py-10 sm:py-14"><div className="mx-auto max-w-3xl"><p className="eyebrow">Your starting point</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f] sm:text-5xl">Build your veteran profile.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">Share the numbers and preferences that matter to you. This stays in your browser for this demonstration, and we never ask for medical information.</p>
    <form onSubmit={submit} className="mt-10 space-y-6">
      <FormSection number="01" icon={<Banknote/>} title="Monthly finances" description="Enter your typical monthly amounts in U.S. dollars.">
        <div className="grid gap-5 sm:grid-cols-2"><MoneyInput label="VA disability compensation" value={profile.vaIncome} onChange={v=>setNumber("vaIncome",v)} hint="Monthly VA compensation"/><MoneyInput label="Other monthly income" value={profile.otherIncome} onChange={v=>setNumber("otherIncome",v)} hint="Pension, work, Social Security, etc."/><MoneyInput label="Ongoing monthly expenses" value={profile.currentExpenses} onChange={v=>setNumber("currentExpenses",v)} hint="Debt, insurance, or obligations that continue after moving"/><MoneyInput label="Desired monthly savings" value={profile.savingsGoal} onChange={v=>setNumber("savingsGoal",v)} hint="What you want left after all monthly costs"/><MoneyInput label="Maximum housing budget" value={profile.housingBudget} onChange={v=>setNumber("housingBudget",v)} hint="Your target for rent and basic housing"/></div>
        <div className="mt-6 grid gap-3 rounded-2xl bg-[#17392f] p-5 text-white sm:grid-cols-3"><Summary label="Total monthly income" value={formatCurrency(totalIncome)}/><Summary label="Ongoing expenses" value={formatCurrency(profile.currentExpenses)}/><Summary label="Available after expenses + goal" value={formatCurrency(afterGoals)} accent/></div>
        <p className="mt-3 text-xs leading-5 text-slate-400">Destination living costs are subtracted separately on your results. This avoids treating rent abroad as one of your ongoing U.S. obligations.</p>
      </FormSection>
      <FormSection number="02" icon={<CloudSun/>} title="Where do you feel at home?" description="Preferences guide the lifestyle portion of your score.">
        <div className="grid gap-5 sm:grid-cols-2"><SelectInput label="Preferred climate" value={profile.climate} options={["Tropical","Warm","Temperate","Four seasons"]} onChange={v=>setProfile(p=>({...p,climate:v as VeteranProfile["climate"]}))}/><SelectInput label="Preferred region" value={profile.region} options={["Open to anywhere","Southeast Asia","Latin America","Europe"]} onChange={v=>setProfile(p=>({...p,region:v as VeteranProfile["region"]}))}/><SelectInput label="Community setting" value={profile.setting} options={["City","Suburban","Rural","Flexible"]} onChange={v=>setProfile(p=>({...p,setting:v as VeteranProfile["setting"]}))}/></div>
      </FormSection>
      <FormSection number="03" icon={<Map/>} title="What matters day to day?" description="Move each slider from nice-to-have to essential.">
        <div className="space-y-5"><Importance icon={<HeartPulse/>} label="Healthcare access" value={profile.healthcareImportance} onChange={v=>setProfile(p=>({...p,healthcareImportance:v}))}/><Importance icon={<Languages/>} label="English accessibility" value={profile.englishImportance} onChange={v=>setProfile(p=>({...p,englishImportance:v}))}/><Importance icon={<Wifi/>} label="Reliable internet" value={profile.internetImportance} onChange={v=>setProfile(p=>({...p,internetImportance:v}))}/></div>
      </FormSection>
      <Disclaimer/>
      <button className="btn-lime w-full justify-center py-4 text-base sm:w-auto sm:px-8" type="submit">Find my country matches <ArrowRight size={18}/></button>
    </form></div></section></main>;
}

function FormSection({number,icon,title,description,children}:{number:string;icon:React.ReactNode;title:string;description:string;children:React.ReactNode}) { return <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-7 flex items-start gap-4 border-b border-slate-100 pb-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf3e8] text-[#17392f] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#829c45]">Step {number}</p><h2 className="mt-1 text-xl font-bold text-[#17392f]">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>{children}</section>; }
function MoneyInput({label,value,onChange,hint}:{label:string;value:number;onChange:(v:string)=>void;hint:string}) { return <label className="block"><span className="field-label">{label}</span><span className="relative mt-2 block"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">$</span><input className="field-input pl-8" type="number" min="0" step="50" value={value} onChange={e=>onChange(e.target.value)} required/></span><span className="mt-1.5 block text-xs text-slate-400">{hint}</span></label>; }
function SelectInput({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}) { return <label><span className="field-label">{label}</span><select className="field-input mt-2" value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>; }
function Summary({label,value,accent}:{label:string;value:string;accent?:boolean}) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p><p className={`mt-1 text-xl font-bold ${accent ? "text-[#d7f06b]" : ""}`}>{value}</p></div>; }
function Importance({icon,label,value,onChange}:{icon:React.ReactNode;label:string;value:number;onChange:(v:number)=>void}) { return <div className="grid gap-3 rounded-2xl border border-slate-100 p-4 sm:grid-cols-[190px_1fr_85px] sm:items-center"><div className="flex items-center gap-3"><span className="text-[#6d865d] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span className="text-sm font-semibold text-slate-800">{label}</span></div><input aria-label={`${label} importance`} type="range" min="1" max="5" value={value} onChange={e=>onChange(Number(e.target.value))} className="accent-[#17392f]"/><span className="rounded-full bg-[#edf3e8] px-3 py-1.5 text-center text-xs font-bold text-[#17392f]">{["","Low","Helpful","Important","Very high","Essential"][value]}</span></div>; }
