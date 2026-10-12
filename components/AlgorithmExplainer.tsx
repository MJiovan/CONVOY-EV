import { Calculator } from "lucide-react";
import { SCORE_WEIGHTS } from "@/lib/matching";

export function AlgorithmExplainer({ compact = false }: { compact?: boolean }) {
  const weights = [
    ["Affordability", SCORE_WEIGHTS.affordability],
    ["Savings potential", SCORE_WEIGHTS.savings],
    ["Housing", SCORE_WEIGHTS.housing],
    ["Lifestyle match", SCORE_WEIGHTS.lifestyle],
    ["Residency feasibility", SCORE_WEIGHTS.residency],
  ] as const;
  return <section className={`rounded-[24px] border border-slate-200 bg-white ${compact ? "p-5" : "p-6 sm:p-7"}`}><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf3e8] text-[#17392f]"><Calculator size={18}/></span><div><p className="text-sm font-bold text-[#17392f]">How the score is calculated</p><p className="mt-1 text-xs leading-5 text-slate-500">Five category scores are combined with fixed weights. There is no randomness.</p></div></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{weights.map(([label,weight])=><div key={label} className="rounded-xl bg-[#f5f7f4] p-3"><p className="text-lg font-bold text-[#17392f]">{weight}%</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{label}</p></div>)}</div>{!compact && <p className="mt-4 text-xs leading-5 text-slate-500"><b className="text-slate-700">Monthly remaining</b> = VA income + other income − ongoing monthly expenses − estimated destination living cost. Housing is already included in the destination living-cost estimate and is also checked separately against your housing limit.</p>}</section>;
}
