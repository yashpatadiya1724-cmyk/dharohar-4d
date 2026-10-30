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
  Activity
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

  // Ingestion form state
  const [monumentName, setMonumentName] = useState<string>("Siddhpur Rudra Mahalaya Havelis");
  const [locationStr, setLocationStr] = useState<string>("Patan District, Gujarat");
  const [notesText, setNotesText] = useState<string>(
    "Found exquisite carved wooden facades (Torana) on 19th century merchant Havelis and 12th century Solanki stone pillars. Locals recounted folklore of subterranean tunnels connecting to Saraswati river."
  );
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchExpeditions = async () => {
      try {
        const list = await api.getExpeditions();
        setExpeditions(list);
        if (list && list.length > 0) {
          setSelectedExp(list[0]);
        }
      } catch (err) {
        console.error("Failed to load expeditions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpeditions();
  }, []);

  // 2D Canvas Animated Topographic Route Map
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

    // Coordinate mapping to canvas space
    // Gujarat corridor bounds approx: lat 23.1 to 23.9, lng 72.0 to 72.7
    const mapCoords = (lat: number, lng: number) => {
      const minLat = 23.1;
      const maxLat = 23.92;
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
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Energy / Waypoint Pulse
        particleT = (particleT + 0.005) % (stops.length - 1);
        const segIdx = Math.floor(particleT);
        const segProg = particleT - segIdx;
        const p1 = mapCoords(stops[segIdx].lat, stops[segIdx].lng);
        const p2 = mapCoords(stops[segIdx + 1].lat, stops[segIdx + 1].lng);
        const curX = p1.x + (p2.x - p1.x) * segProg;
        const curY = p1.y + (p2.y - p1.y) * segProg;

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(curX, curY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Waypoint Nodes
      stops.forEach((stop: any, idx: number) => {
        const { x, y } = mapCoords(stop.lat, stop.lng);
        const isSelected = activeStopIdx === idx;

        // Halo
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 18 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "rgba(56, 189, 248, 0.3)" : "rgba(100, 116, 139, 0.2)";
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#38bdf8" : "#94a3b8";
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = isSelected ? "bold 11px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isSelected ? "#38bdf8" : "#cbd5e1";
        ctx.textAlign = "center";
        ctx.fillText(stop.name.split(",")[0], x, y - 14);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedExp, activeStopIdx]);

  // Audio Log Synthesizer
  const playFieldAudioLog = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      setIsPlayingAudioLog(true);
      const now = ctx.currentTime;

      // Synthesize short walkie-talkie field transmission beep and radio static
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1200, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      setTimeout(() => {
        setIsPlayingAudioLog(false);
      }, 1800);
    } catch (e) {
      console.warn("Audio log error:", e);
      setIsPlayingAudioLog(false);
    }
  };

  const handleIngestNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIngestSuccess(null);
    try {
      const res = await api.reconstructExpedition({
        title: "IITGN Field Survey Addition",
        monument_name: monumentName,
        location_str: locationStr,
        raw_field_notes: notesText,
        latitude: 23.9167,
        longitude: 72.3833,
        images_count: 8,
      });

      if (res.success && selectedExp) {
        setIngestSuccess(res.message);
        const newStop = {
          stop_number: selectedExp.stops.length + 1,
          name: res.reconstructed_node.monument_name,
          lat: res.reconstructed_node.lat,
          lng: res.reconstructed_node.lng,
          elevation_m: 72,
          date: "Just Ingested",
          notes: notesText,
          folklore_keywords: res.reconstructed_node.extracted_folklore_tags,
        };
        const updated = {
          ...selectedExp,
          total_artifacts_collected: selectedExp.total_artifacts_collected + 8,
          stops: [...selectedExp.stops, newStop],
        };
        setSelectedExp(updated);
        setActiveStopIdx(updated.stops.length - 1);
      }
    } catch (err: any) {
      setIngestSuccess("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStop = selectedExp?.stops?.[activeStopIdx] || selectedExp?.stops?.[0];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              IIT Gandhinagar Explorer Fellowship
            </span>
            <span className="text-xs text-slate-400">Blithchron '27 Heritage Revitalisation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <Compass className="h-8 w-8 text-sky-400" />
            Expedition Reconstructor & Spatial Journey Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Breathes life into unstructured fellowship photos, GPS waypoints, and travel journals — transforming dormant archival graveyards into interactive spatial timelines.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all self-start md:self-auto"
        >
          <span>Return to 3D Twin</span>
          <ArrowRight className="w-4 h-4 text-sky-400" />
        </Link>
      </div>

      {/* Expedition Overview Strip */}
      {selectedExp && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Research Team</span>
            </div>
            <div className="text-sm font-bold text-white truncate">
              {selectedExp.team_members[0]}
            </div>
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
            <div className="text-xl font-bold text-amber-400">
              {selectedExp.total_artifacts_collected}
            </div>
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

            {/* Waypoint Selectors */}
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

        {/* Right Col: Active Stop Telemetry Drawer */}
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

      {/* 1-Click Ingest Field Notes & Photos Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              Ingest New Field Notes & Photo Archive (Explorer Dropzone)
            </h3>
          </div>
          <span className="text-xs text-slate-400">NLP Entity Categorizer</span>
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
              Raw Travel Journal & Observations (NLP will extract architectural tags & folklore)
            </label>
            <textarea
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              required
            />
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
            {isSubmitting ? "Synthesizing Spatial Asset..." : "Ingest & Reconstruct Journey Node"}
          </button>
        </form>
      </div>
    </div>
  );
}
