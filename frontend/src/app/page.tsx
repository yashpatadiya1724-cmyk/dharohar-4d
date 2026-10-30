"use client";

import React, { useState } from "react";
import Link from "next/link";
import Dharohar3DTwin from "@/components/Dharohar3DTwin";
import {
  Landmark,
  FileText,
  Compass,
  History,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  Calendar,
  Volume2,
  ChevronRight,
  Eye,
  CheckCircle2,
  BookOpen,
  Camera,
  Navigation
} from "lucide-react";

export default function DharoharHomePage() {
  const [currentDepth, setCurrentDepth] = useState<number>(12);
  const [currentEpoch, setCurrentEpoch] = useState<string>("1063");
  const [selectedLocus, setSelectedLocus] = useState<number>(0);

  const heritageLoci = [
    {
      id: "adalaj",
      name: "Adalaj Ni Vav (અડાલજની વાવ)",
      location: "Gandhinagar District, Gujarat (15 km from IITGN)",
      period: "1498 AD (Queen Rudabai)",
      style: "Solanki - Indo-Islamic Synthesis",
      depth: "24.5 meters (5 Stories)",
      highlight: "5-Tier Subterranean Octagonal Shaft & Sanskrit Edict",
      coordinates: "23.1667° N, 72.5800° E",
    },
    {
      id: "ranikivav",
      name: "Rani Ki Vav (રાણકી વાવ)",
      location: "Patan, Northern Gujarat",
      period: "1063 AD (Queen Udayamati)",
      style: "Peak Maru-Gurjara Solanki",
      depth: "28.0 meters (7 Stories)",
      highlight: "UNESCO World Heritage Site with 500+ Dashavatara Sculptures",
      coordinates: "23.8589° N, 72.1017° E",
    },
    {
      id: "modhera",
      name: "Modhera Sun Temple & Surya Kund",
      location: "Mehsana District, Gujarat",
      period: "1026 AD (King Bhimadeva I)",
      style: "Chaulukya Solar Architecture",
      depth: "12.0 meters (Step Tank)",
      highlight: "Equinox Solar Alignment & 108 Stepped Miniature Shrines",
      coordinates: "23.5835° N, 72.1330° E",
    },
    {
      id: "siddhpur",
      name: "Rudra Mahalaya & Merchant Havelis",
      location: "Siddhpur, Patan District",
      period: "12th to 19th Century",
      style: "Solanki Ruins & Bohra Wooden Facades",
      depth: "Surface Architectural Complex",
      highlight: "Intricate Carved Wooden Toranas & Subterranean Secret Tunnels",
      coordinates: "23.9167° N, 72.3833° E",
    },
  ];

  return (
    <div className="space-y-10">
      {/* 1. Grand Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Blithchron '27 Open Innovation • Track HC26-CULT01</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Dharohar 4D
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                The Neural Heritage Digital Twin & Ancient Epigraphy Engine
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Breathes life into unstructured cultural documentation collected by students during IIT Gandhinagar's Explorer Fellowship. Converting dormant archival graveyards into interactive 3D subterranean digital twins, 4D time-travel simulations, AI stone epigraphy restoration, and spatial journey maps.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/epigrapher"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/30"
              >
                <FileText className="w-4 h-4" />
                <span>AI Stone Epigrapher</span>
              </Link>

              <Link
                href="/expedition"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Explorer Reconstructor</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 self-start md:self-auto shrink-0 text-center">
            <div className="p-2">
              <div className="text-2xl font-black text-amber-400">1063 AD</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Solanki Epoch</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-sky-400">5 Tiers</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Subterranean Shaft</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-purple-400">98.2%</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Glyph Restoration</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-emerald-400">340+</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">IITGN Artifacts</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Flagship Stage: 3D Subterranean Stepwell Digital Twin */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                Three.js WebGL Engine
              </span>
              <span className="text-xs text-slate-400">• Real-Time Shadow Raytracer & Web Audio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Adalaj Subterranean Stepwell 3D Digital Twin
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            💡 Drag with mouse to orbit 360° • Scroll to zoom
          </span>
        </div>

        {/* The Full 3D Canvas */}
        <Dharohar3DTwin
          onDepthChange={(d) => setCurrentDepth(d)}
          onEpochChange={(ep) => setCurrentEpoch(ep)}
        />
      </section>

      {/* 3. The 2 Flagship Innovation Pathways */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathway 1: AI Epigrapher */}
        <Link
          href="/epigrapher"
          className="group relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 hover:border-purple-500 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Vision Transformer + Indic NLP
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              AI Ancient Epigrapher & Script Decipherer
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Recovers eroded Sanskrit, early Devanagari, and Old Gujarati stone inscriptions using neural glyph inpainting. Generates word-level IAST transliteration, modern Hindi translation, and dynastic attribution.
            </p>

            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1 font-serif text-amber-200/80">
              <div>"संवत् १५५५ वर्षे माघ सुदि ५... [क्षतिग्रस्त]... वीरसिंह नृपतेः महिषी रुदादेवी..."</div>
              <div className="text-[11px] text-purple-400 font-sans">
                ✓ Inpainted 14 missing glyphs with 98.2% confidence
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-400 pt-4 border-t border-slate-800">
            <span>Decipher Stone Inscriptions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Pathway 2: Expedition Reconstructor */}
        <Link
          href="/expedition"
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

            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-sky-400 font-semibold">
                <span>IITGN Palaj ➔ Adalaj ➔ Modhera ➔ Patan</span>
                <span>164 km</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Automated NLP extraction for folklore tags, architectural styles, and GPS coords.
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs font-bold text-sky-400 pt-4 border-t border-slate-800">
            <span>Explore Spatial Journeys</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 4. Interactive Heritage Loci of Gujarat */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Gujarat Heritage Corridor: Documented Loci
            </h3>
            <p className="text-xs text-slate-400">
              Click any monument in the research corridor to inspect subterranean parameters and historical context
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-full">
            4 Prime Loci Mapped
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {heritageLoci.map((locus, idx) => {
            const isSelected = selectedLocus === idx;
            return (
              <button
                key={locus.id}
                onClick={() => setSelectedLocus(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20 shadow-lg"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {locus.period}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">{locus.name}</h4>
                <p className="text-xs text-slate-400 mt-1 truncate">{locus.location}</p>
                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-2">
                  <span>{locus.depth}</span>
                  <span className="text-amber-300 font-medium">Inspect</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Locus Detail Strip */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Architectural Style</div>
            <div className="font-bold text-white mt-0.5">{heritageLoci[selectedLocus].style}</div>
          </div>
          <div>
            <div className="text-slate-400">Key Subterranean Feature</div>
            <div className="font-bold text-amber-400 mt-0.5">{heritageLoci[selectedLocus].highlight}</div>
          </div>
          <div>
            <div className="text-slate-400">Geospatial Coordinates</div>
            <div className="font-mono text-sky-400 mt-0.5">{heritageLoci[selectedLocus].coordinates}</div>
          </div>
        </div>
      </section>

      {/* 5. Architectural Science & Subterranean Engineering */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Subterranean Passive Climate Engineering (Gujarat Ancient Science)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">Natural -6°C Cooling</span>
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
