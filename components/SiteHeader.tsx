"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation is more reliable in the hosted runtime. */

import { Menu, Route, X, Zap } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071119]/90 text-white backdrop-blur-xl">
    <div className="container-shell flex h-[72px] items-center justify-between">
      <a href="/" aria-label="CONVOY EV home" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b8ff5a] text-[#071119]"><Zap size={19} fill="currentColor"/></span><span className="text-[15px] font-extrabold tracking-[.16em]">CONVOY EV</span></a>
      <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex"><a href="/" className="hover:text-white">Welcome</a><a href="/dashboard" className="hover:text-white">Dashboard</a><a href="/trip" className="hover:text-white">Trip plan</a><a href="/trip/new" className="btn-electric px-5 py-2.5">New group trip</a></nav>
      <button type="button" className="p-2 md:hidden" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} aria-controls="mobile-navigation">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav id="mobile-navigation" className="container-shell flex flex-col gap-4 border-t border-white/10 py-5 text-sm md:hidden"><a href="/" onClick={()=>setOpen(false)}>Welcome</a><a href="/dashboard" onClick={()=>setOpen(false)}>Dashboard</a><a href="/trip" onClick={()=>setOpen(false)}>Trip plan</a><a href="/trip/new" className="btn-electric justify-center" onClick={()=>setOpen(false)}><Route size={16}/>New group trip</a></nav>}
  </header>;
}
