"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  MapPin,
  Layers,
  Filter,
  Landmark,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  Calendar,
  Eye,
  CheckCircle2,
  Navigation
} from "lucide-react";

export default function HeritageCorridorPage() {
  const [loci, setLoci] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("adalaj");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLoci = async () => {
      try {
        const res = await api.getLoci();
        if (res && res.features) {
          const list = res.features.map((f: any) => f.properties);
          setLoci(list);
          if (list.length > 0) setSelectedId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load loci:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoci();
  }, []);

  const activeLocus = loci.find((l) => l.id === selectedId) || loci[0];

  const filteredLoci = loci.filter((item) => {
    const matchType = filterType === "all" || item.type.toLowerCase() === filterType.toLowerCase();
    const matchDist = filterDistrict === "all" || item.district.toLowerCase() === filterDistrict.toLowerCase();
    return matchType && matchDist;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Module D: Gujarat Heritage Corridor
            </span>
            <span className="text-xs text-slate-400">IITGN Explorer Fellowship Spatial Locus Explorer</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3 text-white">
            <MapPin className="h-8 w-8 text-amber-400" />
            Gujarat Heritage Corridor GIS Locus
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Interactive spatial registry linking medieval subterranean stepwells, equinoctial solar temples, and mercantile timber havelis along Gujarat's sacred hydraulic and architectural corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-md"
          >
            <Landmark className="w-4 h-4 text-amber-400" />
            <span>Open in 3D Twin</span>
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>3D Studio</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Type:
          </span>
          {["all", "stepwell", "temple", "haveli", "monument"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                filterType === t
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">District:</span>
          {["all", "Gandhinagar", "Patan", "Mehsana", "Ahmedabad", "Gir Somnath"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDistrict(d)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterDistrict === d
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Interactive Map Visual + Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Corridor Spatial Radar / Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 overflow-hidden shadow-2xl min-h-[460px] flex flex-col justify-between">
            {/* Topographic Background Grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Header overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Gujarat Western Corridor Locus Map
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Latitude 20.8°N — 24.0°N • Longitude 70.4°E — 72.7°E
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredLoci.length} Monuments Filtered
              </span>
            </div>

            {/* Gujarat Schematic Spatial Canvas View */}
            <div className="relative z-10 my-4 h-72 w-full border border-slate-800/80 rounded-2xl bg-slate-950/80 p-4 flex flex-col justify-between relative overflow-hidden">
              {/* Route connecting line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path
                  d="M 120 220 Q 220 180 340 120 T 480 50"
                  fill="none"
                  stroke="url(#corridorGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
              </svg>

              {/* Pins on the Map */}
              <div className="absolute inset-0 p-6">
                {filteredLoci.map((loc, idx) => {
                  // Coordinate normalization across Gujarat bounding box:
                  // Lat: 20.8 (bottom) to 24.0 (top)
                  // Lon: 70.4 (left) to 73.0 (right)
                  const topPercent = Math.max(12, Math.min(84, 100 - ((loc.lat - 20.8) / (24.0 - 20.8)) * 80));
                  const leftPercent = Math.max(12, Math.min(84, ((loc.lon - 70.4) / (73.0 - 70.4)) * 80 + 10));

                  const isSelected = loc.id === selectedId;

                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedId(loc.id)}
                      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl transition-all group flex items-center gap-2 z-20 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 scale-110 shadow-xl"
                          : "bg-slate-900/90 text-amber-300 border border-amber-500/30 hover:scale-105 hover:bg-slate-850 shadow-md"
                      }`}
                      title={`${loc.name} (${loc.district})`}
                    >
                      <MapPin className={`w-4 h-4 ${isSelected ? "text-slate-950 fill-current" : "text-amber-400"}`} />
                      <span className="text-[11px] font-bold whitespace-nowrap hidden sm:inline">
                        {loc.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend overlay */}
              <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 space-y-0.5 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Subterranean Stepwells (Vav)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span>Solar & Nagara Temples</span>
                </div>
              </div>
            </div>

            {/* Corridor List Chips */}
            <div className="relative z-10 flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {filteredLoci.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedId === item.id
                      ? "bg-amber-500/20 border border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Monument Heritage Card (5 Cols) */}
        {activeLocus && (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Photo preview */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={activeLocus.image_url}
                  alt={activeLocus.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase">
                    {activeLocus.type}
                  </span>
                  <span className="bg-slate-950/80 backdrop-blur-md text-amber-300 font-semibold px-2 py-0.5 rounded-lg border border-amber-500/30 text-[10px]">
                    {activeLocus.era}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-400 font-bold">{activeLocus.district} District</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeLocus.lat.toFixed(4)}°N, {activeLocus.lon.toFixed(4)}°E
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1 leading-tight">{activeLocus.name}</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">{activeLocus.style}</p>
              </div>

              {/* Status and Patron badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Dynasty & Patron</div>
                  <div className="text-xs font-bold text-amber-300 truncate mt-0.5">{activeLocus.dynasty}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Heritage Status</div>
                  <div className="text-xs font-bold text-emerald-400 truncate mt-0.5">{activeLocus.unesco_status}</div>
                </div>
              </div>

              {/* Architectural Summary */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-normal">
                {activeLocus.summary}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={activeLocus.links?.twin || `/twin?site=${activeLocus.id}`}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Landmark className="w-3.5 h-3.5 fill-current" />
                  <span>Open in 3D Twin</span>
                </Link>
                <Link
                  href={`/studio?q=${encodeURIComponent(activeLocus.name)}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Synthesize in Studio</span>
                </Link>
              </div>

              {activeLocus.links?.epigrapher && (
                <Link
                  href={activeLocus.links.epigrapher}
                  className="w-full bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-bold px-3 py-2 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>📜 Decipher Associated Stone Inscription</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
