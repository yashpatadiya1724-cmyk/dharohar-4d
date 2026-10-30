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
  Maximize2
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
    setSelectedWord(null);
    try {
      const res = await api.decipherInscription({
        inscription_id: id,
        enhance_resolution: true,
      });
      setActiveData(res.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeciphering(false);
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
              Vision Transformer + Indic NLP Engine
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
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all self-start md:self-auto"
        >
          <span>Return to 3D Twin</span>
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
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{item.script}</span>
              <span className="text-purple-300 font-semibold">{item.restored_glyphs_count} Glyphs Restored</span>
            </div>
          </button>
        ))}
      </div>

      {/* Inscription Reconstruction Workbench */}
      {activeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Stone Inscription & Interactive Inpainting Split-Lens */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">
                  Neural Inpainting Split-Screen Lens
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

            {/* Split Lens Graphic */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-900/50 bg-[#16100b] p-6 shadow-2xl min-h-[240px] flex flex-col justify-center">
              {/* Stone noise texture */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-rose-400">← Weathered Chipped Stone</span>
                  <span className="text-purple-400">Neural Restored Inscription →</span>
                </div>

                {/* Split comparison text */}
                <div className="relative p-4 rounded-xl bg-slate-950/60 border border-amber-900/40 text-center font-serif text-lg sm:text-xl leading-relaxed tracking-wider select-none">
                  {/* Left: Degraded / Right: Restored */}
                  {wipePercent < 50 ? (
                    <span className="text-amber-200/50">
                      {activeData.degraded_transcription}
                    </span>
                  ) : (
                    <span className="text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      {activeData.restored_transcription}
                    </span>
                  )}
                </div>

                {/* Curtain Wipe Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Eroded (0%)</span>
                    <span className="text-purple-400 font-bold">Lens Wipe: {wipePercent}%</span>
                    <span>Restored (100%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wipePercent}
                    onChange={(e) => setWipePercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Sanskrit Word Decompiler */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Interactive Sanskrit Word Lexicon (Click any word below):
                </span>
                <span className="text-slate-400 text-[10px]">Pāṇinian Grammar</span>
              </div>

              {/* Clickable Word Tokens */}
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.keys(sampleLexicon).map((wordKey) => {
                  const isSelected = selectedWord?.word === wordKey;
                  return (
                    <button
                      key={wordKey}
                      onClick={() => setSelectedWord(sampleLexicon[wordKey])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all border ${
                        isSelected
                          ? "bg-purple-900 border-purple-400 text-white ring-2 ring-purple-400/40 shadow-md scale-105"
                          : "bg-slate-900 border-slate-800 text-amber-200/90 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {wordKey}
                    </button>
                  );
                })}
              </div>

              {/* Word Details Drawer */}
              {selectedWord && (
                <div className="mt-3 p-3.5 bg-slate-900/90 rounded-xl border border-purple-500/40 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-serif font-bold text-amber-300 text-sm">
                      {selectedWord.word} ({selectedWord.transliteration})
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">
                      {selectedWord.grammar}
                    </span>
                  </div>
                  <div className="text-slate-200 font-medium">
                    <span className="text-slate-400">Meaning: </span>
                    {selectedWord.meaning}
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    <span className="text-purple-300 font-semibold">Historical Note: </span>
                    {selectedWord.culturalNote}
                  </div>
                </div>
              )}
            </div>

            {/* Inscription Photo Upload Dropzone */}
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
                {isDeciphering ? "Analyzing Stone Glyphs via Vision Transformer..." : "Upload Stone Inscription / Copper Plate Photo (Click or Drag)"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically segments glyph contours, inpaints eroded characters & translates to Hindi/English
              </p>
            </label>
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
