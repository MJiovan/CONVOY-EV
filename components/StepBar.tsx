const steps = ["Profile", "Matches", "Compare", "Report"];
export function StepBar({ active }: { active: number }) {
  return <div className="border-b border-slate-200 bg-white"><div className="container-shell flex items-center justify-center overflow-x-auto py-4">
    {steps.map((step, index) => <div key={step} className="flex items-center"><div className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[.12em] ${index <= active ? "text-[#17392f]" : "text-slate-300"}`}><span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${index <= active ? "bg-[#d7f06b]" : "bg-slate-100"}`}>{index + 1}</span><span className="hidden sm:inline">{step}</span></div>{index < steps.length-1 && <span className={`mx-3 h-px w-7 sm:mx-5 sm:w-12 ${index < active ? "bg-[#a9c333]" : "bg-slate-200"}`}/>}</div>)}
  </div></div>;
}
