"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import { countries } from "@/data/countries";
import { defaultProfile, formatCurrency, scoreCountry } from "@/lib/matching";
import { loadComparison, loadProfile, saveComparison } from "@/lib/profile-storage";
import { Disclaimer } from "@/components/Disclaimer";
import { ScoreRing } from "@/components/ScoreRing";
import { StepBar } from "@/components/StepBar";
import type { VeteranProfile } from "@/types";

export default function ComparePage() {
  const [profile, setProfile] = useState<VeteranProfile>(defaultProfile);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { setProfile(loadProfile()); const saved=loadComparison(); setSelected(saved.length?saved:["philippines","mexico","portugal"]); }, []);
  const results = useMemo(() => selected.map(slug=>countries.find(c=>c.slug===slug)).filter(Boolean).map(c=>scoreCountry(profile,c!)), [selected,profile]);
  const remove = (slug:string) => { const next=selected.filter(s=>s!==slug); setSelected(next); saveComparison(next); };
  const add = (slug:string) => { if(selected.length>=3||selected.includes(slug)) return; const next=[...selected,slug]; setSelected(next); saveComparison(next); };
  return <main className="min-h-screen bg-[#f6f7f3]"><StepBar active={2}/><section className="container-shell py-10 sm:py-14"><Link href="/matches" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#17392f]"><ArrowLeft size={16}/> Back to matches</Link><div className="mt-6"><p className="eyebrow">Side-by-side decision support</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f] sm:text-5xl">Compare your options.</h1><p className="mt-4 text-slate-500">Use the same profile assumptions across up to three destinations.</p></div>
    {results.length ? <div className="mt-10 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><div className="grid min-w-[760px]" style={{gridTemplateColumns:`190px repeat(${results.length}, minmax(190px, 1fr))`}}><div className="bg-[#17392f] p-5 text-xs font-bold uppercase tracking-[.14em] text-white/50">Destination</div>{results.map(r=><div key={r.country.slug} className="relative border-l border-white/10 bg-[#17392f] p-5 text-white"><button onClick={()=>remove(r.country.slug)} className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-white/60 hover:text-white" aria-label={`Remove ${r.country.name}`}><X size={14}/></button><span className="text-3xl">{r.country.flag}</span><h2 className="mt-2 text-xl font-bold">{r.country.name}</h2><p className="text-xs text-white/50">{r.country.city}</p></div>)}
      <Row label="Readiness score">{results.map(r=><Cell key={r.country.slug}><div className="flex items-center gap-3"><ScoreRing score={r.score} size="sm"/><span className="text-xs font-bold text-[#17392f]">{r.status}</span></div></Cell>)}</Row>
      <Row label="Monthly cost">{results.map(r=><Cell key={r.country.slug} strong>{formatCurrency(r.country.monthlyCost)}</Cell>)}</Row>
      <Row label="Housing">{results.map(r=><Cell key={r.country.slug} strong>{formatCurrency(r.country.housingCost)}</Cell>)}</Row>
      <Row label="Money remaining">{results.map(r=><Cell key={r.country.slug} strong>{formatCurrency(r.remaining)}</Cell>)}</Row>
      <Row label="Healthcare">{results.map(r=><Cell key={r.country.slug}><Score value={r.country.healthcareScore}/><p>{r.country.healthcare}</p></Cell>)}</Row>
      <Row label="Residency">{results.map(r=><Cell key={r.country.slug}><b className="text-[#17392f]">{r.country.residencyCategory}</b><p>{r.country.residency}</p></Cell>)}</Row>
      <Row label="Internet">{results.map(r=><Cell key={r.country.slug}><Score value={r.country.internetScore}/><p>{r.country.internet}</p></Cell>)}</Row>
      <Row label="English access">{results.map(r=><Cell key={r.country.slug}><Score value={r.country.englishScore}/><p>{r.country.english}</p></Cell>)}</Row>
      <div className="bg-[#f5f7f4] p-5 text-xs font-bold uppercase tracking-[.14em] text-slate-400">Next step</div>{results.map(r=><Cell key={r.country.slug}><Link href={`/report/${r.country.slug}`} className="btn-dark w-full justify-center">Full report <ArrowRight size={15}/></Link></Cell>)}
      </div></div></div> : <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-[#17392f]">No countries selected yet.</p><Link href="/matches" className="btn-lime mt-5">Choose matches</Link></div>}
    {selected.length<3 && <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-[#17392f]">Add another destination</p><div className="mt-3 flex flex-wrap gap-2">{countries.filter(c=>!selected.includes(c.slug)).map(c=><button key={c.slug} onClick={()=>add(c.slug)} className="btn-outline py-2 text-xs"><Plus size={14}/>{c.flag} {c.name}</button>)}</div></div>}
    <div className="mt-8"><Disclaimer/></div>
  </section></main>;
}

function Row({label,children}:{label:string;children:React.ReactNode}) { return <><div className="border-t border-slate-200 bg-[#f5f7f4] p-5 text-xs font-bold uppercase tracking-[.14em] text-slate-400">{label}</div>{children}</>; }
function Cell({children,strong}:{children:React.ReactNode;strong?:boolean}) { return <div className={`border-l border-t border-slate-200 p-5 text-sm leading-6 text-slate-500 ${strong?"text-xl font-bold text-[#17392f]":""}`}>{children}</div>; }
function Score({value}:{value:number}) { return <div className="mb-2 flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#d7f06b] text-[10px] font-bold text-[#17392f]"><Check size={12}/></span><b className="text-[#17392f]">{value}/100</b></div>; }
