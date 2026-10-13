"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, Calculator, Check, Copy, Save, Trash2 } from "lucide-react";
import { countries, getCountry } from "@/data/countries";
import { getCityProfile, getCityProfiles } from "@/data/city-profiles";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { defaultProfile, formatCurrency } from "@/lib/matching";
import { loadProfile } from "@/lib/profile-storage";
import { loadRelocationPlans } from "@/lib/relocation-storage";
import { calculateScenario, scaleMovingCosts } from "@/lib/scenario-calculator";
import { deleteScenario, loadScenarioComparison, loadScenarios, saveScenario, saveScenarioComparison } from "@/lib/scenario-storage";
import type { BlockerStatus, RelocationPlanStore, RelocationScenarioInputs, SavedRelocationScenario, VeteranProfile } from "@/types";

export default function SimulatorPage() {
  const [planStore, setPlanStore] = useState<RelocationPlanStore>({ activeCountrySlug: null, plans: {} });
  const [inputs, setInputs] = useState<RelocationScenarioInputs>(() => createInputs(defaultProfile, "philippines"));
  const [saved, setSaved] = useState<SavedRelocationScenario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [scenarioName, setScenarioName] = useState("Scenario 1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loadedProfile = loadProfile();
      const plans = loadRelocationPlans();
      const savedScenarios = loadScenarios();
      const query = new URLSearchParams(window.location.search);
      const existing = savedScenarios.find(item => item.id === query.get("scenario"));
      const requestedCountry = query.get("country");
      const countrySlug = requestedCountry && getCountry(requestedCountry) ? requestedCountry : "philippines";
      setPlanStore(plans);
      setSaved(savedScenarios);
      setSelected(loadScenarioComparison());
      if (existing) {
        setInputs(existing.inputs);
        setScenarioName(existing.name);
        setEditingId(existing.id);
      } else {
        setInputs(createInputs(loadedProfile, countrySlug, plans.plans[countrySlug]?.currentSavings ?? 0, plans.plans[countrySlug]?.targetMoveDate));
        setScenarioName(`Scenario ${savedScenarios.length + 1}`);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const country = getCountry(inputs.countrySlug)!;
  const cities = getCityProfiles(inputs.countrySlug);
  const city = getCityProfile(inputs.countrySlug, inputs.cityId) ?? cities[0];
  const result = useMemo(() => calculateScenario(inputs, planStore.plans[inputs.countrySlug]), [inputs, planStore]);
  const movingBreakdown = scaleMovingCosts(city.movingCosts, inputs.movingCosts);

  const changeCountry = (countrySlug: string) => {
    const nextCities = getCityProfiles(countrySlug);
    const nextCity = nextCities[1] ?? nextCities[0];
    const plan = planStore.plans[countrySlug];
    setInputs(current => ({
      ...current,
      countrySlug,
      cityId: nextCity.id,
      rent: nextCity.expenses.rent,
      movingCosts: movingTotal(nextCity),
      currentSavings: plan?.currentSavings ?? current.currentSavings,
      targetMoveDate: plan?.targetMoveDate ?? current.targetMoveDate,
    }));
  };
  const changeCity = (cityId: string) => {
    const nextCity = getCityProfile(inputs.countrySlug, cityId);
    if (!nextCity) return;
    setInputs(current => ({ ...current, cityId, rent: nextCity.expenses.rent, movingCosts: movingTotal(nextCity) }));
  };
  const updateNumber = (key: keyof RelocationScenarioInputs, value: string) => setInputs(current => ({ ...current, [key]: Math.max(0, Number(value)) }));
  const saveCurrent = () => {
    const now = new Date().toISOString();
    const id = editingId ?? `scenario-${Date.now()}`;
    const existing = saved.find(item => item.id === id);
    const scenario: SavedRelocationScenario = { id, name: scenarioName.trim() || `Scenario ${saved.length + 1}`, inputs, result, createdAt: existing?.createdAt ?? now, updatedAt: now };
    const next = saveScenario(scenario);
    setSaved(next);
    setEditingId(id);
    if (!selected.includes(id) && selected.length < 3) {
      const comparison = [...selected, id];
      setSelected(comparison);
      saveScenarioComparison(comparison);
    }
  };
  const loadSaved = (scenario: SavedRelocationScenario) => {
    setInputs(scenario.inputs);
    setScenarioName(scenario.name);
    setEditingId(scenario.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const removeSaved = (id: string) => {
    setSaved(deleteScenario(id));
    const comparison = selected.filter(item => item !== id);
    setSelected(comparison);
    if (editingId === id) setEditingId(null);
  };
  const toggleCompare = (id: string) => {
    const next = selected.includes(id) ? selected.filter(item => item !== id) : selected.length < 3 ? [...selected, id] : selected;
    setSelected(next);
    saveScenarioComparison(next);
  };

  if (!ready) return <main className="min-h-screen bg-[#f6f7f3] py-20 text-center text-sm font-semibold text-slate-500">Loading your simulator…</main>;

  return <main className="min-h-screen bg-[#f6f7f3] pb-16">
    <section className="bg-[#17392f] text-white"><div className="container-shell py-12 sm:py-16"><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#d7f06b]">Interactive overseas relocation simulator</p><DemoDataBadge inverse/></div><h1 className="mt-4 text-4xl font-bold tracking-[-.045em] sm:text-6xl">What If I Move?</h1><p className="mt-4 max-w-3xl text-base leading-7 text-white/65">Stress-test income, rent, savings, timing, and preparation before making an overseas move. Every projection is an estimate based on your inputs and demonstration destination data.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#assumptions" className="btn-lime">Build your scenario <ArrowRight size={16}/></a>{saved.length >= 2 && <a href="/scenario-compare" className="btn-ghost px-5 py-3">Compare saved scenarios</a>}</div></div></section>

    <section id="assumptions" className="container-shell py-9">
      <div className="grid gap-7 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">What-if controls</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">Change an assumption</h2></div><Calculator className="text-[#77903b]"/></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Destination"><select aria-label="Destination country" className="field-input" value={inputs.countrySlug} onChange={event=>changeCountry(event.target.value)}>{countries.map(item=><option key={item.slug} value={item.slug}>{item.name}</option>)}</select></Field>
            <Field label="Example city"><select aria-label="Example city" className="field-input" value={city.id} onChange={event=>changeCity(event.target.value)}>{cities.map(item=><option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}</select></Field>
            <Field label="Target move date"><input aria-label="Target move date" className="field-input" type="date" value={inputs.targetMoveDate} onInput={event=>{const targetMoveDate=event.currentTarget.value;setInputs(current=>({...current,targetMoveDate}));}}/></Field>
            <MoneyField label="Monthly veteran income" ariaLabel="Monthly veteran income" value={inputs.veteranIncome} onChange={value=>updateNumber("veteranIncome",value)}/>
            <MoneyField label="Other monthly income" ariaLabel="Other monthly income" value={inputs.otherIncome} onChange={value=>updateNumber("otherIncome",value)}/>
            <MoneyField label="Existing U.S. expenses" ariaLabel="Existing U.S. expenses" value={inputs.existingExpenses} onChange={value=>updateNumber("existingExpenses",value)}/>
            <MoneyField label="Current savings" ariaLabel="Current savings" value={inputs.currentSavings} onChange={value=>updateNumber("currentSavings",value)}/>
            <MoneyField label="Housing budget" ariaLabel="Housing budget" value={inputs.housingBudget} onChange={value=>updateNumber("housingBudget",value)}/>
            <MoneyField label="Monthly savings goal" ariaLabel="Monthly savings goal" value={inputs.savingsGoal} onChange={value=>updateNumber("savingsGoal",value)}/>
            <MoneyField label="Estimated rent" ariaLabel="Estimated rent" value={inputs.rent} onChange={value=>updateNumber("rent",value)}/>
            <MoneyField label="Estimated moving costs" ariaLabel="Estimated moving costs" value={inputs.movingCosts} onChange={value=>updateNumber("movingCosts",value)}/>
          </div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900/75">City expenses and moving-cost assumptions are Demo Data. They are planning placeholders, not verified prices or guarantees.</p></section>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Financial sustainability" value={result.financialSustainability} tone={result.financialSustainability === "Good" ? "good" : result.financialSustainability === "Watch" ? "watch" : "risk"}/><SummaryCard label="Relocation readiness" value={`${result.readinessScore}%`}/><SummaryCard label="12-month savings" value={formatSigned(result.savingsAfter12Months)} tone={result.savingsAfter12Months < 0 ? "risk" : "good"}/><SummaryCard label="Outstanding blockers" value={String(result.blockers.filter(item=>item.status!=="Ready").length)} tone={result.blockers.some(item=>item.status==="Potential Blocker")?"risk":"watch"}/></section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="eyebrow">12-month projection</p><DemoDataBadge/></div><h2 className="mt-2 text-2xl font-bold text-[#17392f]">{country.flag} {city.name} · {city.type}</h2><p className="mt-2 text-sm text-slate-500">Savings after estimated upfront moving costs, followed by twelve months of projected surplus or deficit.</p></div><BarChart3 className="shrink-0 text-[#77903b]"/></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Cash needed before moving" value={formatCurrency(result.initialCashNeeded)}/><Metric label="Monthly surplus / deficit" value={formatSigned(result.monthlySurplus)} warning={result.monthlySurplus<0}/><Metric label="After 3 months" value={formatCurrency(result.savingsAfter3Months)} warning={result.savingsAfter3Months<0}/><Metric label="After 6 months" value={formatCurrency(result.savingsAfter6Months)} warning={result.savingsAfter6Months<0}/><Metric label="After 12 months" value={formatCurrency(result.savingsAfter12Months)} warning={result.savingsAfter12Months<0}/></div><SavingsChart values={result.projections.map(item=>item.balance)}/>{result.firstNegativeMonth && <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertTriangle className="h-5 w-5 shrink-0"/><p>Based on this scenario, savings could fall below $0 around Month {result.firstNegativeMonth}.</p></div>}</section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="eyebrow">Transparent calculation</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">How is this calculated?</h2><div className="mt-6 grid gap-4 lg:grid-cols-2"><Calculation title="Monthly cash flow" rows={[["Veteran income",inputs.veteranIncome],["Other income",inputs.otherIncome],["Housing",-inputs.rent],["Utilities",-city.expenses.utilities],["Food",-city.expenses.food],["Transportation",-city.expenses.transportation],["Healthcare estimate",-city.expenses.healthcare],["Other estimated expenses",-city.expenses.other],["Existing U.S. expenses",-inputs.existingExpenses]]} totalLabel="Estimated monthly surplus" total={result.monthlySurplus}/><Calculation title="Before the move" rows={[["Starting savings",inputs.currentSavings],["Estimated flight",-movingBreakdown.flight],["Housing deposit",-movingBreakdown.housingDeposit],["Initial housing / setup",-movingBreakdown.setup],["Other relocation costs",-movingBreakdown.other]]} totalLabel="Savings after moving costs" total={result.savingsAfterMove}/></div><p className="mt-5 text-xs leading-5 text-slate-400">Cash needed before moving combines estimated relocation costs and one month of city living costs. Monthly projections add the same calculated surplus or deficit each month and do not model inflation, taxes, exchange-rate changes, emergencies, or investment returns.</p></section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="eyebrow">Readiness connection</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">Can I afford it, do it, and prepare for it?</h2></div><a href={`/plan?country=${country.slug}`} className="btn-outline self-start">Open relocation plan <ArrowRight size={15}/></a></div><div className="mt-6 grid gap-4 md:grid-cols-3"><Question title="Can I afford it?" value={result.financialSustainability} detail={`${formatSigned(result.monthlySurplus)} estimated each month.`}/><Question title="Can I realistically do it?" value={`${result.blockers.filter(item=>item.status==="Potential Blocker").length} potential blockers`} detail="Residency, healthcare, documents, and preparation time remain subject to verification."/><Question title="Am I prepared to do it?" value={`${result.readinessScore}% ready`} detail="Uses saved relocation-plan progress plus this scenario’s finances and target date."/></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl bg-[#17392f] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-[#d7f06b]">Biggest concern</p><p className="mt-3 text-sm leading-6 text-white/75">{result.biggestConcern}</p></div><div className="rounded-2xl bg-[#edf3e8] p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#77903b]">Suggested next step</p><p className="mt-3 text-sm leading-6 text-[#17392f]">{result.suggestedNextStep}</p></div></div><div className="mt-6 space-y-3">{result.blockers.map(item=><div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[150px_1fr]"><StatusBadge status={item.status}/><div><p className="text-sm font-bold text-[#17392f]">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</p></div></div>)}</div></section>

          <section className="rounded-[26px] border border-[#d7f06b]/60 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Save this what-if</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">Keep and compare scenarios</h2></div>{selected.length>=2?<a href="/scenario-compare" className="btn-dark">Compare {selected.length} scenarios <ArrowRight size={15}/></a>:<p className="text-xs text-slate-400">Select at least 2 saved scenarios to compare</p>}</div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><input aria-label="Scenario name" className="field-input" value={scenarioName} onChange={event=>setScenarioName(event.target.value)} placeholder="Scenario name"/><button type="button" onClick={saveCurrent} className="btn-lime shrink-0 justify-center"><Save size={16}/>{editingId?"Update scenario":"Save scenario"}</button><button type="button" onClick={()=>{setEditingId(null);setScenarioName(`Scenario ${saved.length+1}`);}} className="btn-outline shrink-0 justify-center"><Copy size={16}/>Save as new</button></div>
            {saved.length>0&&<div className="mt-6 grid gap-3 md:grid-cols-2">{saved.map(item=>{const itemCountry=getCountry(item.inputs.countrySlug)!;const itemCity=getCityProfile(item.inputs.countrySlug,item.inputs.cityId)!;const isSelected=selected.includes(item.id);return <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#17392f]">{item.name}</p><p className="mt-1 text-xs text-slate-500">{itemCountry.flag} {itemCountry.name} · {itemCity.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Target {formatDate(item.inputs.targetMoveDate)}</p></div><button type="button" onClick={()=>removeSaved(item.id)} aria-label={`Delete ${item.name}`} className="rounded-full p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15}/></button></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>loadSaved(item)} className="btn-outline py-2 text-xs">Load</button><button type="button" aria-pressed={isSelected} onClick={()=>toggleCompare(item.id)} className={`btn-outline py-2 text-xs ${isSelected?"border-[#17392f] bg-[#edf3e8]":""}`}><span className={`grid h-4 w-4 place-items-center rounded border ${isSelected?"border-[#17392f] bg-[#17392f] text-white":"border-slate-300"}`}>{isSelected&&<Check size={11}/>}</span>{isSelected?"Selected":"Compare"}</button></div></article>})}</div>}
          </section>
          <Disclaimer/>
        </div>
      </div>
    </section>
  </main>;
}

function createInputs(profile: VeteranProfile, countrySlug: string, currentSavings = 0, targetMoveDate?: string): RelocationScenarioInputs {
  const cities = getCityProfiles(countrySlug);
  const city = cities[1] ?? cities[0];
  return { countrySlug, cityId: city.id, targetMoveDate: targetMoveDate ?? defaultTargetDate(), veteranIncome: profile.vaIncome, otherIncome: profile.otherIncome, existingExpenses: profile.currentExpenses, currentSavings, housingBudget: profile.housingBudget, savingsGoal: profile.savingsGoal, rent: city.expenses.rent, movingCosts: movingTotal(city) };
}

function Field({label,children}:{label:string;children:React.ReactNode}) { return <label><span className="field-label mb-2">{label}</span>{children}</label>; }
function MoneyField({label,ariaLabel,value,onChange}:{label:string;ariaLabel:string;value:number;onChange:(value:string)=>void}) { return <Field label={label}><span className="relative block"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span><input aria-label={ariaLabel} className="field-input pl-8" type="number" min="0" step="50" value={value} onChange={event=>onChange(event.target.value)}/></span></Field>; }
function SummaryCard({label,value,tone}:{label:string;value:string;tone?:"good"|"watch"|"risk"}) { return <div className={`rounded-2xl border p-5 shadow-sm ${tone==="risk"?"border-rose-200 bg-rose-50":tone==="watch"?"border-amber-200 bg-amber-50":"border-slate-200 bg-white"}`}><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${tone==="risk"?"text-rose-700":tone==="watch"?"text-amber-800":"text-[#17392f]"}`}>{value}</p></div>; }
function Metric({label,value,warning}:{label:string;value:string;warning?:boolean}) { return <div className="rounded-2xl bg-[#f5f7f4] p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-lg font-bold ${warning?"text-rose-600":"text-[#17392f]"}`}>{value}</p></div>; }
function Question({title,value,detail}:{title:string;value:string;detail:string}) { return <div className="rounded-2xl bg-[#f5f7f4] p-5"><p className="text-xs font-bold text-[#77903b]">{title}</p><p className="mt-2 text-xl font-bold text-[#17392f]">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></div>; }
function StatusBadge({status}:{status:BlockerStatus}) { const styles=status==="Ready"?"bg-emerald-50 text-emerald-700":status==="Needs Attention"?"bg-amber-50 text-amber-800":"bg-rose-50 text-rose-700"; return <span className={`inline-flex h-fit w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${styles}`}>{status}</span>; }
function Calculation({title,rows,totalLabel,total}:{title:string;rows:Array<[string,number]>;totalLabel:string;total:number}) { return <div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-[#17392f]">{title}</h3><div className="mt-4 space-y-2">{rows.map(([label,value])=><div key={label} className="flex justify-between gap-4 text-sm"><span className="text-slate-500">{label}</span><span className={value<0?"text-slate-500":"font-semibold text-[#17392f]"}>{value<0?"− ":""}{formatCurrency(Math.abs(value))}</span></div>)}</div><div className="mt-4 flex justify-between gap-4 border-t border-slate-200 pt-4"><span className="text-sm font-bold text-[#17392f]">{totalLabel}</span><span className={`font-bold ${total<0?"text-rose-600":"text-[#77903b]"}`}>{formatSigned(total)}</span></div></div>; }

function SavingsChart({values}:{values:number[]}) {
  const min=Math.min(0,...values); const max=Math.max(0,...values); const range=Math.max(1,max-min); const points=values.map((value,index)=>`${20+(index/(values.length-1))*760},${20+((max-value)/range)*180}`).join(" "); const zeroY=20+(max/range)*180;
  return <div className="mt-7 overflow-x-auto"><svg role="img" aria-label="Projected savings balance over 12 months" viewBox="0 0 800 240" className="min-w-[620px] w-full"><line x1="20" y1={zeroY} x2="780" y2={zeroY} stroke="#e5e7eb" strokeDasharray="6 6"/><polyline fill="none" stroke={values.at(-1)!<0?"#e11d48":"#77903b"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points}/>{values.map((value,index)=>{const x=20+(index/(values.length-1))*760;const y=20+((max-value)/range)*180;return <g key={index}><circle cx={x} cy={y} r="5" fill={value<0?"#e11d48":"#d7f06b"} stroke="#17392f" strokeWidth="2"/><text x={x} y="228" textAnchor="middle" fontSize="10" fill="#64748b">{index+1}</text></g>})}<text x="20" y="14" fontSize="10" fill="#64748b">{formatCurrency(max)}</text><text x="20" y="214" fontSize="10" fill="#64748b">{formatCurrency(min)}</text></svg><p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Month after move</p></div>;
}

const movingTotal = (city: ReturnType<typeof getCityProfiles>[number]) => city.movingCosts.flight + city.movingCosts.housingDeposit + city.movingCosts.setup + city.movingCosts.other;
const defaultTargetDate = () => { const date=new Date(); date.setFullYear(date.getFullYear()+1); return date.toISOString().slice(0,10); };
const formatSigned = (value:number) => `${value>=0?"+":"−"}${formatCurrency(Math.abs(value))}`;
const formatDate = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{month:"short",year:"numeric"});
