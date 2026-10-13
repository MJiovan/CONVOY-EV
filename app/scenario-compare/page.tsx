"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Edit3, Plus, X } from "lucide-react";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { getCityProfile } from "@/data/city-profiles";
import { getCountry } from "@/data/countries";
import { formatCurrency } from "@/lib/matching";
import { loadScenarioComparison, loadScenarios, saveScenarioComparison } from "@/lib/scenario-storage";
import type { SavedRelocationScenario } from "@/types";

export default function ScenarioComparePage() {
  const [scenarios, setScenarios] = useState<SavedRelocationScenario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(()=>{const timer=window.setTimeout(()=>{setScenarios(loadScenarios());setSelected(loadScenarioComparison());setReady(true);},0);return()=>window.clearTimeout(timer);},[]);
  const compared = useMemo(()=>selected.map(id=>scenarios.find(item=>item.id===id)).filter((item):item is SavedRelocationScenario=>Boolean(item)),[selected,scenarios]);
  const remove = (id:string) => {const next=selected.filter(item=>item!==id);setSelected(next);saveScenarioComparison(next);};
  const add = (id:string) => {if(selected.length>=3||selected.includes(id)) return;const next=[...selected,id];setSelected(next);saveScenarioComparison(next);};
  if(!ready) return <main className="min-h-screen bg-[#f6f7f3] py-20 text-center text-sm font-semibold text-slate-500">Loading saved scenarios…</main>;
  return <main className="min-h-screen bg-[#f6f7f3] pb-16"><section className="container-shell py-10 sm:py-14"><a href="/simulator" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#17392f]"><ArrowLeft size={16}/> Back to simulator</a><div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-3"><p className="eyebrow">Saved what-if scenarios</p><DemoDataBadge/></div><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f] sm:text-5xl">Compare possible moves.</h1><p className="mt-4 max-w-2xl text-slate-500">Compare up to three sets of assumptions. VET NOMAD does not choose a destination for you.</p></div><a href="/simulator" className="btn-lime self-start">Build another scenario <Plus size={16}/></a></div>

      {compared.length>=2?<section className="mt-8 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><div className="grid min-w-[820px]" style={{gridTemplateColumns:`210px repeat(${compared.length}, minmax(210px,1fr))`}}><div className="bg-[#17392f] p-5 text-xs font-bold uppercase tracking-wider text-white/50">Scenario</div>{compared.map(item=>{const country=getCountry(item.inputs.countrySlug)!;const city=getCityProfile(item.inputs.countrySlug,item.inputs.cityId)!;return <div key={item.id} className="relative border-l border-white/10 bg-[#17392f] p-5 text-white"><button type="button" onClick={()=>remove(item.id)} aria-label={`Remove ${item.name}`} className="absolute right-3 top-3 rounded-full bg-white/10 p-1.5 text-white/60 hover:text-white"><X size={14}/></button><p className="text-xs font-bold uppercase tracking-wider text-[#d7f06b]">{item.name}</p><h2 className="mt-3 text-xl font-bold">{country.flag} {country.name}</h2><p className="mt-1 text-xs text-white/55">{city.name} · {city.type}</p></div>})}
        <CompareRow label="Target move date">{compared.map(item=><CompareCell key={item.id} strong>{formatDate(item.inputs.targetMoveDate)}</CompareCell>)}</CompareRow>
        <CompareRow label="Initial cash needed">{compared.map(item=><CompareCell key={item.id} strong>{formatCurrency(item.result.initialCashNeeded)}</CompareCell>)}</CompareRow>
        <CompareRow label="Estimated monthly cost">{compared.map(item=><CompareCell key={item.id} strong>{formatCurrency(item.result.monthlyLivingCost)}</CompareCell>)}</CompareRow>
        <CompareRow label="Monthly surplus / deficit">{compared.map(item=><CompareCell key={item.id} strong warning={item.result.monthlySurplus<0}>{formatSigned(item.result.monthlySurplus)}</CompareCell>)}</CompareRow>
        <CompareRow label="12-month projected savings">{compared.map(item=><CompareCell key={item.id} strong warning={item.result.savingsAfter12Months<0}>{formatSigned(item.result.savingsAfter12Months)}</CompareCell>)}</CompareRow>
        <CompareRow label="Financial sustainability">{compared.map(item=><CompareCell key={item.id}><Status value={item.result.financialSustainability}/></CompareCell>)}</CompareRow>
        <CompareRow label="Relocation readiness">{compared.map(item=><CompareCell key={item.id} strong>{item.result.readinessScore}%</CompareCell>)}</CompareRow>
        <CompareRow label="Outstanding blockers">{compared.map(item=><CompareCell key={item.id} strong>{item.result.blockers.filter(blocker=>blocker.status!=="Ready").length}</CompareCell>)}</CompareRow>
        <CompareRow label="Why the result differs">{compared.map(item=><CompareCell key={item.id}><p>{item.result.biggestConcern}</p><p className="mt-3 font-semibold text-[#17392f]">Next: {item.result.suggestedNextStep}</p></CompareCell>)}</CompareRow>
        <CompareRow label="Healthcare considerations">{compared.map(item=><CompareCell key={item.id}>{getCountry(item.inputs.countrySlug)!.healthcare}</CompareCell>)}</CompareRow>
        <CompareRow label="Residency considerations">{compared.map(item=><CompareCell key={item.id}>{getCountry(item.inputs.countrySlug)!.residency}</CompareCell>)}</CompareRow>
        <div className="border-t border-slate-200 bg-[#f5f7f4] p-5 text-xs font-bold uppercase tracking-wider text-slate-400">Adjust</div>{compared.map(item=><CompareCell key={item.id}><a href={`/simulator?scenario=${item.id}`} className="btn-outline w-full justify-center"><Edit3 size={15}/>Edit scenario</a></CompareCell>)}
      </div></div></section>:<section className="mt-8 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-bold text-[#17392f]">Select at least two saved scenarios.</h2><p className="mt-2 text-sm text-slate-500">Build and save scenarios in the simulator, then choose up to three here.</p><a href="/simulator" className="btn-lime mt-5">Open simulator</a></section>}

      {selected.length<3&&scenarios.some(item=>!selected.includes(item.id))&&<section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6"><h2 className="text-sm font-bold text-[#17392f]">Add a saved scenario</h2><div className="mt-4 flex flex-wrap gap-2">{scenarios.filter(item=>!selected.includes(item.id)).map(item=><button key={item.id} type="button" onClick={()=>add(item.id)} className="btn-outline py-2 text-xs"><Plus size={14}/>{item.name}</button>)}</div></section>}
      <div className="mt-8"><Disclaimer/></div>
    </section></main>;
}

function CompareRow({label,children}:{label:string;children:React.ReactNode}) { return <><div className="border-t border-slate-200 bg-[#f5f7f4] p-5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>{children}</>; }
function CompareCell({children,strong,warning}:{children:React.ReactNode;strong?:boolean;warning?:boolean}) { return <div className={`border-l border-t border-slate-200 p-5 text-sm leading-6 ${strong?"text-xl font-bold":"text-slate-500"} ${warning?"text-rose-600":""}`}>{children}</div>; }
function Status({value}:{value:string}) { const style=value==="Good"?"bg-emerald-50 text-emerald-700":value==="Watch"?"bg-amber-50 text-amber-800":"bg-rose-50 text-rose-700";return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${style}`}>{value}</span>; }
const formatDate=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{month:"short",year:"numeric"});
const formatSigned=(value:number)=>`${value>=0?"+":"−"}${formatCurrency(Math.abs(value))}`;
