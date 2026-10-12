import { StepBar } from "@/components/StepBar";

export function FlowLoading({ active }: { active: number }) {
  return <main className="min-h-screen bg-[#f6f7f3]"><StepBar active={active}/><div className="container-shell py-16"><div className="mx-auto h-2 w-36 animate-pulse rounded-full bg-slate-200"/><p className="mt-4 text-center text-xs font-semibold uppercase tracking-[.14em] text-slate-400">Loading your saved demo state</p></div></main>;
}
