"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  FileText,
  Sparkles,
  Search,
  Scan,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  History,
  ShieldCheck,
  ChevronRight,
  Upload,
  Layers,
  ArrowRight,
  Volume2,
  Sliders,
  HelpCircle,
  Maximize2,
  Copy,
  Download,
  Edit3,
  Check,
  Eye,
  RefreshCw,
  Cpu
} from "lucide-react";

interface WordLexicon {
  word: string;
  transliteration: string;
  meaning: string;
  grammar: string;
  culturalNote: string;
}

export default function EpigrapherPage() {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("epigraph-adalaj-1498");
  const [activeData, setActiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeciphering, setIsDeciphering] = useState<boolean>(false);
  const [wipePercent, setWipePercent] = useState<number>(50); // Split curtain: 0 = eroded, 100 = restored
  const [selectedWord, setSelectedWord] = useState<WordLexicon | null>(null);

  // E3: Preprocessing Toggles
  const [filterGrayscale, setFilterGrayscale] = useState<boolean>(true);
  const [filterClahe, setFilterClahe] = useState<boolean>(true);
  const [filterDenoise, setFilterDenoise] = useState<boolean>(true);
  const [filterDeskew, setFilterDeskew] = useState<boolean>(false);
  const [filterAdaptiveThreshold, setFilterAdaptiveThreshold] = useState<boolean>(false);

  // E4 & E5: Glyph Inspector State
  const [selectedGlyph, setSelectedGlyph] = useState<any>(null);
  const [hoveredGlyph, setHoveredGlyph] = useState<number | null>(null);

  // E6-E9: Active Tab
  const [activeTab, setActiveTab] = useState<"degraded" | "restored" | "iast" | "hindi" | "english">("restored");
  const [copiedTab, setCopiedTab] = useState<boolean>(false);

  // E10: Human Review Mode
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Audio Chant Chanting
  const [isPlayingChant, setIsPlayingChant] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sample Sanskrit Word Lexicon
  const sampleLexicon: { [key: string]: WordLexicon } = {
    "संवत्": {
      word: "संवत्",
      transliteration: "saṃvat",
      meaning: "Vikram Era Year",
      grammar: "Noun, Nominative/Locative marker",
      culturalNote: "Historical Indian lunar calendar founded by Emperor Vikramaditya in 57 BCE.",
    },
    "१५५५": {
      word: "१५५५",
      transliteration: "1555",
      meaning: "Year 1555 of Vikram Samvat (corresponding to 1498 CE)",
      grammar: "Numeral (Devanagari notation)",
      culturalNote: "Crucial date proving stepwell construction occurred during Sultan Mahmud Begada's rule.",
    },
    "वीरसिंह": {
      word: "वीरसिंह",
      transliteration: "vīrasiṃha",
      meaning: "King Virasimha (Vaghela Chieftain)",
      grammar: "Proper Compound Noun (vīra + siṃha)",
      culturalNote: "Ruler of Dandai Desh who fell defending his kingdom; Queen Rudabai built the Vav in his eternal honor.",
    },
    "रुदादेवी": {
      word: "रुदादेवी",
      transliteration: "rudādevī",
      meaning: "Queen Rudabai",
      grammar: "Proper Noun (Fem.)",
      culturalNote: "The noble queen whose diplomacy persuaded Mahmud Begada to complete the stepwell without destroying Hindu icons.",
    },
    "वापीं": {
      word: "वापीं",
      transliteration: "vāpīm",
      meaning: "Stepwell / Subterranean Reservoir",
      grammar: "Noun, Accusative Singular (Fem.)",
      culturalNote: "Derived from 'vāp' (to sow/consecrate). Stepwells were considered sacred public hydraulic institutions in arid Gujarat.",
    },
    "धर्मार्थं": {
      word: "धर्मार्थं",
      transliteration: "dharmārtham",
      meaning: "For the sake of pious merit and public welfare",
      grammar: "Avyayibhava Adverbial Compound",
      culturalNote: "Reflects the ancient Indian ethic of purta (constructing wells, gardens, and tanks for universal benefit).",
    },
  };

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const list = await api.getEpigraphySteles();
        setInscriptions(list);
        if (list && list.length > 0) {
          const stele = await api.getEpigraphyStele(list[0].id);
          setActiveData(stele);
          setEditedText(stele.restored);
        }
      } catch (err) {
        console.error("Failed to load inscriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInscriptions();
  }, []);

  const handleSelectInscription = async (id: string) => {
    setSelectedId(id);
    setIsDeciphering(true);
    setSelectedWord(null);
    setSelectedGlyph(null);
    setIsReviewMode(false);
    setIsVerified(false);
    try {
      const stele = await api.getEpigraphyStele(id);
      setActiveData(stele);
      setEditedText(stele.restored);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeciphering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(true);
    setTimeout(() => setCopiedTab(false), 2000);
  };

  const exportStele = async (format: "json" | "markdown" | "tei_xml") => {
    try {
      const res = await api.exportEpigraphy({ stele_id: selectedId, format });
      const content = typeof res.content === "string" ? res.content : JSON.stringify(res.content, null, 2);
      const mime = format === "json" ? "application/json" : format === "tei_xml" ? "application/xml" : "text/markdown";
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedId}.${format === "tei_xml" ? "xml" : format === "markdown" ? "md" : "json"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Export failed: " + e.message);
    }
  };

  // Synthesize Metrical Sanskrit Chanting
  const playSanskritChant = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setIsPlayingChant(true);
      const now = ctx.currentTime;

      // Metrical Anushtubh melodic scale in Kharaharapriya / Bhairav
      const notes = [
        { freq: 220, dur: 0.5 }, // saṃ
        { freq: 247.5, dur: 0.5 }, // vat
        { freq: 264, dur: 0.6 }, // var
        { freq: 297, dur: 0.8 }, // she
        { freq: 264, dur: 0.5 }, // vi
        { freq: 297, dur: 0.5 }, // ra
        { freq: 330, dur: 0.8 }, // sim
        { freq: 297, dur: 1.2 }, // ha
      ];

      let cursor = now;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, cursor);

        gain.gain.setValueAtTime(0.2, cursor);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + note.dur - 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(cursor);
        osc.stop(cursor + note.dur);

        cursor += note.dur;
      });

      setTimeout(() => {
        setIsPlayingChant(false);
      }, (cursor - now) * 1000);
    } catch (e) {
      console.warn("Chant audio error:", e);
      setIsPlayingChant(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Vision Transformer + Sanskrit IndicBART (Module B)
            </span>
            <span className="text-xs text-slate-400">IIT Gandhinagar Ancient Epigraphy Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3 text-white">
            <FileText className="h-8 w-8 text-purple-400" />
            AI Ancient Epigrapher & Script Decipherer
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Recovers eroded Sanskrit, early Devanagari, and Old Gujarati stone inscriptions using neural glyph inpainting. Generates character bounding contours, top-3 candidates, IAST, modern Hindi, and academic English translation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all self-start md:self-auto shadow-md"
          >
            <span>Return to 3D Twin</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </Link>
        </div>
      </div>

      {/* E1: Preloaded Steles Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inscriptions.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectInscription(item.id)}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selectedId === item.id
                ? "bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30 shadow-xl"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                VS {item.dating?.vs} ({item.dating?.ce} CE)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {item.mode === "curated" ? "✓ Curated Gold" : "AI Inferred"}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">{item.title}</h3>
            <p className="text-xs text-slate-400 mt-1 truncate">{item.location}</p>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{Math.round((item.confidence || 0.96) * 100)}% Calibrated Conf</span>
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <span>Inspect Glyphs</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Reconstruction Workbench */}
      {activeData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Stone Inscription, Filters & Interactive Glyphs (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            {/* Toolbar: Preprocessing Filters (E3) */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-base text-white">
                    Neural Glyph Segmentation & Lens
                  </h3>
                </div>

                <button
                  onClick={playSanskritChant}
                  disabled={isPlayingChant}
                  className="px-3 py-1 rounded-xl bg-purple-950 border border-purple-700 text-xs font-semibold text-purple-300 hover:bg-purple-900 flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingChant ? "animate-spin text-amber-400" : ""}`} />
                  <span>{isPlayingChant ? "Chanting Shloka..." : "Listen Recitation"}</span>
                </button>
              </div>

              {/* Preprocessing Filter Buttons (E3) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400 font-semibold mr-1">Preprocess (E3):</span>
                <button
                  onClick={() => setFilterGrayscale(!filterGrayscale)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    filterGrayscale ? "bg-slate-800 text-purple-300 border-purple-500/50" : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  Grayscale
                </button>
                <button
                  onClick={() => setFilterClahe(!filterClahe)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    filterClahe ? "bg-purple-950 text-purple-300 border-purple-500" : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  CLAHE Contrast
                </button>
                <button
                  onClick={() => setFilterDenoise(!filterDenoise)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    filterDenoise ? "bg-slate-800 text-purple-300 border-purple-500/50" : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  Bilateral Denoise
                </button>
                <button
                  onClick={() => setFilterDeskew(!filterDeskew)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    filterDeskew ? "bg-purple-950 text-purple-300 border-purple-500" : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  Deskew ±2.4°
                </button>
                <button
                  onClick={() => setFilterAdaptiveThreshold(!filterAdaptiveThreshold)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    filterAdaptiveThreshold ? "bg-purple-950 text-purple-300 border-purple-500" : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  Adaptive Threshold
                </button>
              </div>
            </div>

            {/* Split Comparison Curtain (E12) */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-900/50 bg-[#140e0a] p-6 shadow-2xl min-h-[220px] flex flex-col justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-rose-400">← Eroded Inscription ({100 - wipePercent}%)</span>
                  <span className="text-purple-400">Neural Restored ({wipePercent}%) →</span>
                </div>

                <div className="relative p-4 rounded-xl bg-slate-950/70 border border-amber-900/40 text-center font-serif text-lg sm:text-xl leading-relaxed tracking-wider select-none">
                  {wipePercent < 50 ? (
                    <span className="text-amber-200/50">{activeData.degraded}</span>
                  ) : (
                    <span className="text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      {activeData.restored}
                    </span>
                  )}
                </div>

                {/* Curtain Range Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wipePercent}
                    onChange={(e) => setWipePercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Eroded Patina (0%)</span>
                    <span className="text-purple-400 font-bold">Curtain Slider: {wipePercent}%</span>
                    <span>Fully Restored (100%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* E4 & E5: Interactive Bounding Boxes Overlay for Segmented Glyphs */}
            {activeData.lines && activeData.lines[0]?.glyphs && (
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    Segmented Glyphs Overlay (Click damaged glyph in red to see top-3 candidates):
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Intact
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" /> Damaged/Inpainted
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeData.lines[0].glyphs.map((g: any, idx: number) => {
                    const isDamaged = g.damaged;
                    const isSelected = selectedGlyph?.i === g.i;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedGlyph(g)}
                        onMouseEnter={() => setHoveredGlyph(idx)}
                        onMouseLeave={() => setHoveredGlyph(null)}
                        className={`px-2.5 py-1.5 rounded-lg font-serif text-sm font-bold transition-all border ${
                          isDamaged
                            ? isSelected
                              ? "bg-rose-900/80 border-rose-400 text-rose-200 ring-2 ring-rose-400 shadow-md scale-105"
                              : "bg-rose-950/40 border-rose-600/70 text-rose-300 hover:bg-rose-900/50"
                            : isSelected
                            ? "bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-md"
                            : "bg-slate-900 border-slate-700 text-amber-200/90 hover:border-slate-500"
                        }`}
                        title={`Glyph #${g.i}: ${g.read} (Confidence: ${Math.round(g.conf * 100)}%)`}
                      >
                        {g.read}
                      </button>
                    );
                  })}
                </div>

                {/* E5: Top-3 Inpainting Candidates Drawer */}
                {selectedGlyph && (
                  <div className="mt-3 p-3 bg-purple-950/40 border border-purple-500/50 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span>Glyph #{selectedGlyph.i}:</span>
                        <span className="text-amber-300 font-serif text-base">{selectedGlyph.read}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedGlyph.damaged ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {selectedGlyph.damaged ? "Eroded Stroke Inpainted" : "Intact Contour"}
                        </span>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Conf: {Math.round(selectedGlyph.conf * 100)}%
                      </span>
                    </div>

                    {selectedGlyph.candidates && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                          Top-3 Neural Inpainting Candidates (IndicBART + Sanskrit LM):
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedGlyph.candidates.map((cand: any, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="p-2 bg-slate-950 rounded-lg border border-purple-800/60 text-center"
                            >
                              <div className="text-base font-serif font-bold text-amber-300">{cand.g}</div>
                              <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                                Prob: {Math.round(cand.p * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* E2: Upload Dropzone with Live Segmentation */}
            <label className="border border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-4 text-center cursor-pointer transition-colors block bg-slate-950/40 hover:bg-slate-900/60 group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsDeciphering(true);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await api.uploadInscriptionImage(formData);
                    if (res.result) {
                      setActiveData(res.result);
                      setSelectedId(res.result.id);
                      setEditedText(res.result.restored || res.result.restored_transcription);
                    }
                  } catch (err: any) {
                    alert("Upload error: " + err.message);
                  } finally {
                    setIsDeciphering(false);
                  }
                }}
              />
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
              <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                {isDeciphering ? "Processing Image with CRNN-CTC & IndicBART..." : "Upload Stone Stele / Copper Plate Photo (JPG, PNG, WEBP <= 10MB)"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically segments glyph bounding boxes, inpaints eroded characters & converts dating
              </p>
            </label>
          </div>

          {/* Right Column: Transcription Tabs (E6-E9), Dating, Human Review (E10) & Export (E11) (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Stele Title & Verification Badge */}
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider">
                      {activeData.mode === "curated" ? "Curated Gold Stele" : "AI Inferred Model"}
                    </span>
                    {isVerified && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Expert Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-1 leading-snug">{activeData.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeData.location}</p>
                </div>

                {/* E11: Export Menu */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => exportStele("json")}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1"
                    title="Export JSON"
                  >
                    <Download className="w-3 h-3 text-purple-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => exportStele("markdown")}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1"
                    title="Export Markdown"
                  >
                    <span>MD</span>
                  </button>
                  <button
                    onClick={() => exportStele("tei_xml")}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1"
                    title="Export TEI-XML"
                  >
                    <span>XML</span>
                  </button>
                </div>
              </div>

              {/* Historical Dating Converter (E9) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Vikram Samvat (VS)</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">VS {activeData.dating?.vs || 1555}</div>
                  <div className="text-[10px] text-slate-400">{activeData.dating?.note || "CE = VS - 57"}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Common Era (CE)</div>
                  <div className="text-sm font-bold text-sky-400 mt-0.5">{activeData.dating?.ce || 1498} AD</div>
                  <div className="text-[10px] text-slate-400">Solar-Lunar Sync</div>
                </div>
              </div>

              {/* E6-E9: Multi-Tab Translation Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <div className="flex items-center gap-1 text-xs">
                    {(["restored", "degraded", "iast", "hindi", "english"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                          activeTab === tab
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab === "iast" ? "IAST" : tab}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const textToCopy =
                        activeTab === "restored"
                          ? activeData.restored
                          : activeTab === "degraded"
                          ? activeData.degraded
                          : activeTab === "iast"
                          ? activeData.iast
                          : activeTab === "hindi"
                          ? activeData.hindi
                          : activeData.english;
                      copyToClipboard(textToCopy);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                    title="Copy Active Tab Content"
                  >
                    {copiedTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs leading-relaxed min-h-[110px]">
                  {activeTab === "restored" && (
                    <div className="font-serif text-sm font-bold text-amber-200 leading-relaxed">
                      {isReviewMode ? (
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full bg-slate-900 border border-purple-500 rounded-lg p-2 text-white font-serif"
                          rows={3}
                        />
                      ) : (
                        activeData.restored
                      )}
                    </div>
                  )}

                  {activeTab === "degraded" && (
                    <div className="font-serif text-sm text-slate-400 italic leading-relaxed">
                      {activeData.degraded}
                    </div>
                  )}

                  {activeTab === "iast" && (
                    <div className="font-mono text-xs text-purple-300 leading-relaxed">
                      {activeData.iast}
                    </div>
                  )}

                  {activeTab === "hindi" && (
                    <div className="font-sans text-xs text-slate-200 leading-relaxed font-medium">
                      {activeData.hindi || activeData.hindi_translation}
                    </div>
                  )}

                  {activeTab === "english" && (
                    <div className="font-sans text-xs text-slate-200 leading-relaxed italic">
                      "{activeData.english || activeData.english_translation}"
                    </div>
                  )}
                </div>
              </div>

              {/* Warnings / Epigraphical Integrity Notes */}
              {activeData.warnings && activeData.warnings.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-300/90 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{activeData.warnings[0]}</span>
                </div>
              )}
            </div>

            {/* E10: Human Review & Verification Mode Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setIsReviewMode(!isReviewMode)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                <span>{isReviewMode ? "Close Editor" : "Expert Review Mode"}</span>
              </button>

              <button
                onClick={() => {
                  setIsVerified(true);
                  if (activeData) activeData.restored = editedText;
                  setIsReviewMode(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Verified</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
