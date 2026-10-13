"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CalendarDays, Check, CircleDollarSign, ClipboardCheck, FileText, HeartPulse, Home, Landmark, Plane, ShieldCheck } from "lucide-react";
import { countries, getCountry } from "@/data/countries";
import { buildRelocationTasks, relocationCategoryLabels, timelineLabels, timelineOrder } from "@/data/relocation-tasks";
import { Disclaimer } from "@/components/Disclaimer";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { ScoreRing } from "@/components/ScoreRing";
import { StepBar } from "@/components/StepBar";
import { defaultProfile, formatCurrency } from "@/lib/matching";
import { loadProfile } from "@/lib/profile-storage";
import { calculateRelocationReadiness, RELOCATION_READINESS_WEIGHTS, unmetDependencies } from "@/lib/relocation-readiness";
import { ensureRelocationPlan, loadRelocationPlans, saveRelocationPlans, updateRelocationPlan } from "@/lib/relocation-storage";
import type { ReadinessCategory, RelocationCategory, RelocationPlan, RelocationPlanStore, TimelineStage, VeteranProfile } from "@/types";

const readinessLabels: Record<ReadinessCategory, string> = {
  financial: "Financial Readiness",
  documents: "Document Readiness",
  residency: "Residency Readiness",
  healthcare: "Healthcare Readiness",
  moving: "Moving Preparation",
};

const categoryIcons: Record<RelocationCategory, React.ReactNode> = {
  finances: <CircleDollarSign/>, residency: <Landmark/>, documents: <FileText/>, "va-benefits": <ShieldCheck/>, healthcare: <HeartPulse/>, housing: <Home/>, moving: <Plane/>,
};

