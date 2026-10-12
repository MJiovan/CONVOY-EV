"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation is required by the hosted runtime. */

import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { useComparisonAvailability } from "@/hooks/use-comparison-availability";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { canCompare, selectionCount } = useComparisonAvailability();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102720]/90 text-white backdrop-blur-xl">
      <div className="container-shell flex h-[72px] items-center justify-between">
        <a href="/" className="flex items-center gap-3" aria-label="VET NOMAD home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7f06b] text-[#102720]"><Compass size={19} strokeWidth={2.3}/></span>
          <span className="text-[15px] font-bold tracking-[.19em]">VET NOMAD</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
          <a href="/#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="/matches" className="transition hover:text-white">Explore countries</a>
          {canCompare ? <a href="/compare" className="transition hover:text-white">Compare</a> : <span aria-disabled="true" title="Select at least two countries to compare" className="cursor-not-allowed text-white/30">Compare</span>}
          <a href="/profile" className="btn-lime px-5 py-2.5 text-sm">Find my countries</a>
        </nav>
        <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-navigation">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <nav id="mobile-navigation" className="container-shell flex flex-col gap-4 border-t border-white/10 py-5 text-sm md:hidden">
        <a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a>
        <a href="/matches" onClick={() => setOpen(false)}>Explore countries</a>
        {canCompare ? <a href="/compare" onClick={() => setOpen(false)}>Compare ({selectionCount})</a> : <span aria-disabled="true" className="text-white/35">Compare · select 2 countries</span>}
        <a href="/profile" className="btn-lime w-full text-center" onClick={() => setOpen(false)}>Find my countries</a>
      </nav>}
    </header>
  );
}
