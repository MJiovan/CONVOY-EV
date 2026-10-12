import { ShieldAlert } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return <div className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 ${compact ? "p-4" : "p-5 sm:p-6"}`}>
    <div className="flex items-start gap-3">
      <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={20}/>
      <div><p className="text-sm font-bold">Planning information, not professional advice</p><p className="mt-1 text-xs leading-5 text-amber-900/75 sm:text-sm">VET NOMAD uses demonstration estimates for planning. Immigration requirements, VA policies, healthcare rules, and living costs can change. Verify important decisions with official U.S. and destination-country government sources. A score does not guarantee visa eligibility or mean that you should move.</p></div>
    </div>
  </div>;
}
