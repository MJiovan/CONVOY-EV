import { FlaskConical } from "lucide-react";

export function DemoDataBadge({ inverse = false }: { inverse?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.14em] ${inverse ? "border-white/15 bg-white/10 text-white/75" : "border-amber-200 bg-amber-50 text-amber-800"}`}><FlaskConical size={11}/> Demo data</span>;
}
