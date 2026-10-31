"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Search,
  Landmark,
  Compass,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sun,
  Eye,
  Download,
  Share2,
  Globe,
  Camera,
  MapPin,
  Maximize2
} from "lucide-react";

// Dynamically import Three.js viewer with SSR disabled
const VFXEngine = dynamic(() => import("@/components/3d/VFXEngine"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
      <div className="w-10 h-10 border-4 border-heritage-gold border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-white font-bold text-sm">Synthesizing 4D Procedural Twin...</div>
      <div className="text-slate-500 text-xs mt-1">Parametric Geometry • AWS Terrain DEM • OSM Footprint</div>
    </div>
  ),
});

// Demo quick select places (PRD Section 12.2)
const DEMO_PRESETS = [
  { id: "akshardham", name: "Akshardham Gandhinagar" },
  { id: "taj-mahal", name: "Taj Mahal" },
  { id: "adalaj", name: "Adalaj Stepwell" },
  { id: "rani-ki-vav", name: "Rani Ki Vav" },
  { id: "modhera", name: "Modhera Sun Temple" },
  { id: "sanchi", name: "Sanchi Stupa" },
  { id: "qutub-minar", name: "Qutub Minar" },
  { id: "somnath", name: "Somnath Temple" },
  { id: "kailasa", name: "Kailasa Temple" },
];

