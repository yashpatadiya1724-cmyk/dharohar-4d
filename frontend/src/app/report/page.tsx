"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Award,
  Share2,
  Download,
  Sparkles,
  Zap,
  CloudSun,
  Droplet,
  CheckCircle2,
  Flame,
  TreePine
} from "lucide-react";

export default function ImpactReportPage() {
  const { t } = useLanguage();

  const shareText = encodeURIComponent(
    "🌿 Proud to be a Mission LiFE Citizen! I saved 38.2 kWh electricity and 31.3 kg CO₂ this month in Ahmedabad on LiFE Pulse (GEDA). My LiFE Score is 78/100! Calculate yours: http://localhost:3000"
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto py-2">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 mb-2">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>F15: Monthly Verified Impact Certificate</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Sustainability Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your verified environmental contribution with your residential society and family.
        </p>
      </div>

      {/* High-Resolution Certificate Card */}
      <div className="bg-gradient-to-br from-lifepulse-900 via-lifepulse-800 to-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10 space-y-6">
        {/* Subtle Watermark */}
        <div className="absolute -bottom-10 -right-10 text-white/5 font-black text-9xl pointer-events-none select-none">
          LiFE
        </div>

        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Mission LiFE Gujarat • GEDA
              </div>
              <div className="text-sm font-extrabold text-white">
                Eco-Citizen Certificate
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-lifepulse-300 uppercase">Cycle</span>
            <div className="text-xs font-black text-white">October 2026</div>
          </div>
        </div>

        {/* Citizen Details */}
        <div className="space-y-1 text-center py-2">
          <div className="text-xs uppercase tracking-widest text-lifepulse-200">
            Awarded To
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Rina Patel
          </h2>
          <p className="text-xs text-lifepulse-100/80">
            Satellite Ward • Goyal Intercity Society, Ahmedabad
          </p>
        </div>

        {/* Badge & Score Pill */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Tree Level (વૃક્ષ)</div>
              <div className="text-[10px] text-amber-300 font-semibold">Top 12% in Ahmedabad</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-300">78</div>
            <div className="text-[9px] uppercase tracking-wider text-lifepulse-200">LiFE Score</div>
          </div>
        </div>

        {/* 3 Verified Impacts */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] text-lifepulse-200 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Electricity</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">38.2 kWh</div>
            <span className="text-[9px] text-slate-400">Saved</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] text-lifepulse-200 flex items-center justify-center gap-1">
              <CloudSun className="w-3 h-3 text-sky-300" />
              <span>Carbon</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">31.3 kg</div>
            <span className="text-[9px] text-slate-400">CO₂ Avoided</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] text-lifepulse-200 flex items-center justify-center gap-1">
              <Droplet className="w-3 h-3 text-blue-300" />
              <span>Water</span>
            </div>
            <div className="text-base font-black text-white mt-0.5">840 L</div>
            <span className="text-[9px] text-slate-400">Conserved</span>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-lifepulse-200">
          <span>Verification ID: LP-AHM-2026-9842</span>
          <span className="flex items-center gap-1 font-bold text-amber-300">
            <Flame className="w-3 h-3 fill-amber-300" /> 7-Day Active Streak
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <a
          href={`https://api.whatsapp.com/send?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to WhatsApp</span>
        </a>

        <button
          onClick={() => window.print()}
          className="py-3.5 px-5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
