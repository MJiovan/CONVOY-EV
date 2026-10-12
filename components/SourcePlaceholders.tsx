import { Landmark } from "lucide-react";

export function SourcePlaceholders({ countryName }: { countryName: string }) {
  const sources = [
    { name: "U.S. Department of Veterans Affairs", use: "VA benefits and Foreign Medical Program guidance" },
    { name: "U.S. Department of State", use: "Travel advisories and destination information" },
    { name: `${countryName} official immigration authority`, use: "Visa, residency, and financial requirements" },
  ];
  return <section className="rounded-[26px] border border-dashed border-slate-300 bg-white p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-[#17392f]"><Landmark size={20}/></span><div><p className="eyebrow">Future official sources</p><h2 className="mt-1 text-xl font-bold text-[#17392f]">Verification placeholders</h2><p className="mt-2 text-sm leading-6 text-slate-500">These labels show where verified links and update dates will be connected in a future version. No source URL is claimed yet.</p></div></div><div className="mt-6 grid gap-3">{sources.map(source=><div key={source.name} className="flex flex-col justify-between gap-2 rounded-xl bg-[#f5f7f4] p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-[#17392f]">{source.name}</p><p className="mt-1 text-xs text-slate-500">{source.use}</p></div><span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Source to add</span></div>)}</div></section>;
}