export default function RelocationPlanPage() {
  const [profile, setProfile] = useState<VeteranProfile>(defaultProfile);
  const [store, setStore] = useState<RelocationPlanStore>({ activeCountrySlug: null, plans: {} });
  const [ready, setReady] = useState(false);
  const [draftCountry, setDraftCountry] = useState(countries[0].slug);
  const [view, setView] = useState<"checklist" | "timeline">("checklist");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = loadRelocationPlans();
      const requested = new URLSearchParams(window.location.search).get("country");
      const slug = requested && getCountry(requested) ? requested : saved.activeCountrySlug;
      const next = slug ? ensureRelocationPlan(saved, slug) : saved;
      if (slug) saveRelocationPlans(next);
      setProfile(loadProfile());
      setStore(next);
      setDraftCountry(slug ?? countries[0].slug);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const country = store.activeCountrySlug ? getCountry(store.activeCountrySlug) : undefined;
  const plan = country ? store.plans[country.slug] : undefined;
  const tasks = useMemo(() => country ? buildRelocationTasks(country) : [], [country]);
  const readiness = country && plan ? calculateRelocationReadiness(profile, country, plan) : null;

  const commit = (nextPlan: RelocationPlan) => {
    const next = updateRelocationPlan(store, nextPlan);
    setStore(next);
    saveRelocationPlans(next);
  };
  const chooseCountry = (slug: string) => {
    const next = ensureRelocationPlan(store, slug);
    setStore(next);
    setDraftCountry(slug);
    saveRelocationPlans(next);
  };
  const toggleTask = (id: string) => {
    if (!plan) return;
    const task = tasks.find(item => item.id === id);
    if (!task || unmetDependencies(task, tasks, plan.completedTaskIds).length) return;
    const completedTaskIds = plan.completedTaskIds.includes(id) ? plan.completedTaskIds.filter(item => item !== id) : [...plan.completedTaskIds, id];
    commit({ ...plan, completedTaskIds });
  };

  if (!ready) return <main className="min-h-screen bg-[#f6f7f3]"><StepBar active={4}/><div className="container-shell py-20 text-center text-sm font-semibold text-slate-500">Loading your relocation plan…</div></main>;
  if (!country || !plan || !readiness) return <SetupPlan countrySlug={draftCountry} onCountry={setDraftCountry} onStart={() => chooseCountry(draftCountry)}/>;

  const monthlyIncome = profile.vaIncome + profile.otherIncome;
  const remaining = monthlyIncome - profile.currentExpenses - country.monthlyCost;
  const completed = new Set(plan.completedTaskIds);

  return <main className="min-h-screen bg-[#f6f7f3] pb-14">
    <StepBar active={4}/>
    <section className="bg-[#17392f] text-white"><div className="container-shell py-10 sm:py-14">
      <a href={`/report/${country.slug}`} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16}/> Back to readiness report</a>
      <div className="mt-7 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#d7f06b]">International relocation plan</p><DemoDataBadge inverse/></div><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] sm:text-5xl">{country.flag} {country.name} · {country.city}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Track the preparation steps for a potential move overseas. This is a planning tool, not legal, immigration, healthcare, financial, or VA advice.</p></div><div className="flex items-center gap-5 rounded-3xl bg-white p-5 text-[#17392f]"><ScoreRing score={readiness.score} size="md"/><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Relocation readiness</p><p className="mt-1 text-xl font-bold">{readiness.score}/100</p><p className="mt-1 text-xs text-slate-500">{readiness.progress}% checklist progress</p></div></div></div>
    </div></section>

    <section className="container-shell py-9">
      <div className="grid gap-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3 lg:grid-cols-6">
        <label className="md:col-span-2"><span className="field-label">Destination</span><select aria-label="Relocation destination" className="field-input mt-2" value={country.slug} onChange={event=>chooseCountry(event.target.value)}>{countries.map(item=><option key={item.slug} value={item.slug}>{item.name} · {item.city}</option>)}</select></label>
        <label><span className="field-label">Target move date</span><input aria-label="Target move date" className="field-input mt-2" type="date" value={plan.targetMoveDate} onInput={event=>commit({...plan,targetMoveDate:event.currentTarget.value})}/></label>
        <label><span className="field-label">Current savings</span><span className="relative mt-2 block"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span><input aria-label="Current savings" className="field-input pl-8" type="number" min="0" step="100" value={plan.currentSavings} onChange={event=>commit({...plan,currentSavings:Math.max(0,Number(event.target.value))})}/></span></label>
        <DashboardStat label="Months remaining" value={String(readiness.monthsUntilMove)}/><DashboardStat label="Overall progress" value={`${readiness.progress}%`}/>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric label="Monthly income" value={formatCurrency(monthlyIncome)}/><Metric label="Ongoing expenses" value={formatCurrency(profile.currentExpenses)}/><Metric label="Demo living cost" value={formatCurrency(country.monthlyCost)}/><Metric label="Est. remaining" value={formatCurrency(remaining)} warning={remaining<0}/><Metric label="Monthly savings goal" value={formatCurrency(profile.savingsGoal)}/><Metric label="Initial moving costs" value={formatCurrency(country.initialMovingCost)}/>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
        <div>
          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">Readiness categories</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">Your preparation picture</h2></div><p className="text-xs text-slate-400">Fixed weights · no randomness</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{(Object.keys(readiness.categories) as ReadinessCategory[]).map(key=><div key={key} className="rounded-2xl bg-[#f5f7f4] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-[#17392f]">{readinessLabels[key]}</p><b className="text-sm text-[#17392f]">{readiness.categories[key]}/100</b></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#d7f06b]" style={{width:`${readiness.categories[key]}%`}}/></div><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{RELOCATION_READINESS_WEIGHTS[key]}% of overall score</p></div>)}</div></section>

          <section className="mt-7 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">Personalized checklist</p><h2 className="mt-2 text-2xl font-bold text-[#17392f]">Prepare for the move</h2></div><div className="flex rounded-full bg-[#f1f4ef] p-1"><button type="button" onClick={()=>setView("checklist")} className={`rounded-full px-4 py-2 text-xs font-bold ${view==="checklist"?"bg-[#17392f] text-white":"text-slate-500"}`}>By category</button><button type="button" onClick={()=>setView("timeline")} className={`rounded-full px-4 py-2 text-xs font-bold ${view==="timeline"?"bg-[#17392f] text-white":"text-slate-500"}`}>Timeline</button></div></div>
            {view === "checklist" ? <CategoryChecklist tasks={tasks} completed={completed} onToggle={toggleTask}/> : <TimelineChecklist targetDate={plan.targetMoveDate} tasks={tasks} completed={completed} onToggle={toggleTask}/>} 
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><p className="eyebrow">Why your score changed</p><h2 className="mt-2 text-xl font-bold text-[#17392f]">Explainable readiness</h2><ul className="mt-5 space-y-4">{readiness.reasons.map(reason=><li key={reason} className="flex gap-3 text-xs leading-5 text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#77903b]"/>{reason}</li>)}</ul></section>
          <section className="rounded-[24px] bg-[#17392f] p-6 text-white"><CalendarDays className="text-[#d7f06b]"/><h2 className="mt-4 text-xl font-bold">Planning timeline</h2><p className="mt-2 text-sm leading-6 text-white/60">The target date organizes tasks only. It does not predict or guarantee visa, residency, document, or government processing times.</p><button type="button" onClick={()=>setView("timeline")} className="btn-lime mt-5 w-full justify-center">View timeline</button><a href={`/simulator?country=${country.slug}`} className="btn-ghost mt-3 w-full px-5 py-3">What If I Move?</a></section>
          <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-700"/><div><h2 className="text-sm font-bold text-amber-950">Verify before acting</h2><p className="mt-2 text-xs leading-5 text-amber-900/75">Use official VA, State Department, and destination-government sources for requirements and decisions. No requirement shown here is guaranteed.</p></div></div></section>
        </aside>
      </div>
      <div className="mt-8"><Disclaimer/></div>
    </section>
  </main>;
}

function SetupPlan({countrySlug,onCountry,onStart}:{countrySlug:string;onCountry:(slug:string)=>void;onStart:()=>void}) {
  return <main className="min-h-screen bg-[#f6f7f3]"><StepBar active={4}/><section className="container-shell py-16"><div className="mx-auto max-w-2xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm"><ClipboardCheck className="mx-auto h-10 w-10 text-[#77903b]"/><p className="eyebrow mt-6">International relocation plan</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#17392f]">Choose a destination to plan.</h1><p className="mt-4 text-sm leading-6 text-slate-500">Create a browser-saved demonstration plan for one of VET NOMAD’s supported international destinations.</p><label className="mx-auto mt-7 block max-w-md text-left"><span className="field-label">Destination</span><select className="field-input mt-2" value={countrySlug} onChange={event=>onCountry(event.target.value)}>{countries.map(country=><option key={country.slug} value={country.slug}>{country.name} · {country.city}</option>)}</select></label><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={onStart} className="btn-lime justify-center">Start relocation plan</button><a href={`/simulator?country=${countrySlug}`} className="btn-outline justify-center">What If I Move?</a></div></div></section></main>;
}

function CategoryChecklist({tasks,completed,onToggle}:{tasks:ReturnType<typeof buildRelocationTasks>;completed:Set<string>;onToggle:(id:string)=>void}) {
  const categories = Object.keys(relocationCategoryLabels) as RelocationCategory[];
  return <div className="mt-6 space-y-5">{categories.map(category=><TaskGroup key={category} icon={categoryIcons[category]} title={relocationCategoryLabels[category]} tasks={tasks.filter(task=>task.category===category)} allTasks={tasks} completed={completed} onToggle={onToggle}/>)}</div>;
}

function TimelineChecklist({targetDate,tasks,completed,onToggle}:{targetDate:string;tasks:ReturnType<typeof buildRelocationTasks>;completed:Set<string>;onToggle:(id:string)=>void}) {
  return <div className="mt-6 space-y-5">{timelineOrder.map(stage=><TaskGroup key={stage} icon={<CalendarDays/>} title={timelineLabels[stage]} subtitle={timelineWindow(targetDate,stage)} tasks={tasks.filter(task=>task.timeline===stage)} allTasks={tasks} completed={completed} onToggle={onToggle}/>)}</div>;
}

function TaskGroup({icon,title,subtitle,tasks,allTasks,completed,onToggle}:{icon:React.ReactNode;title:string;subtitle?:string;tasks:ReturnType<typeof buildRelocationTasks>;allTasks:ReturnType<typeof buildRelocationTasks>;completed:Set<string>;onToggle:(id:string)=>void}) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200"><div className="flex items-center gap-3 bg-[#f5f7f4] px-5 py-4"><span className="text-[#77903b] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><h3 className="text-sm font-bold text-[#17392f]">{title}</h3>{subtitle&&<p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}</div></div><div className="divide-y divide-slate-100">{tasks.map(task=>{const dependencies=unmetDependencies(task,allTasks,[...completed]);const done=completed.has(task.id);return <div key={task.id} className="p-5"><div className="flex items-start gap-3"><button type="button" disabled={dependencies.length>0} onClick={()=>onToggle(task.id)} aria-label={`${done?"Mark incomplete":"Complete"}: ${task.title}`} aria-pressed={done} className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${done?"border-[#17392f] bg-[#17392f] text-white":dependencies.length?"cursor-not-allowed border-slate-200 bg-slate-100 text-transparent":"border-slate-300 bg-white text-transparent hover:border-[#77903b]"}`}><Check size={14}/></button><div className="min-w-0 flex-1"><p className={`text-sm font-bold ${done?"text-slate-400 line-through":"text-[#17392f]"}`}>{task.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{task.detail}</p>{dependencies.length>0&&<p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Complete this first: {dependencies.join(", ")}</p>}{task.officialSourceUrl?<a href={task.officialSourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-[#66812f]">Verify with official source</a>:task.officialSourceLabel&&<p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Official source to verify: {task.officialSourceLabel}</p>}</div></div></div>})}</div></section>;
}

function DashboardStat({label,value}:{label:string;value:string}) { return <div className="rounded-xl bg-[#f5f7f4] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xl font-bold text-[#17392f]">{value}</p></div>; }
function Metric({label,value,warning}:{label:string;value:string;warning?:boolean}) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 text-lg font-bold ${warning?"text-rose-600":"text-[#17392f]"}`}>{value}</p></div>; }

function timelineWindow(targetDate:string,stage:TimelineStage) {
  const target=new Date(`${targetDate}T12:00:00`); if(Number.isNaN(target.getTime())) return "Set a valid target date";
  const format=(date:Date)=>date.toLocaleDateString("en-US",{month:"short",year:"numeric"});
  const before=(months:number)=>new Date(target.getFullYear(),target.getMonth()-months,1);
  if(stage==="start-now") return `Begin now · target ${format(target)}`;
  if(stage==="3-6-months") return `${format(before(6))}–${format(before(3))}`;
  if(stage==="1-3-months") return `${format(before(3))}–${format(before(1))}`;
  if(stage==="final-month") return format(before(1));
  return `By ${target.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
}
