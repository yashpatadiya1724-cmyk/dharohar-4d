"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Sliders, Sparkles, Zap, IndianRupee, CloudSun, Leaf, Power } from "lucide-react";

export default function WhatIfSimulatorPage() {
  const { t } = useLanguage();
  const [acTemp, setAcTemp] = useState<number>(24);
  const [acHours, setAcHours] = useState<number>(5);
  const [geyserMins, setGeyserMins] = useState<number>(15);
  const [ledPct, setLedPct] = useState<number>(80);
  const [standbyCut, setStandbyCut] = useState<boolean>(true);
  const [simResult, setSimResult] = useState<any>(null);

  const runSim = async () => {
    try {
      const res = await api.simulateWhatIf({
        ac_temp_celsius: acTemp,
        ac_daily_hours: acHours,
        geyser_minutes_daily: geyserMins,
        led_bulb_percentage: ledPct,
        standby_power_cut: standbyCut,
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    runSim();
  }, [acTemp, acHours, geyserMins, ledPct, standbyCut]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 mb-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-700" />
          <span>Live Household Energy Simulator</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          What-If Energy & Carbon Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Adjust the sliders below to see immediate monthly savings and your projected LiFE Score.
        </p>
      </div>

      {/* Real-time Dynamic Impact Header Card */}
      {simResult && (
        <div className="bg-gradient-to-br from-lifepulse-800 to-lifepulse-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-lifepulse-200 tracking-wider">
              Projected Monthly Savings
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Score: {simResult.new_life_score}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <div className="text-[11px] text-lifepulse-200 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>kWh Saved</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {simResult.kwh_saved_monthly} <span className="text-xs font-normal">units</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <div className="text-[11px] text-lifepulse-200 flex items-center justify-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-300" />
                <span>Bill Cut</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                ₹{simResult.rupees_saved_monthly}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
              <div className="text-[11px] text-lifepulse-200 flex items-center justify-center gap-1">
                <CloudSun className="w-3 h-3 text-sky-300" />
                <span>CO₂ Avoided</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">
                {simResult.co2_saved_monthly} <span className="text-xs font-normal">kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sliders Card */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-6">
        {/* Slider 1: AC Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Air Conditioner Set Temperature
            </label>
            <span className="text-base font-black text-lifepulse-800">
              {acTemp}°C {acTemp >= 24 ? "🌱 (Recommended)" : "⚡ (High Load)"}
            </span>
          </div>
          <input
            type="range"
            min="18"
            max="28"
            step="1"
            value={acTemp}
            onChange={(e) => setAcTemp(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>18°C (Max Load)</span>
            <span>24°C (BEE Standard)</span>
            <span>28°C</span>
          </div>
        </div>

        {/* Slider 2: AC Hours */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. AC Daily Usage Duration
            </label>
            <span className="text-base font-black text-slate-900">
              {acHours} Hours / Day
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={acHours}
            onChange={(e) => setAcHours(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0 hrs</span>
            <span>6 hrs</span>
            <span>12 hrs</span>
          </div>
        </div>

        {/* Slider 3: Geyser Minutes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Geyser Heating Time
            </label>
            <span className="text-base font-black text-slate-900">
              {geyserMins} Minutes / Day
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            step="5"
            value={geyserMins}
            onChange={(e) => setGeyserMins(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>5 mins</span>
            <span>20 mins</span>
            <span>45 mins</span>
          </div>
        </div>

        {/* Slider 4: LED Adoption */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. LED Lighting Penetration
            </label>
            <span className="text-base font-black text-slate-900">
              {ledPct}% of all home lights
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={ledPct}
            onChange={(e) => setLedPct(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Toggle 5: Standby Power Cut */}
        <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Power className="w-4 h-4 text-rose-500" />
              <span>Turn Off Vampire Standby Power</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cuts 6% wasted load from TV, set-top boxes and chargers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStandbyCut(!standbyCut)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              standbyCut ? "bg-lifepulse-700" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                standbyCut ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
