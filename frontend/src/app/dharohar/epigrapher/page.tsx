"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";

export default function EpigrapherPage() {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("epigraph-adalaj-1498");
  const [activeData, setActiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeciphering, setIsDeciphering] = useState<boolean>(false);
  const [enhancedMode, setEnhancedMode] = useState<boolean>(true);

  // Fetch initial inscriptions list
  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const list = await api.getInscriptions();
        setInscriptions(list);
        if (list && list.length > 0) {
          const res = await api.decipherInscription({ inscription_id: list[0].id });
          setActiveData(res.result);
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
    try {
      const res = await api.decipherInscription({
        inscription_id: id,
        enhance_resolution: enhancedMode,
      });
      setActiveData(res.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeciphering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Vision Transformer + Indic NLP
            </span>
            <span className="text-xs text-slate-400">IIT Gandhinagar Epigraphy Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-400" />
            AI Ancient Epigrapher & Script Decipherer
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Recovers damaged, eroded, and broken characters from centuries-old stone steles, stepwell foundation plates, and temple copper inscriptions across Gujarat.
          </p>
        </div>

        <Link
          href="/dharohar"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all self-start md:self-auto"
        >
          <span>Return to 4D Twin</span>
          <ArrowRight className="w-4 h-4 text-purple-400" />
        </Link>
      </div>

      {/* Select Inscription Cards */}
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
                {item.date_vikram_samvat}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round(item.confidence_score * 100)}% Match
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">{item.title}</h3>
            <p className="text-xs text-slate-400 mt-1 truncate">{item.location}</p>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2">
              <span>{item.script}</span>
              <span>•</span>
              <span className="text-purple-300">{item.restored_glyphs_count} Glyphs Restored</span>
            </div>
          </button>
        ))}
      </div>

      {/* Inscription Reconstruction Workbench */}
      {activeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Stone Inscription & Neural Glyph Inpainting */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Scan className="w-5 h-5 text-purple-400" />
                Weathered Stone Stele & Glyph Inpainting
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                Inpainting Loss: 0.018
              </span>
            </div>

            {/* Stele Graphic Texture Simulation */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-900/40 bg-gradient-to-b from-[#291e14] via-[#1a140d] to-[#120d08] p-6 shadow-inner min-h-[220px] flex flex-col justify-center items-center text-center">
              {/* Subtle stone texture noise */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 space-y-4 max-w-lg">
                <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
                  Original Weathered Sanskrit Epigraph (Sandstone Carving)
                </div>

                {/* Degraded Text on Stone */}
                <div className="font-serif text-lg md:text-xl text-amber-200/70 tracking-widest leading-loose select-none">
                  {activeData.degraded_transcription}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-800/80 text-rose-300">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    Damaged / Broken Sections
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-800/80 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Neural Inpainting Active
                  </span>
                </div>
              </div>
            </div>

            {/* Restored Complete Inscription */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Neural Restored Devanagari Transcription
                </span>
                <span className="text-slate-400">{activeData.restored_glyphs_count} Glyphs Recovered</span>
              </div>
              <p className="text-base font-semibold text-slate-100 font-serif leading-relaxed">
                {activeData.restored_transcription}
              </p>
              <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-900">
                IAST: <span className="text-purple-300">{activeData.iast}</span>
              </div>
            </div>

            {/* Custom File Upload Option */}
            <div className="border border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-purple-500 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-300">
                Drop your own Inscription Photo / Copper Plate (IITGN Explorer)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports JPG, PNG, TIFF up to 25MB • Automatically segments glyph contours
              </p>
            </div>
          </div>

          {/* Deciphered Linguistic Translation & Historical Context */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">
                Linguistic & Epigraphical Analysis
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{activeData.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Patron: <span className="text-slate-200 font-medium">{activeData.patron}</span>
              </p>
            </div>

            {/* Modern Hindi Translation */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>प्रामाणिक हिन्दी अनुवाद (Modern Hindi Translation)</span>
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {activeData.hindi_translation}
              </p>
            </div>

            {/* Academic English Translation */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic English Translation</span>
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                "{activeData.english_translation}"
              </p>
            </div>

            {/* Historical Significance & Dynasty */}
            <div className="bg-purple-950/30 rounded-2xl p-4 border border-purple-800/40 space-y-2">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Historical Context & Dynastic Impact</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeData.historical_significance}
              </p>
            </div>

            {/* Epigraphical Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400">Chronological Epoch</div>
                <div className="font-bold text-slate-200 mt-0.5">{activeData.date_vikram_samvat}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400">Palaeographical Script</div>
                <div className="font-bold text-purple-300 mt-0.5">{activeData.script}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
