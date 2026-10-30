"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Camera,
  Scan,
  Zap,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Video,
  Info,
  Maximize2
} from "lucide-react";
import { ConfettiBurst } from "@/components/ConfettiBurst";

interface DetectedAppliance {
  id: string;
  name: string;
  category: string;
  wattage: number;
  starRating: number;
  hourlyCostRs: number;
  co2GramPerMin: number;
  box: { top: string; left: string; width: string; height: string };
  status: "heavy_drain" | "optimal" | "idle";
  recommendation: string;
  savingPotentialRs: number;
}

export default function ApplianceDetectivePage() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [selectedAppliance, setSelectedAppliance] = useState<string>("ac");
  const [scanning, setScanning] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [optimizedNotice, setOptimizedNotice] = useState<string>("");

  const sampleAppliances: Record<string, DetectedAppliance> = {
    ac: {
      id: "ac",
      name: "Split Inverter AC (1.5 Ton)",
      category: "Cooling Appliance",
      wattage: 1450,
      starRating: 3,
      hourlyCostRs: 8.99,
      co2GramPerMin: 19.8,
      box: { top: "18%", left: "20%", width: "55%", height: "24%" },
      status: "heavy_drain",
      recommendation: "Currently cooling at 18°C. Raising thermostat to 24°C saves 28% compressor energy.",
      savingPotentialRs: 380,
    },
    fridge: {
      id: "fridge",
      name: "Double-Door Refrigerator (260L)",
      category: "Refrigeration",
      wattage: 165,
      starRating: 4,
      hourlyCostRs: 1.02,
      co2GramPerMin: 2.25,
      box: { top: "35%", left: "12%", width: "38%", height: "55%" },
      status: "optimal",
      recommendation: "Door rubber gasket seal intact. Coils free of heavy dust.",
      savingPotentialRs: 45,
    },
    geyser: {
      id: "geyser",
      name: "Storage Water Geyser (25L)",
      category: "Water Heating",
      wattage: 2000,
      starRating: 3,
      hourlyCostRs: 12.4,
      co2GramPerMin: 27.3,
      box: { top: "12%", left: "55%", width: "32%", height: "38%" },
      status: "heavy_drain",
      recommendation: "Running during 7:30 PM peak window! Shift to 10:00 PM off-peak or install a 15-min auto timer.",
      savingPotentialRs: 450,
    },
    fan: {
      id: "fan",
      name: "BLDC High-Efficiency Ceiling Fan",
      category: "Air Circulation",
      wattage: 28,
      starRating: 5,
      hourlyCostRs: 0.17,
      co2GramPerMin: 0.38,
      box: { top: "5%", left: "32%", width: "36%", height: "20%" },
      status: "optimal",
      recommendation: "5-Star BLDC motor consumes 60% less than conventional 75W induction fans.",
      savingPotentialRs: 110,
    },
  };

  const current = sampleAppliances[selectedAppliance] || sampleAppliances.ac;

  // Toggle Live Webcam
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        alert("Camera API not supported in this browser. Using high-resolution room simulator.");
      }
    } catch {
      alert("Camera permission denied or camera not found. Using high-resolution room simulator.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 1200);
  };

  const handleApplyOptimization = async () => {
    try {
      await api.completeAction("act_energy_ac_24", "photo");
      setShowConfetti(true);
      setOptimizedNotice(`Success! Optimized ${current.name}. +35 Points awarded and ~₹${current.savingPotentialRs}/mo saved!`);
      setTimeout(() => setShowConfetti(false), 3000);
      setTimeout(() => setOptimizedNotice(""), 4500);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200 mb-2">
          <Scan className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>Computer Vision & AR Energy Scanner</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          AR Appliance Energy Detective
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scan home appliances with your camera to detect live wattage drain, money burn rate, and instant optimization actions.
        </p>
      </div>

      <ConfettiBurst active={showConfetti} />

      {/* Main Viewport Container */}
      <section className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Top Viewport Header */}
        <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Vision AI HUD Active • 30 FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Camera</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Close Camera</span>
              </button>
            )}

            <button
              onClick={handleSimulateScan}
              disabled={scanning}
              className="px-3 py-1 rounded-xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
              <span>{scanning ? "Scanning..." : "Rescan"}</span>
            </button>
          </div>
        </div>

        {/* Video or Simulated Scene Area */}
        <div className="relative w-full h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            // Simulated Room Background with Appliance Artwork
            <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
              {/* Room Illustration Backdrop */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Graphical Representation of Current Appliance */}
              <div className="text-center space-y-3 z-10 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 max-w-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/15 flex items-center justify-center mx-auto shadow-xl">
                  {selectedAppliance === "ac" && <span className="text-4xl">❄️</span>}
                  {selectedAppliance === "fridge" && <span className="text-4xl">🧊</span>}
                  {selectedAppliance === "geyser" && <span className="text-4xl">🚿</span>}
                  {selectedAppliance === "fan" && <span className="text-4xl">🌀</span>}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{current.name}</h3>
                  <span className="text-xs text-slate-400">{current.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Futuristic Sci-Fi AR Bounding Box & HUD Reticle */}
          <div
            style={{
              top: current.box.top,
              left: current.box.left,
              width: current.box.width,
              height: current.box.height,
            }}
            className={`absolute border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
              current.status === "heavy_drain"
                ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                : "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
            }`}
          >
            {/* Top-left target label */}
            <div
              className={`absolute -top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                current.status === "heavy_drain"
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-500 text-slate-950"
              }`}
            >
              DETECTED: {current.name.split(" ")[0]} ({current.starRating}★)
            </div>

            {/* Corner Sci-Fi Reticles */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5" />

            {/* Live Energy Floating Chip */}
            <div className="absolute bottom-2 right-2 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">DRAIN</div>
              <div className="text-sm font-black text-amber-300">{current.wattage} W</div>
            </div>
          </div>
        </div>

        {/* Live Diagnostics HUD Footer Bar */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Power Draw</span>
              </span>
              <div className="text-xl font-black text-amber-300 mt-1">
                {current.wattage} <span className="text-xs font-normal">Watts</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Burn Rate</span>
              </span>
              <div className="text-xl font-black text-rose-400 mt-1">
                ₹{current.hourlyCostRs} <span className="text-xs font-normal">/ hr</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Carbon Emission</span>
              <div className="text-xl font-black text-sky-400 mt-1">
                {current.co2GramPerMin} <span className="text-xs font-normal">g CO₂/min</span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Savings Potential</span>
              <div className="text-xl font-black text-emerald-400 mt-1">
                ₹{current.savingPotentialRs} <span className="text-xs font-normal">/ mo</span>
              </div>
            </div>
          </div>

          {/* AI Detective Action Recommendation */}
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AI Energy Detective Recommendation</span>
              </span>
              <p className="text-xs text-amber-100 font-medium">{current.recommendation}</p>
            </div>

            <button
              onClick={handleApplyOptimization}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              Apply Optimization (+35 Pts)
            </button>
          </div>

          {optimizedNotice && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{optimizedNotice}</span>
            </div>
          )}
        </div>
      </section>

      {/* Target Appliance Selector Tabs */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Switch Target Appliance for Detective HUD
          </h3>
          <span className="text-xs text-slate-400 font-medium">Click to inspect</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "ac", label: "Air Conditioner (1.5T)", icon: "❄️", watt: "1450W" },
            { id: "geyser", label: "Water Geyser (2kW)", icon: "🚿", watt: "2000W" },
            { id: "fridge", label: "Refrigerator", icon: "🧊", watt: "165W" },
            { id: "fan", label: "BLDC Ceiling Fan", icon: "🌀", watt: "28W" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAppliance(item.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedAppliance === item.id
                  ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-bold text-xs mt-1 leading-tight">{item.label}</div>
              <span className="text-[10px] text-slate-400">{item.watt}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
