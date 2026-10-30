"use client";

import React, { useState } from "react";
import Link from "next/link";
import Dharohar3DTwin from "@/components/Dharohar3DTwin";
import {
  Compass,
  FileText,
  History,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  Calendar,
  Volume2,
  ChevronRight,
  Landmark,
  Eye,
  CheckCircle2
} from "lucide-react";

export default function DharoharMainPage() {
  const [currentDepth, setCurrentDepth] = useState<number>(12);
  const [currentEpoch, setCurrentEpoch] = useState<string>("1063");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Blithchron '27 Open Innovation (HC26-CULT01)
            </span>
            <span className="text-xs text-slate-400">IIT Gandhinagar Heritage Digital Twin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <Landmark className="h-9 w-9 text-amber-400" />
            Dharohar 4D: Neural Heritage Digital Twin
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Revitalising dead archival graveyards into living subterranean 3D digital twins, 4D time-travel simulations, AI stone epigraphy restoration, and spatial journey maps.
          </p>
        </div>

        {/* Action Buttons to Studio, Epigrapher & Explorer */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>AI 3D Studio</span>
          </Link>
          <Link
            href="/epigrapher"
            className="inline-flex items-center gap-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 px-4 py-2.5 rounded-xl text-xs font-bold text-purple-200 transition-all shadow-md shadow-purple-950/40"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>AI Stone Epigrapher</span>
          </Link>
          <Link
            href="/expedition"
            className="inline-flex items-center gap-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/80 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-200 transition-all shadow-md shadow-sky-950/40"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Explorer Reconstructor</span>
          </Link>
          <Link
            href="/corridor"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 transition-all shadow-md"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Heritage Corridor</span>
          </Link>
        </div>
      </div>

      {/* 3D WebGL Digital Twin Subterranean Canvas */}
      <section className="space-y-4">
        <Dharohar3DTwin
          onDepthChange={(d) => setCurrentDepth(d)}
          onEpochChange={(ep) => setCurrentEpoch(ep)}
        />
      </section>

      {/* 2 Flagship Innovation Pathways Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Epigrapher */}
        <Link
          href="/dharohar/epigrapher"
          className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 hover:border-purple-500 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Computer Vision + Indic NLP
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              AI Ancient Epigrapher & Script Decipherer
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Recovers eroded Sanskrit, early Devanagari, and Old Gujarati stone inscriptions using neural glyph inpainting. Generates word-level IAST transliteration, modern Hindi translation, and dynastic attribution.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-400 pt-4 border-t border-slate-800">
            <span>Decipher Historical Steles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Expedition Reconstructor */}
        <Link
          href="/dharohar/expedition"
          className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 hover:border-sky-500 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                IITGN Fellowship Ingestion
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
              Explorer Expedition Reconstructor & GIS Itinerary
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Takes dormant field folders of 340+ photogrammetry captures, GPS waypoints, and travel notes — dynamically stitching them into an animated spatial journey across Gujarat's stepwells and monuments.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-sky-400 pt-4 border-t border-slate-800">
            <span>Explore Spatial Journeys</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* Architectural Dissection & Technical Specifications */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Architectural Layer Dissection (Gujarat Subterranean Engineering)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Solanki & Maru-Gurjara Style</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-amber-400">Tier 1: Torana Entrance</div>
            <div className="text-[11px] text-slate-400">Ground Level (0.0m to -2.0m)</div>
            <p className="text-xs text-slate-300 mt-2">
              Triple-entrance mandapa pavilion with ornamental bracket capitals and protective canopies.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-sky-400">Tier 2–3: Pavilion Galleries</div>
            <div className="text-[11px] text-slate-400">Intermediate (-2.0m to -14.0m)</div>
            <p className="text-xs text-slate-300 mt-2">
              48 sculpted pillars providing cross-ventilation, resting platforms, and thermal relief.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-purple-400">Tier 4–5: Subterranean Shaft</div>
            <div className="text-[11px] text-slate-400">Deep Shaft (-14.0m to -21.0m)</div>
            <p className="text-xs text-slate-300 mt-2">
              Octagonal light shaft illuminating carved niches of Ami Khumbor (water pot of life) and Kalpavriksha.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-emerald-400">Bottom Cistern & Aquifer</div>
            <div className="text-[11px] text-slate-400">Water Table (-21.0m to -24.5m)</div>
            <p className="text-xs text-slate-300 mt-2">
              Deep groundwater reservoir maintaining natural 5–6°C cooling compared to ambient desert heat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
