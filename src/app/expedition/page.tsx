"use client";

import { useState, useEffect } from "react";
import { api, type ExpeditionAsset } from "@/lib/api";
import { MapPin, Calendar, FileText, Tag, Sparkles, Send, ExternalLink, Compass } from "lucide-react";

export default function ExpeditionPage() {
  const [expeditions, setExpeditions] = useState<ExpeditionAsset[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState<ExpeditionAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [journalInput, setJournalInput] = useState("");
  const [journalTitle, setJournalTitle] = useState("");

  useEffect(() => {
    loadExpeditions();
  }, []);

  async function loadExpeditions() {
    try {
      const data = await api.getExpeditions();
      setExpeditions(data);
      if (data.length > 0) {
        setSelectedExpedition(data[0]);
      }
    } catch (error) {
      console.error("Failed to load expeditions:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleIngest = async (textToIngest?: string, titleToUse?: string) => {
    const text = textToIngest || journalInput;
    const title = titleToUse || journalTitle || "Field Reconnaissance Record";
    if (!text.trim()) return;

    setIngesting(true);
    try {
      const result = await api.ingestJournal({
        journal: text,
        title: title,
      });

      // Add to expeditions and select
      setExpeditions([result, ...expeditions]);
      setSelectedExpedition(result);
      setJournalInput("");
      setJournalTitle("");
    } catch (error) {
      console.error("Failed to ingest journal:", error);
      alert("Failed to process journal. Please verify backend connection.");
    } finally {
      setIngesting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJournalInput(content);
      setJournalTitle(file.name.replace(/\.[^/.]+$/, ""));
      handleIngest(content, file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  };

  const quickSamples = [
    {
      label: "Rani Ki Vav Survey",
      title: "Rani Ki Vav Archaeological Reconnaissance",
      text: "Surveyed Rani Ki Vav in Patan, built by Queen Udayamati of the Solanki Chaulukya dynasty c. 1063 AD. Observed seven deep subterranean tiers with Sheshashayi Vishnu sculptures, carved pillar corbels, and torana entrance arches.",
    },
    {
      label: "Siddhpur & Bohra Havelis",
      title: "Siddhpur Sacred Hydraulic Expedition",
      text: "Visited Rudra Mahalaya in Siddhpur, founded by Siddharaja Jayasimha in the 12th century. Documented monumental Maru-Gurjara torana arches and adjacent 19th century Dawoodi Bohra timber-and-stone havelis with intricate facades.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-heritage-jade/20 text-heritage-jade border border-heritage-jade/30">
              PRD SECTION 3.3 & 6.4
            </span>
            <span className="text-xs text-slate-400">NLP Gazetteer Tagging & Route Reconstructor</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Field Expedition Reconstructor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Transform unstructured field journals into georeferenced heritage routes with Gujarat gazetteer NLP tagging
          </p>
        </div>

        {/* Input Card: Ingest Field Journal */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-heritage-jade" />
              Ingest Explorer Field Notes
            </h2>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer border border-slate-700 transition-colors">
                Upload .txt/.md File
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Expedition Title (e.g., Patan & Saraswati River Hydraulic Survey)"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-heritage-jade text-sm"
            />
            <textarea
              rows={3}
              value={journalInput}
              onChange={(e) => setJournalInput(e.target.value)}
              placeholder="Paste explorer field observations here (mentioning monuments like Adalaj, Modhera, Patan, dynasties, or architectural terms)..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-heritage-jade text-sm resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">Quick Samples:</span>
                {quickSamples.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setJournalTitle(s.title);
                      setJournalInput(s.text);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors border border-slate-700/60"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleIngest()}
                disabled={ingesting || !journalInput.trim()}
                className="px-5 py-2.5 bg-heritage-jade hover:bg-emerald-600 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg shadow-emerald-950/20"
              >
                {ingesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Extracting NLP Entities...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Run NLP Tagger & Map Route
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Expeditions List (Left 4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-heritage-jade" />
                  Tagged Expeditions ({expeditions.length})
                </h3>
              </div>

              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center">Loading expeditions...</div>
              ) : expeditions.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-4">
                  No expeditions yet. Use the prompt box above to ingest field notes.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {expeditions.map((exp, idx) => {
                    const isSelected = selectedExpedition?.assetId === exp.assetId || (selectedExpedition as any)?.id === (exp as any)?.id;
                    const primaryPlace = exp.places?.[0]?.name || "Gujarat Site";
                    const yearText = exp.dates?.[0]?.text || "Historical";

                    return (
                      <button
                        key={exp.assetId || idx}
                        onClick={() => setSelectedExpedition(exp)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-slate-800 border-heritage-jade shadow-md ring-1 ring-heritage-jade/50"
                            : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600"
                        }`}
                      >
                        <div className="font-bold text-white text-sm line-clamp-2 mb-1">
                          {exp.title}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>📍 {primaryPlace}</span>
                          <span className="font-mono text-heritage-gold">{yearText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Expedition Details (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedExpedition ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                {/* Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
                  <div>
                    <span className="text-xs font-mono font-bold text-heritage-jade uppercase tracking-wider">
                      Asset ID: {selectedExpedition.assetId || "EX_TAGGED"}
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      {selectedExpedition.title}
                    </h2>
                  </div>

                  {selectedExpedition.links?.twin && (
                    <a
                      href={selectedExpedition.links.twin}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-heritage-gold/20 text-heritage-gold hover:bg-heritage-gold hover:text-slate-950 font-bold rounded-lg text-xs transition-colors border border-heritage-gold/30 self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View 3D Digital Twin
                    </a>
                  )}
                </div>

                {/* Discovered Geographic Places */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-heritage-jade" />
                    Georeferenced Waypoints ({selectedExpedition.places?.length || 0})
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedExpedition.places?.map((place, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-slate-800/70 border border-slate-700/60 p-3.5 rounded-xl flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-heritage-jade/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-heritage-jade" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">{place.name}</div>
                          <div className="text-slate-400 text-xs font-mono mt-0.5">
                            {place.lat.toFixed(4)}°N, {place.lon.toFixed(4)}°E
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-1">
                            {(place.conf * 100).toFixed(0)}% Gazetteer Confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted Dynasties & Eras */}
                {selectedExpedition.dynasties && selectedExpedition.dynasties.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-heritage-gold" />
                      Identified Dynasties & Eras
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpedition.dynasties.map((dyn, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-3 py-1 bg-heritage-gold/15 text-heritage-gold border border-heritage-gold/30 rounded-lg text-xs font-bold"
                        >
                          🏛️ {dyn}
                        </span>
                      ))}
                      {selectedExpedition.dates?.map((dt, dtIdx) => (
                        <span
                          key={dtIdx}
                          className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium"
                        >
                          ⏳ {dt.text} {dt.vs ? `(VS ${dt.vs})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Architectural Features */}
                {selectedExpedition.architecture && selectedExpedition.architecture.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      Architectural Elements Tagged
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpedition.architecture.map((arch, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-3 py-1 bg-cyan-950/30 text-cyan-300 border border-cyan-800/50 rounded-lg text-xs font-medium"
                        >
                          📐 {arch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Hashtags */}
                {selectedExpedition.tags && selectedExpedition.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {selectedExpedition.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs text-slate-400 font-mono bg-slate-800/60 px-2.5 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center shadow-xl">
                <MapPin className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Expedition Selected
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Select a recorded expedition from the left, or paste field notes above to generate a new route with NLP gazetteer tags.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