export default function PlaceExplorerPage() {
  const [query, setQuery] = useState("Adalaj Stepwell");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePlace, setActivePlace] = useState<any>(null);

  // Stepper state
  const [researchSteps, setResearchSteps] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);

  // 4D Time & Solar Telemetry
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [solarTime, setSolarTime] = useState(12); // 12 PM Noon
  const [qualityTier, setQualityTier] = useState<"low" | "medium" | "high">("high");
  const [cameraView, setCameraView] = useState<"overview" | "gallery" | "shaft" | "water">("overview");

  // Multi-lingual Narration (Web Speech API)
  const [language, setLanguage] = useState<"en" | "hi" | "gu">("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSubtitle, setSpeechSubtitle] = useState<string>("");
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Notifications
  const [copyNotice, setCopyNotice] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Handle Autocomplete with 300ms debounce (PRD F1)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const results = await api.getExploreSuggestions(query);
        setSuggestions(results);
      } catch (err) {
        // silent fail for suggestions
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main Research & Place Loader
  const handleSearchPlace = async (targetQuery: string) => {
    if (!targetQuery.trim()) return;

    setLoading(true);
    setIsResearching(true);
    setShowSuggestions(false);
    stopNarration();
    setCurrentEpoch(0);

    // Initial Stepper animation (PRD Section 4)
    const initialSteps = [
      { step: 1, name: "Resolving Place Identity & QID", status: "running", detail: "Querying OSM Nominatim & Wikidata..." },
      { step: 2, name: "Retrieving Wikipedia History & Facts", status: "pending", detail: "Collecting verified open citations" },
      { step: 3, name: "Fetching Open-License Photos", status: "pending", detail: "Wikimedia Commons CC-BY / Public Domain" },
      { step: 4, name: "Constructing Terrain & OSM Buildings", status: "pending", detail: "AWS Terrarium DEM elevation bounds" },
      { step: 5, name: "Synthesizing Multi-Lingual Story", status: "pending", detail: "Generating English, Hindi & Gujarati scripts" },
      { step: 6, name: "Building Parametric 3D Procedural Twin", status: "pending", detail: "Generating PBR textures & ashlar geometry" },
    ];
    setResearchSteps(initialSteps);

    try {
      // Start research job
      const job = await api.startExploreJob(targetQuery, language, qualityTier);

      // Simulate rapid stepper completion for snappy UX
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 120));
        setResearchSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx <= i ? "done" : idx === i + 1 ? "running" : "pending",
          }))
        );
      }

      // Fetch complete place dossier
      const placeData = await api.getExplorePlace(job.slug || targetQuery);
      setActivePlace(placeData);
      setQuery(placeData.name.split(" (")[0]);
    } catch (error) {
      console.error("Failed to explore place:", error);
      // Fallback to adalaj
      try {
        const fallback = await api.getExplorePlace("adalaj");
        setActivePlace(fallback);
      } catch (e) {
        // Handle error
      }
    } finally {
      setLoading(false);
      setIsResearching(false);
    }
  };

  // Initial load on mount (Adalaj Stepwell)
  useEffect(() => {
    handleSearchPlace("Adalaj Stepwell");
  }, []);

  // Web Speech API Narration Player (PRD F14)
  const toggleNarration = () => {
    if (!synthRef.current || !activePlace) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setSpeechSubtitle("");
      return;
    }

    const script = activePlace.narration?.[language] || activePlace.narration?.en || activePlace.summary;
    if (!script) return;

    synthRef.current.cancel(); // Clear any previous queue
    const utterance = new SpeechSynthesisUtterance(script);

    // Pick appropriate voice
    const voices = synthRef.current.getVoices();
    if (language === "hi") {
      utterance.voice = voices.find((v) => v.lang.startsWith("hi")) || null;
      utterance.lang = "hi-IN";
    } else if (language === "gu") {
      utterance.voice = voices.find((v) => v.lang.startsWith("gu")) || null;
      utterance.lang = "gu-IN";
    } else {
      utterance.voice = voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en-GB") || v.lang.startsWith("en")) || null;
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechSubtitle(script);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechSubtitle("");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechSubtitle("");
    };

    synthRef.current.speak(utterance);
  };

  const stopNarration = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setSpeechSubtitle("");
  };

  // Switch narration language
  const handleLanguageChange = (newLang: "en" | "hi" | "gu") => {
    stopNarration();
    setLanguage(newLang);
  };

  // Copy shareable link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/explore?q=${encodeURIComponent(query)}`);
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2500);
    }
  };

  // Download JSON Dossier (PRD F16)
  const handleDownloadJSON = () => {
    if (!activePlace) return;
    const blob = new Blob([JSON.stringify(activePlace, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePlace.slug || "place"}-4d-dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Active Archetype mapped to Three.js VFX Archetype
  const vfxArchetype = useMemo(() => {
    const arch = (activePlace?.spec?.archetype || activePlace?.archetype || "stepwell_linear").toLowerCase();
    if (arch.includes("akshardham") || arch.includes("swaminarayan")) return "akshardham_mandir";
    if (arch.includes("tomb") || arch.includes("mausoleum") || arch.includes("dome") || arch.includes("taj")) return "domed_mausoleum";
    if (arch.includes("hawa") || arch.includes("palace") || arch.includes("haveli")) return "haveli_palace";
    if (arch.includes("golden") || arch.includes("harmandir")) return "golden_temple";
    if (arch.includes("stepwell")) return "stepwell_linear";
    if (arch.includes("kund")) return "kund_stepped";
    if (arch.includes("rockcut")) return "monolithic_rockcut";
    if (arch.includes("stupa")) return "stupa";
    if (arch.includes("tower") || arch.includes("minar")) return "tower";
    if (arch.includes("nagara") || arch.includes("temple")) return "nagara_shikhara";
    if (arch.includes("chariot")) return "chariot_mandapa";
    return "stepwell_linear";
  }, [activePlace]);

  // Current Epoch Data
  const currentEpochItem = activePlace?.timeline?.[currentEpoch] || activePlace?.timeline?.[0];

  return (
    <div className="pt-16 min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Search & Stepper Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-16 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 border border-heritage-gold/40 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-heritage-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">Place Explorer 4D</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  STUDENT FREE EDITION • RS 0
                </span>
              </div>
              <p className="text-slate-400 text-xs hidden sm:block">
                Autonomous open research • 4D historical time slider • Web Speech tour narration
              </p>
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="w-full md:max-w-xl relative" ref={searchBoxRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchPlace(query)}
                  placeholder="Type any place (e.g. Sanchi Stupa, Rani Ki Vav, Qutub Minar)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-heritage-gold transition-colors text-sm font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                {/* Autocomplete Suggestions (PRD F1) */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchPlace(s.name.split(" (")[0])}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Landmark className="w-3.5 h-3.5 text-heritage-gold group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold text-white">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {s.badge || s.archetype}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSearchPlace(query)}
                disabled={loading}
                className="px-5 py-2.5 bg-heritage-gold hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 flex-shrink-0"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Explore
              </button>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
              <span className="font-semibold uppercase text-[10px] mr-1 text-slate-500">Quick:</span>
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSearchPlace(p.name)}
                  className={`px-2.5 py-0.5 rounded-lg border transition-all whitespace-nowrap ${
                    query.toLowerCase().includes(p.id)
                      ? "bg-heritage-gold/20 border-heritage-gold text-heritage-gold font-bold"
                      : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6-Step Research Progress Stepper (PRD Section 4) */}
        {isResearching && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800/80 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {researchSteps.map((step) => (
                <div
                  key={step.step}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    step.status === "done"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : step.status === "running"
                      ? "bg-amber-500/15 border-amber-500/50 text-heritage-gold animate-pulse"
                      : "bg-slate-800/30 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                    <span>0{step.step}</span>
                    <span className="truncate">{step.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Split View: Left (Dossier & Narration) | Right (3D Cinematic & 4D Time) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Research Dossier, Timeline, Narration & Facts */}
        <div className="w-full lg:w-[480px] xl:w-[540px] flex-shrink-0 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6 shadow-2xl">
          {activePlace ? (
            <>
              {/* Place Identity & Honesty Badge (PRD F8) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-heritage-gold border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {activePlace.honesty_badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    QID: {activePlace.qid}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {activePlace.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>
                    Lat: {activePlace.location?.lat?.toFixed(4)}°, Lon: {activePlace.location?.lon?.toFixed(4)}°
                    {activePlace.location?.elevation_m && ` • Elevation ${activePlace.location.elevation_m}m DEM`}
                  </span>
                </div>
              </div>

              {/* Multi-Lingual Narration Player (PRD F14 - Web Speech API) */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-heritage-gold animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      AI Voice Tour Narration (Free)
                    </span>
                  </div>

                  {/* Language Selector (en, hi, gu) */}
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    {[
                      { id: "en", label: "EN" },
                      { id: "hi", label: "हिंदी" },
                      { id: "gu", label: "ગુજરાતી" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleLanguageChange(l.id as any)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          language === l.id
                            ? "bg-heritage-gold text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleNarration}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isSpeaking
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                        : "bg-heritage-gold hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Play Voice Tour
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    {activePlace.narration?.[language] || activePlace.narration?.en}
                  </p>
                </div>

                {/* Live Synchronous Subtitles Banner */}
                {speechSubtitle && (
                  <div className="mt-3 p-3 bg-heritage-gold/10 border border-heritage-gold/30 rounded-xl text-xs text-amber-200 leading-relaxed font-serif animate-fadeIn">
                    <span className="text-[10px] font-mono text-heritage-gold uppercase block font-bold mb-1">
                      Live Narration Subtitles ({language.toUpperCase()}):
                    </span>
                    &ldquo;{speechSubtitle}&rdquo;
                  </div>
                )}
              </div>

              {/* Verified Historical Summary (Wikipedia & Wikidata) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Historical Overview & Synthesis
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                  {activePlace.summary}
                </p>
              </div>

              {/* 4D Chronological Timeline (PRD F11) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-heritage-gold" />
                    4D Chronological Horizons ({activePlace.timeline?.length || 4} Epochs)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Click to travel in time</span>
                </div>

                <div className="space-y-2.5">
                  {activePlace.timeline?.map((item: any, idx: number) => {
                    const isSelected = currentEpoch === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentEpoch(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-slate-800 border-heritage-gold shadow-lg ring-1 ring-heritage-gold/40"
                            : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-white text-sm">
                            {item.year < 0 ? `${Math.abs(item.year)} BCE` : `${item.year} CE`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-900 border border-slate-700 text-heritage-gold">
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 mb-0.5">{item.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Source: {item.source}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verified Facts with Wikidata Citations (PRD F3) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Historical Facts & Citations
                </h3>
                <div className="space-y-2">
                  {activePlace.facts?.map((fact: any, fIdx: number) => (
                    <div
                      key={fIdx}
                      className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <p className="text-slate-200 leading-relaxed font-medium">{fact.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                        <span>Source: {fact.source}</span>
                        {fact.source_url && (
                          <a
                            href={fact.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-0.5"
                          >
                            Verify <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open-License Photo Gallery with Attribution (PRD F5 & Section 10) */}
              {activePlace.photos && activePlace.photos.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    Wikimedia Commons Gallery (Open License)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {activePlace.photos.map((p: any, pIdx: number) => (
                      <div key={pIdx} className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                        <img
                          src={p.thumb || p.url}
                          alt={p.title}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-2 bg-slate-900/90 text-[10px] text-slate-400">
                          <div className="font-semibold text-white truncate">{p.title}</div>
                          <div className="text-slate-500 truncate">By {p.author} • {p.license}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Honesty & Limitations Disclaimer (PRD Section 10) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Academic Honesty & Reconstruction Notice
                </div>
                <p>
                  This 3D scene is a parametric architectural model reconstructed from open geospatial coordinates and archaeological descriptions. It is meant for educational and exploratory purposes.
                </p>
                {activePlace.warnings && (
                  <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                    {activePlace.warnings.map((w: string, wIdx: number) => (
                      <li key={wIdx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions: Export JSON & Share Link (PRD F16) */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> {copyNotice ? "Link Copied!" : "Share Link"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Landmark className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p>Type a place name above to begin autonomous open research.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 3D Cinematic Scene & 4D Controls */}
        <div className="flex-1 lg:h-[calc(100vh-140px)] min-w-0 relative bg-slate-950 flex flex-col overflow-hidden min-h-[560px]">
          {/* 3D Canvas Viewport */}
          <div className="flex-1 relative w-full h-full">
            <VFXEngine
              epoch={currentEpoch}
              timeOfDay={solarTime}
              archetype={vfxArchetype as any}
              viewPreset={cameraView}
            />

            {/* Top Floating Telemetry Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700 max-w-xs shadow-2xl z-10 pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  Place Explorer 4D Canvas
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight">
                {activePlace?.name || "Parametric 3D Twin"}
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Model: <b className="text-heritage-gold">{activePlace?.model_type || "Parametric PBR"}</b>
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <div>Sun: <b className="text-white">{solarTime}:00</b></div>
                <div>Epoch: <b className="text-white">{currentEpochItem?.year || 2026} CE</b></div>
              </div>
            </div>

            {/* Top Right Full Twin Engine Shortcut */}
            <div className="absolute top-4 right-4 z-10">
              <Link
                href={`/twin?site=${encodeURIComponent(activePlace?.name || query)}`}
                className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-heritage-gold hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all"
              >
                <Layers className="w-3.5 h-3.5" /> Full Twin Engine <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Bottom Centered Camera View Presets */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-2xl z-10 max-w-[95%] overflow-x-auto">
              <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1 whitespace-nowrap">
                <Eye className="w-3 h-3 text-heritage-gold" /> Camera:
              </span>
              {(vfxArchetype === "akshardham_mandir" ? [
                { id: "overview", label: "Monumental View" },
                { id: "gallery", label: "Mandapa & Pillars" },
                { id: "shaft", label: "108ft Shikhara Spire" },
                { id: "water", label: "Sahajanand Fountain" },
              ] : vfxArchetype === "domed_mausoleum" ? [
                { id: "overview", label: "Grand Frontal" },
                { id: "gallery", label: "Iwan Façade" },
                { id: "shaft", label: "Dome & Chattris" },
                { id: "water", label: "Reflecting Pool" },
              ] : vfxArchetype === "stupa" ? [
                { id: "overview", label: "Overview" },
                { id: "gallery", label: "Torana Gate" },
                { id: "shaft", label: "Anda Dome" },
                { id: "water", label: "Medhi Base" },
              ] : vfxArchetype === "tower" ? [
                { id: "overview", label: "Full Tower" },
                { id: "gallery", label: "Balconies" },
                { id: "shaft", label: "Minar Apex" },
                { id: "water", label: "Plinth Base" },
              ] : vfxArchetype === "nagara_shikhara" ? [
                { id: "overview", label: "Overview" },
                { id: "gallery", label: "Mandapa" },
                { id: "shaft", label: "Shikhara Spire" },
                { id: "water", label: "Jagati Base" },
              ] : [
                { id: "overview", label: "Overview" },
                { id: "gallery", label: "Pavilion" },
                { id: "shaft", label: "Inner Well" },
                { id: "water", label: "Water Level" },
              ]).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCameraView(p.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    cameraView === p.id
                      ? "bg-heritage-gold text-slate-950 font-bold shadow-md"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom 4D Time & Solar Control Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 px-6 z-20 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 4D Historical Epoch Slider */}
            <div className="w-full md:w-1/2 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-heritage-gold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Historical 4D Epoch ({currentEpochItem?.year || 2026} CE)
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {currentEpochItem?.title || "Active Era"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, (activePlace?.timeline?.length || 4) - 1)}
                step="1"
                value={currentEpoch}
                onChange={(e) => setCurrentEpoch(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                {activePlace?.timeline?.map((ep: any, idx: number) => (
                  <span
                    key={idx}
                    onClick={() => setCurrentEpoch(idx)}
                    className={`cursor-pointer ${currentEpoch === idx ? "text-amber-400 font-bold" : ""}`}
                  >
                    {ep.year}
                  </span>
                ))}
              </div>
            </div>

            {/* Solar Time Slider */}
            <div className="w-full md:w-1/3 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-amber-300 uppercase tracking-wider">
                  <Sun className="w-3.5 h-3.5" />
                  Sun Angle: {solarTime}:00
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {solarTime >= 11 && solarTime <= 13 ? "Peak Noon" : solarTime < 9 ? "Dawn" : "Late Day"}
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="1"
                value={solarTime}
                onChange={(e) => setSolarTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>6 AM Dawn</span>
                <span>12 PM Noon</span>
                <span>6 PM Dusk</span>
              </div>
            </div>

            {/* Quality Tier Selector (PRD Section 9) */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQualityTier(q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    qualityTier === q
                      ? "bg-heritage-gold text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

