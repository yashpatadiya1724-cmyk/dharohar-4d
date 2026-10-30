"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Compass,
  MapPin,
  Play,
  Pause,
  Layers,
  Sparkles,
  Camera,
  FileText,
  CheckCircle2,
  Calendar,
  Users,
  Navigation,
  ArrowRight,
  PlusCircle,
  Tag,
  Volume2,
  Radio,
  Activity,
  Search,
  Download,
  Filter,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

export default function ExpeditionReconstructorPage() {
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [activeStopIdx, setActiveStopIdx] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [isPlayingAudioLog, setIsPlayingAudioLog] = useState<boolean>(false);

  // Canvas ref for GIS Map
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Ingestion form state (X3, X4, X5)
  const [monumentName, setMonumentName] = useState<string>("Siddhpur Rudra Mahalaya Havelis");
  const [locationStr, setLocationStr] = useState<string>("Patan District, Gujarat");
  const [notesText, setNotesText] = useState<string>(
    "Found exquisite carved wooden facades (Torana) on 19th century merchant Havelis and 12th century Solanki stone pillars. Locals recounted folklore of subterranean tunnels connecting to Saraswati river. Water table drop observed at old cisterns."
  );
  const [photosCount, setPhotosCount] = useState<number>(4);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Unified Assets & Filter (X6, X7)
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  useEffect(() => {
    const fetchExpeditions = async () => {
      try {
        const list = await api.getExpeditions();
        setExpeditions(list);
        if (list && list.length > 0) {
          setSelectedExp(list[0]);
        }
        const storedAssets = await api.getExpeditionAssets();
        setAssets(storedAssets || []);
      } catch (err) {
        console.error("Failed to load expeditions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpeditions();
  }, []);

  // 2D Canvas Animated Topographic Route Map (X1)
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas || !selectedExp) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particleT = 0;
    const width = 700;
    const height = 340;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const mapCoords = (lat: number, lng: number) => {
      const minLat = 23.1;
      const maxLat = 23.95;
      const minLng = 72.05;
      const maxLng = 72.75;

      const x = ((lng - minLng) / (maxLng - minLng)) * (width - 120) + 60;
      const y = (1.0 - (lat - minLat) / (maxLat - minLat)) * (height - 80) + 40;
      return { x, y };
    };

    const stops = selectedExp.stops;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Topographic radar grid lines
      ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 30; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Trajectory Connecting Path
      if (stops.length > 1) {
        ctx.beginPath();
        const start = mapCoords(stops[0].lat, stops[0].lng);
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < stops.length; i++) {
          const pt = mapCoords(stops[i].lat, stops[i].lng);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Route Stops
      stops.forEach((stop: any, idx: number) => {
        const pt = mapCoords(stop.lat, stop.lng);
        const isActive = activeStopIdx === idx;

        // Outer pulsing ring for active stop
        if (isActive) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14 + Math.sin(particleT * 4) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Stop circle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isActive ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#38bdf8" : "#f59e0b";
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = isActive ? "bold 12px Inter, sans-serif" : "11px Inter, sans-serif";
        ctx.fillStyle = isActive ? "#ffffff" : "#cbd5e1";
        ctx.fillText(stop.name.split(",")[0], pt.x + 10, pt.y + 4);
      });

      particleT += 0.02;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedExp, activeStopIdx]);

  // Audio Field Log Playback
  const playFieldAudioLog = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      setIsPlayingAudioLog(true);
      const now = ctx.currentTime;

      // Realistic radio transceiver beep followed by audio tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);

      setTimeout(() => {
        setIsPlayingAudioLog(false);
      }, 1500);
    } catch (e) {
      setIsPlayingAudioLog(false);
    }
  };

  const handleIngestNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIngestSuccess(null);
    try {
      const res = await api.ingestExpedition({
        title: `${monumentName} Fellowship Entry`,
        journal: notesText,
        photos: [
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
          "https://images.unsplash.com/photo-1599837965377-fbe81a298bf6?w=800&q=80"
        ]
      });

      setAssets((prev) => [res, ...prev]);
      setIngestSuccess(
        `✓ Reconstructed asset: Tagged ${res.places?.[0]?.name} with ${res.tags?.join(", ")} and geocoded coordinates.`
      );
    } catch (err: any) {
      alert("Ingestion error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportItinerary = () => {
    const report = {
      expedition: selectedExp?.title,
      distance_km: selectedExp?.distance_km,
      stops: selectedExp?.stops,
      generated_at: new Date().toISOString(),
      institution: "IIT Gandhinagar Explorer Fellowship"
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IITGN_Heritage_Expedition_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStop = selectedExp?.stops?.[activeStopIdx];

  const filteredAssets = assets.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.places?.[0]?.name?.toLowerCase().includes(q) ||
      a.tags?.some((t: string) => t.toLowerCase().includes(q));
    const matchTag = selectedTag === "all" || a.tags?.includes(selectedTag);
    return matchQ && matchTag;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              Module C: Expedition Reconstructor
            </span>
            <span className="text-xs text-slate-400">IIT Gandhinagar Explorer Fellowship GIS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3 text-white">
            <Compass className="h-8 w-8 text-sky-400" />
            Expedition Reconstructor & Spatial Journey Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Breathes life into unstructured fellowship photos, GPS waypoints, and travel journals — transforming dormant archival graveyards into interactive spatial timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportItinerary}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export Itinerary</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-sky-950/50"
          >
            <span>Open in 3D Twin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Expedition Overview Strip */}
      {selectedExp && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Research Team</span>
            </div>
            <div className="text-sm font-bold text-white truncate">{selectedExp.team_members[0]}</div>
            <div className="text-[11px] text-slate-400">{selectedExp.team_members.length} Fellows</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Corridor Distance</span>
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {selectedExp.distance_km} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[11px] text-slate-400">{selectedExp.region}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Archived Artifacts</span>
            </div>
            <div className="text-xl font-bold text-amber-400">{selectedExp.total_artifacts_collected}</div>
            <div className="text-[11px] text-slate-400">Photogrammetry & Audio Notes</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Spatial Waypoints</span>
            </div>
            <div className="text-xl font-bold text-purple-400">
              {selectedExp.stops.length} <span className="text-xs font-normal text-slate-400">Stops</span>
            </div>
            <div className="text-[11px] text-slate-400">Stitched Itinerary</div>
          </div>
        </div>
      )}

      {/* Main Interactive Spatial Journey Map & Active Stop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Animated Topographic GIS Radar Canvas + Stepper */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  Topographic Heritage Radar (Gujarat Corridor)
                </h3>
                <p className="text-xs text-slate-400">
                  Live animated trajectory tracing Gandhinagar-Mehsana-Patan research route
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                164 km Traced
              </span>
            </div>

            {/* Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <canvas
                ref={mapCanvasRef}
                className="w-full h-[280px] block"
                style={{ aspectRatio: "700 / 340" }}
              />
              <div className="absolute bottom-3 left-3 text-[10px] bg-slate-900/90 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md">
                🛰️ WGS84 GPS Telemetry • IITGN Palaj Base
              </div>
            </div>

            {/* Waypoint Selectors (X2) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {selectedExp?.stops.map((stop: any, idx: number) => {
                const isActive = activeStopIdx === idx;
                return (
                  <button
                    key={stop.stop_number}
                    onClick={() => setActiveStopIdx(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-sky-950/80 border-sky-500 text-sky-200 ring-2 ring-sky-500/20 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-sky-400 font-bold">Stop #{stop.stop_number}</div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">{stop.name.split(",")[0]}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{stop.elevation_m}m Elevation</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Active Stop Telemetry Drawer (X2) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                Waypoint #{currentStop?.stop_number} Field Telemetry
              </span>
              <button
                onClick={playFieldAudioLog}
                disabled={isPlayingAudioLog}
                className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-[11px] font-bold text-sky-300 hover:bg-sky-900 transition-all flex items-center gap-1.5"
              >
                <Radio className={`w-3 h-3 ${isPlayingAudioLog ? "animate-ping text-emerald-400" : ""}`} />
                <span>{isPlayingAudioLog ? "Broadcasting..." : "Audio Log"}</span>
              </button>
            </div>

            <h3 className="text-xl font-bold text-white">{currentStop?.name}</h3>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentStop?.date}</span>
            </div>

            <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Explorer Journal Entry</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentStop?.notes}</p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Geospatial Coordinates
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  Lat: {currentStop?.lat}° N
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  Lng: {currentStop?.lng}° E
                </div>
              </div>
            </div>

            {/* Folklore Tags */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Extracted Folklore Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentStop?.folklore_keywords?.map((tag: string, tIdx: number) => (
                  <span
                    key={tIdx}
                    className="text-[10px] bg-slate-950 text-sky-300 border border-slate-800 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Verified by IITGN Explorer Archive</span>
            <span className="text-sky-400 font-medium">Auto-Synced</span>
          </div>
        </div>
      </div>

      {/* 1-Click Ingest Field Notes & Photos Studio (X3, X4, X5) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              1-Click Ingest Field Notes & Photo Archive (X3, X4, X5)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Rule-Based NLP + RapidFuzz Gazetteer</span>
        </div>

        <form onSubmit={handleIngestNotes} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Heritage Monument / Locus Name
              </label>
              <input
                type="text"
                value={monumentName}
                onChange={(e) => setMonumentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Region / District
              </label>
              <input
                type="text"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Raw Travel Journal & Observations (Paste up to 5,000 words — NLP extracts entities, dynasties & folklore tags)
            </label>
            <textarea
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-sans"
              required
            />
          </div>

          {/* Photo Dropzone Simulation (X4) */}
          <div className="p-3 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span>Attach Explorer Photos ({photosCount} photos selected with EXIF GPS)</span>
            </div>
            <button
              type="button"
              onClick={() => setPhotosCount((p) => (p >= 8 ? 2 : p + 2))}
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-[11px]"
            >
              Toggle Photo Batch
            </button>
          </div>

          {ingestSuccess && (
            <div className="p-3 rounded-xl text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{ingestSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Synthesizing Spatial Asset..." : "Ingest & Reconstruct Journey Node (<10s)"}
          </button>
        </form>
      </div>

      {/* Unified Asset Cards & Filter Registry (X6, X7) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Unified Heritage Asset Cards (X6)
            </h3>
            <p className="text-xs text-slate-400">Auto-tagged, geo-located 4D assets extracted from journals & photos</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tags, places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 pl-8 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.assetId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {asset.assetId}
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  {asset.dates?.[0]?.text || "1498 AD"}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-white">{asset.title}</h4>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{asset.places?.[0]?.name}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {asset.tags?.map((t: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Links to Twin / Inscription */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
                <Link
                  href={asset.links?.twin || "/twin"}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Open in 3D Twin</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href={asset.links?.inscription || "/epigrapher"}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Inspect Inscription</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
