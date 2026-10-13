"use client";

import { useComparisonAvailability } from "@/hooks/use-comparison-availability";

const steps = [
  { label: "Profile", href: "/profile" },
  { label: "Matches", href: "/matches" },
  { label: "Compare", href: "/compare" },
  { label: "Report", href: null },
  { label: "Plan", href: "/plan" },
] as const;

export function StepBar({ active }: { active: number }) {
  const { canCompare } = useComparisonAvailability();

  return <nav aria-label="Demo progress" className="border-b border-slate-200 bg-white"><div className="container-shell flex items-center justify-center overflow-x-auto py-4">
    {steps.map((step, index) => {
      const isCurrent = index === active;
      const isPast = index < active;
      const canOpen = Boolean(step.href) && !isCurrent && ((isPast && index !== 2) || (index === 2 && canCompare));
      const content = <><span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${index <= active ? "bg-[#d7f06b]" : "bg-slate-100"}`}>{index + 1}</span><span className="hidden sm:inline">{step.label}</span></>;
      return <div key={step.label} className="flex items-center">
        {canOpen && step.href ? <a href={step.href} className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[.12em] text-[#17392f] hover:text-[#77903b]`} aria-label={`Go to ${step.label}`}>{content}</a> : <span aria-current={isCurrent ? "step" : undefined} aria-disabled={!isCurrent && !canOpen ? true : undefined} className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[.12em] ${index <= active ? "text-[#17392f]" : "text-slate-300"}`}>{content}</span>}
        {index < steps.length-1 && <span className={`mx-3 h-px w-7 sm:mx-5 sm:w-12 ${index < active ? "bg-[#a9c333]" : "bg-slate-200"}`}/>} 
      </div>;
    })}
  </div></nav>;
}
