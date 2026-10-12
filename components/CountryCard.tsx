"use client";

import { AlertTriangle, Check, ChevronRight, CircleDollarSign, HeartPulse, Languages, Minus, Wifi } from "lucide-react";
import { formatCurrency } from "@/lib/matching";
import type { MatchResult } from "@/types";
import { ScoreRing } from "@/components/ScoreRing";
import { DemoDataBadge } from "@/components/DemoDataBadge";

export function CountryCard({ result, selected, onToggle }: { result: MatchResult; selected: boolean; onToggle: () => void }) {
  const { country } = result;
  return <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(20,45,35,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(20,45,35,.12)]">
    <div className="h-2" style={{ background: country.accent }}/><div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="text-3xl" aria-hidden="true">{country.flag}</span><div><div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{country.region}</p><DemoDataBadge/></div><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17392f]">{country.name}</h2><p className="text-sm text-slate-500">Example city: {country.city}</p></div></div><ScoreRing score={result.score} size="sm"/></div>
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#f4f7f4] p-4"><Stat label="Est. living cost" value={formatCurrency(country.monthlyCost)}/><Stat label="Est. housing" value={formatCurrency(country.housingCost)}/><Stat label="Est. remaining" value={formatCurrency(result.remaining)} positive={result.remaining >= 0}/></div>
      <div className="mt-5 rounded-2xl border border-[#dfe7d7] bg-[#fbfcf8] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#77903b]">How it fits your profile</p><ul className="mt-2 space-y-2">{result.reasons.map(reason=><li key={reason.text} className="flex gap-2 text-xs leading-5 text-slate-600"><FactorIcon tone={reason.tone}/><span>{reason.text}</span></li>)}</ul></div>
      <div className="mt-5 space-y-3 text-sm text-slate-600"><Info icon={<HeartPulse/>} label="Healthcare" value={`${country.healthcareScore}/100`}/><Info icon={<Languages/>} label="English" value={country.english}/><Info icon={<Wifi/>} label="Internet" value={country.internet}/><Info icon={<CircleDollarSign/>} label="Residency" value={country.residencyCategory}/></div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row"><a href={`/report/${country.slug}`} className="btn-dark flex-1 justify-center">View readiness report <ChevronRight size={16}/></a><button type="button" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Select"} ${country.name} ${selected ? "from" : "for"} comparison`} onClick={onToggle} className={`btn-outline justify-center ${selected ? "border-[#17392f] bg-[#edf3e8]" : ""}`}><span className={`grid h-4 w-4 place-items-center rounded border ${selected ? "border-[#17392f] bg-[#17392f] text-white" : "border-slate-300"}`}>{selected && <Check size={11}/>}</span>{selected ? "Selected" : "Compare"}</button></div>
    </div>
  </article>;
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 text-sm font-bold sm:text-base ${positive === false ? "text-rose-600" : "text-[#17392f]"}`}>{value}</p></div>; }
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#698577] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><p className="line-clamp-2"><span className="font-semibold text-slate-800">{label}: </span>{value}</p></div>; }
function FactorIcon({ tone }: { tone: MatchResult["reasons"][number]["tone"] }) {
  if (tone === "warning") return <AlertTriangle aria-label="Warning" className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-600"/>;
  if (tone === "neutral") return <Minus aria-label="Consideration" className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-600"/>;
  return <Check aria-label="Positive" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#77903b]"/>;
}
