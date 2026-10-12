export function ScoreRing({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? 164 : size === "sm" ? 74 : 104;
  const stroke = size === "lg" ? 12 : 9;
  const radius = (dims - stroke) / 2;
  const circumference = Math.PI * 2 * radius;
  const dash = circumference * score / 100;
  return <div className="relative shrink-0" style={{ width: dims, height: dims }}>
    <svg className="-rotate-90" width={dims} height={dims} aria-hidden="true">
      <circle cx={dims/2} cy={dims/2} r={radius} fill="none" stroke="#e7ece8" strokeWidth={stroke}/>
      <circle cx={dims/2} cy={dims/2} r={radius} fill="none" stroke="#d7f06b" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circumference-dash}`}/>
    </svg>
    <div className="absolute inset-0 grid place-content-center text-center"><span className={`${size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl"} font-bold tracking-tight text-[#17392f]`}>{score}</span><span className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">of 100</span></div>
  </div>;
}
