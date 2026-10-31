"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Box, Search, CheckCircle, Clock, Sparkles, ExternalLink, Layers, ShieldCheck, Activity } from "lucide-react";

const QUICK_SUGGESTIONS = [
  { label: "Rani Ki Vav", archetype: "stepwell_linear", location: "Patan, Gujarat", period: "1063 AD (UNESCO)" },
  { label: "Adalaj Ni Vav", archetype: "stepwell_linear", location: "Gandhinagar, Gujarat", period: "1498 AD" },
  { label: "Modhera Sun Temple", archetype: "octagonal_kund", location: "Mehsana, Gujarat", period: "1026 AD" },
  { label: "Somnath Temple", archetype: "nagara_shikhara", location: "Veraval, Gujarat", period: "Chaulukya Architecture" },
  { label: "Chand Baori", archetype: "stepped_pyramid_baori", location: "Abhaneri, Rajasthan", period: "9th Century AD" },
  { label: "Kailasa Temple (Ellora)", archetype: "monolithic_rockcut", location: "Ellora Cave 16, Maharashtra", period: "Rashtrakuta Dynasty" },
];

export default function StudioPage() {
  const [siteQuery, setSiteQuery] = useState("Rani Ki Vav");
  const [suggestions, setSuggestions] = useState<any[]>(QUICK_SUGGESTIONS);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  // Auto-generate initial spec on mount
  useEffect(() => {
    handleGenerate("Rani Ki Vav");
  }, []);

  const handleQueryChange = async (val: string) => {
    setSiteQuery(val);
    if (!val.trim()) {
      setSuggestions(QUICK_SUGGESTIONS);
      return;
    }
    try {
      const res = await api.suggestTwin(val);
      if (Array.isArray(res) && res.length > 0) {
        setSuggestions(res);
      }
    } catch (e) {
      // Keep existing suggestions on error
    }
  };

  const handleGenerate = async (queryToUse?: string) => {
    const q = (queryToUse || siteQuery).trim();
    if (!q) return;

    setLoading(true);
    setSiteQuery(q);
    try {
      const jobRecord = await api.submitResearchJob(q, "high");
      setActiveJob(jobRecord);
      setRecentJobs((prev) => [jobRecord, ...prev.filter((j) => j.jobId !== jobRecord.jobId)].slice(0, 5));
    } catch (error) {
      console.error("Failed to generate 3D spec:", error);
      alert("Failed to synthesize digital twin. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const monResult = activeJob?.result?.monument;

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-heritage-bronze/20 text-heritage-gold border border-heritage-bronze/30">
              PRD SECTION 22
            </span>
            <span className="text-xs text-slate-400">Search-to-3D Synthesis Engine & Specification Queue</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Twin Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous procedural 3D digital twin generator with multi-LOD architectural budgeting and PBR shader synthesis
          </p>
        </div>

        {/* Search & Suggestions Bar */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={siteQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Search any Indian Heritage Site (e.g., Rani Ki Vav, Modhera Sun Temple, Somnath)..."
                className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-heritage-gold transition-colors font-medium text-sm"
              />
            </div>
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !siteQuery.trim()}
              className="px-6 py-3 bg-heritage-gold hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 text-sm disabled:bg-slate-800 disabled:text-slate-500"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Synthesizing 3D Spec...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Synthesize 3D Twin
                </>
              )}
            </button>
          </div>

          {/* Quick Select Suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">Monuments:</span>
            {suggestions.slice(0, 6).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerate(s.label)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  siteQuery.toLowerCase() === s.label.toLowerCase()
                    ? "bg-heritage-gold text-slate-950 font-bold"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Synthesis Steps & Pipeline (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Search-to-3D Synthesis Micro-Pipeline */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-heritage-gold" />
                Synthesis Pipeline Progress
              </h2>

              <div className="space-y-2.5">
                {[
                  { name: "Canonical Entity Resolve", ms: "280ms", desc: "Gujarat Gazetteer identification" },
                  { name: "Architectural History Mining", ms: "320ms", desc: "Dynasty & inscription correlation" },
                  { name: "Photogrammetric Spec Alignment", ms: "410ms", desc: "Elevation & shaft depth mapping" },
                  { name: "Multi-LOD Polygon Budgeting", ms: "150ms", desc: "Mesh decimation & tier counts" },
                  { name: "Parametric Geometry Synthesis", ms: "80ms", desc: "Solanki torana & pillar generation" },
                  { name: "PBR Material & Weathering Anchor", ms: "500ms", desc: "Sandstone bump & moisture maps" },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{step.name}</div>
                        <div className="text-[10px] text-slate-400">{step.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {step.ms}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Synthesis Queue */}
            {recentJobs.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-heritage-gold" />
                  Recent Synthesis Queue
                </h3>
                <div className="space-y-2">
                  {recentJobs.map((job, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white">{job.query}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        SYNTHESIZED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Generated 3D Specifications (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeJob ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-heritage-gold uppercase tracking-wider">
                      Architectural Archetype: {monResult?.archetype?.toUpperCase() || "STEPWELL_LINEAR"}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                      {monResult?.label || activeJob.query}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      📍 {monResult?.location || "Patan District, Gujarat"} • Built {monResult?.period || "1063 AD (Solanki / Chaulukya)"}
                    </p>
                  </div>

                  {/* Launch Twin Button */}
                  <a
                    href={`/twin?site=${encodeURIComponent(monResult?.label || activeJob.query)}`}
                    className="flex items-center gap-2 px-5 py-3 bg-heritage-gold hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 self-start sm:self-auto"
                  >
                    <Box className="w-4 h-4" />
                    Launch 4D Digital Twin
                  </a>
                </div>

                {/* Technical Specifications Grid */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-heritage-gold" />
                    Procedural Geometry & Mesh Budgeting
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Polygon Budget</div>
                      <div className="text-white font-mono font-bold text-base mt-0.5">
                        ~48,500 tris
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">Multi-LOD Optimized</div>
                    </div>

                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Depth / Elevation</div>
                      <div className="text-white font-mono font-bold text-base mt-0.5">
                        24.5 meters
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">7 Subterranean Tiers</div>
                    </div>

                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Pillar Count</div>
                      <div className="text-white font-mono font-bold text-base mt-0.5">
                        96 Solanki Columns
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Double-Corbel Brackets</div>
                    </div>

                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Shaders & VFX</div>
                      <div className="text-amber-400 font-mono font-bold text-base mt-0.5">
                        PBR + Caustics
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Volumetric God Rays</div>
                    </div>
                  </div>
                </div>

                {/* Key Architectural Features Identified */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Extracted Architectural Vocabulary
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { title: "Maru-Gurjara Cusped Toranas", desc: "Scalloped archways spanning subterranean pavilion corridors with pendent finials." },
                      { title: "Stepped Baori Ghats", desc: "Triangular zig-zag cascading stone steps lining the flanking retaining walls." },
                      { title: "Faceted Pot-Capital Columns", desc: "Square-to-octagonal stone pillar shafts with Kalasha pot capitals and Kirtimukha brackets." },
                      { title: "Devakoshtha Wall Niches", desc: "Deep recessed ornamental wall shrines housing Dashavatara sculpted relief silhouettes." },
                    ].map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50 flex items-start gap-2.5"
                      >
                        <CheckCircle className="w-4 h-4 text-heritage-gold flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white text-xs">{f.title}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Epigraphical Correlation */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Epigraphical Citation Linked:</span>
                    <span className="text-slate-400 text-[11px]">Epigraphia Indica Vol. IX — Queen Udayamati Chaulukya Foundation Inscription (VS 1120 / 1063 CE)</span>
                  </div>
                  <a
                    href="/epigrapher"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-heritage-terracotta font-bold rounded-lg transition-colors border border-slate-700 flex items-center gap-1 text-[11px] flex-shrink-0 ml-3"
                  >
                    Inspect Inscription <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center shadow-xl">
                <Box className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No 3D Specification Active
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Type a monument name or select a quick suggestion above to run autonomous Search-to-3D synthesis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
