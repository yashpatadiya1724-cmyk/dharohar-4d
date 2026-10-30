"use client";

import React from "react";
import Link from "next/link";
import { Landmark, ArrowLeft, Compass, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-950/40 animate-pulse">
        🏛️
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full uppercase tracking-wider">
          Error 404 • Uncharted Shaft
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Subterranean Chamber Not Found
        </h1>
        <p className="text-sm text-slate-400">
          You have wandered into an unexcavated passage. The ancient inscription or digital twin you are seeking is located in another chamber.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-amber-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dharohar 4D Home</span>
        </Link>
        <Link
          href="/epigrapher"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>AI Stone Epigrapher</span>
        </Link>
        <Link
          href="/expedition"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Expedition GIS</span>
        </Link>
      </div>
    </div>
  );
}
