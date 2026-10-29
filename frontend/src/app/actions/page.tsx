"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { CheckCircle2, Zap, Droplet, ShoppingBag, Apple, Trash2, Cpu, Bike, Sparkles } from "lucide-react";

export default function ActionsCatalogPage() {
  const { t, language } = useLanguage();
  const [actions, setActions] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTodayActions(language)
      .then((data) => setActions(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [language]);

  const themes = [
    { id: "all", label: "All Themes", icon: Sparkles },
    { id: "save_energy", label: "Save Energy", icon: Zap },
    { id: "save_water", label: "Save Water", icon: Droplet },
    { id: "reduce_plastic", label: "Reduce Plastic", icon: ShoppingBag },
    { id: "sustainable_food", label: "Sustainable Food", icon: Apple },
    { id: "reduce_waste", label: "Reduce Waste", icon: Trash2 },
    { id: "reduce_ewaste", label: "E-Waste", icon: Cpu },
    { id: "healthy_lifestyle", label: "Healthy Lifestyle", icon: Bike },
  ];

  const filtered = activeTheme === "all" ? actions : actions.filter((a) => a.theme === activeTheme);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lifepulse-100 text-lifepulse-900 text-xs font-bold border border-lifepulse-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-lifepulse-700" />
          <span>Official Mission LiFE Catalog</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Micro-Action Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore measurable lifestyle actions across the 7 Mission LiFE themes.
        </p>
      </div>

      {/* Theme Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {themes.map((th) => {
          const Icon = th.icon;
          const isActive = activeTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => setActiveTheme(th.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-lifepulse-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{th.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((action, i) => (
          <div
            key={action.id || i}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:border-lifepulse-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {action.theme.replace("_", " ")}
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +{action.base_points} Pts
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                {action.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {action.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {action.est_kwh > 0 && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    ⚡ {action.est_kwh} kWh
                  </span>
                )}
                {action.est_water_l > 0 && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                    💧 {action.est_water_l} L
                  </span>
                )}
              </div>

              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {action.verification_type.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
