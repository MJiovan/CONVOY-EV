"use client";

import Link from "next/link";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102720]/90 text-white backdrop-blur-xl">
      <div className="container-shell flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="VET NOMAD home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7f06b] text-[#102720]"><Compass size={19} strokeWidth={2.3}/></span>
          <span className="text-[15px] font-bold tracking-[.19em]">VET NOMAD</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-white">How it works</Link>
          <Link href="/matches" className="transition hover:text-white">Explore countries</Link>
          <Link href="/compare" className="transition hover:text-white">Compare</Link>
          <Link href="/profile" className="btn-lime px-5 py-2.5 text-sm">Find my countries</Link>
        </nav>
        <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <nav className="container-shell flex flex-col gap-4 border-t border-white/10 py-5 text-sm md:hidden">
        <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
        <Link href="/matches" onClick={() => setOpen(false)}>Explore countries</Link>
        <Link href="/compare" onClick={() => setOpen(false)}>Compare</Link>
        <Link href="/profile" className="btn-lime w-full text-center" onClick={() => setOpen(false)}>Find my countries</Link>
      </nav>}
    </header>
  );
}
