"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Banknote, CloudSun, HeartPulse, Languages, MapPin, SlidersHorizontal, Wifi } from "lucide-react";
import { countries } from "@/data/countries";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { formatCurrency } from "@/lib/matching";
import type { Climate, Region } from "@/types";

type CostFilter = "all" | "under-1600" | "1600-1999" | "2000-2499" | "2500-plus";

const regionOptions: Array<Exclude<Region, "Open to anywhere"> | "All regions"> = ["All regions", "Southeast Asia", "East Asia", "Latin America", "Europe"];
const climateOptions: Array<Climate | "All climates"> = ["All climates", "Tropical", "Warm", "Temperate", "Four seasons"];

export default function ExplorePage() {
  const [region, setRegion] = useState<(typeof regionOptions)[number]>("All regions");
  const [climate, setClimate] = useState<(typeof climateOptions)[number]>("All climates");
  const [cost, setCost] = useState<CostFilter>("all");

  const filtered = useMemo(() => countries.filter(country => {
    const regionMatch = region === "All regions" || country.region === region;
    const climateMatch = climate === "All climates" || country.climate.includes(climate);
    const costMatch = cost === "all"
      || (cost === "under-1600" && country.monthlyCost < 1600)
      || (cost === "1600-1999" && country.monthlyCost >= 1600 && country.monthlyCost < 2000)
      || (cost === "2000-2499" && country.monthlyCost >= 2000 && country.monthlyCost < 2500)
      || (cost === "2500-plus" && country.monthlyCost >= 2500);
    return regionMatch && climateMatch && costMatch;
  }), [region, climate, cost]);

  return <main className="min-h-screen bg-[#f6f7f3]">
    <section className="container-shell py-10 sm:py-14">
      <div className="max-w-3xl"><p className="eyebrow">Destination catalog</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f] sm:text-5xl">Explore countries.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-500">Browse the demonstration catalog before building your profile. Costs, scores, and pathway summaries are illustrative until connected to verified sources.</p></div>

      <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><SlidersHorizontal size={17} className="text-[#77903b]"/><h2 className="text-sm font-bold text-[#17392f]">Filter destinations</h2></div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Filter label="Region" value={region} onChange={value => setRegion(value as (typeof regionOptions)[number])} options={regionOptions}/>
          <Filter label="Climate" value={climate} onChange={value => setClimate(value as (typeof climateOptions)[number])} options={climateOptions}/>
          <Filter label="Estimated monthly cost" value={cost} onChange={value => setCost(value as CostFilter)} options={["all", "under-1600", "1600-1999", "2000-2499", "2500-plus"]} labels={["Any monthly cost", "Under $1,600", "$1,600–$1,999", "$2,000–$2,499", "$2,500+"]}/>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-slate-700">{filtered.length} of {countries.length} destinations</p><DemoDataBadge/></div>
      {filtered.length > 0 ? <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(country => <article key={country.slug} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(20,45,35,.06)]"><div className="h-2" style={{background:country.accent}}/><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="text-3xl" aria-hidden="true">{country.flag}</span><div><p className="eyebrow">{country.region}</p><h2 className="mt-2 text-xl font-bold text-[#17392f]">{country.name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13}/> Example city: {country.city}</p></div></div></div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f7f4] p-4"><MiniStat icon={<Banknote/>} label="Monthly cost" value={formatCurrency(country.monthlyCost)}/><MiniStat icon={<Banknote/>} label="Housing" value={formatCurrency(country.housingCost)}/><MiniStat icon={<HeartPulse/>} label="Healthcare" value={`${country.healthcareScore}/100`}/><MiniStat icon={<Wifi/>} label="Internet" value={`${country.internetScore}/100`}/></div>
        <div className="mt-4 space-y-2 text-xs leading-5 text-slate-600"><p className="flex gap-2"><CloudSun size={15} className="mt-0.5 shrink-0 text-[#77903b]"/><span><b className="text-slate-800">Climate:</b> {country.climate.join(" · ")}</span></p><p className="flex gap-2"><Languages size={15} className="mt-0.5 shrink-0 text-[#77903b]"/><span><b className="text-slate-800">English:</b> {country.englishScore}/100</span></p></div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row"><a href={`/report/${country.slug}`} className="btn-dark flex-1 justify-center">View details</a><a href="/profile" className="btn-outline justify-center">Check my fit <ArrowRight size={15}/></a></div>
      </div></article>)}</div> : <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-[#17392f]">No destinations match these filters.</p><button type="button" onClick={() => { setRegion("All regions"); setClimate("All climates"); setCost("all"); }} className="btn-outline mt-4">Clear filters</button></div>}
      <div className="mt-10"><Disclaimer/></div>
    </section>
  </main>;
}

function Filter({label,value,onChange,options,labels}:{label:string;value:string;onChange:(value:string)=>void;options:readonly string[];labels?:readonly string[]}) {
  return <label><span className="field-label">{label}</span><select className="field-input mt-2" value={value} onChange={event=>onChange(event.target.value)}>{options.map((option,index)=><option value={option} key={option}>{labels?.[index] ?? option}</option>)}</select></label>;
}

function MiniStat({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) {
  return <div><span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">{icon}{label}</span><p className="mt-1 font-bold text-[#17392f]">{value}</p></div>;
}
