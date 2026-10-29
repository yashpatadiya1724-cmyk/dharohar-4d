"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Zap, Clock, ShieldAlert, CheckCircle2, ArrowRight, BellRing } from "lucide-react";

export default function PeakPlannerPage() {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remindedAppliance, setRemindedAppliance] = useState<string | null>(null);

  useEffect(() => {
    api.getPeakPlan()
      .then((data) => setPlan(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSetReminder = async (appliance: string, time: string) => {
    try {
      await api.schedulePeakShift(appliance, time);
      setRemindedAppliance(appliance);
      setTimeout(() => setRemindedAppliance(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const hours = plan?.hourly_distribution || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Grid Peak Relief (HC26-GEDA01)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t("peak.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t("peak.subtitle")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
            {t("peak.current_peak_load")}
          </span>
          <div className="text-2xl font-black text-red-950">
            {plan?.current_peak_kwh_month ?? 28.5} <span className="text-xs font-medium">kWh/mo</span>
          </div>
          <p className="text-[11px] text-red-700/80">6:00 PM – 10:00 PM Evening Window</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {t("peak.potential_relief")}
          </span>
          <div className="text-2xl font-black text-emerald-950">
            {plan?.potential_shift_kwh ?? 18.0} <span className="text-xs font-medium">kWh/mo</span>
          </div>
          <p className="text-[11px] text-emerald-700/80">Shiftable to Off-Peak Hours</p>
        </div>
      </div>

      {/* 24-Hour Timeline Bar Chart */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{t("peak.timeline_title")}</span>
          </h2>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Off-Peak (₹5.8/u)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Peak (₹7.5/u)
            </span>
          </div>
        </div>

        {/* 24-hour visual columns */}
        <div className="pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[560px] flex items-end gap-1.5 h-36">
            {hours.map((slot: any) => {
              const heightPct = Math.min(100, Math.max(15, (slot.load_kw / 2.5) * 100));
              return (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap shadow-md">
                    {slot.label}: {slot.load_kw} kW
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      slot.is_peak
                        ? "bg-rose-500 group-hover:bg-rose-600 shadow-xs shadow-rose-500/20"
                        : "bg-emerald-400 group-hover:bg-emerald-500"
                    }`}
                  />
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-700">
                    {slot.hour % 6 === 0 ? `${slot.hour}h` : "•"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <span>
            <strong>Peak Window Notice:</strong> Torrent Power and UGVCL Gujarat experience highest commercial + domestic spikes between 18:00 and 22:00.
          </span>
        </div>
      </section>

      {/* Smart Shift Suggestions */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          {t("peak.suggestions_title")}
        </h2>

        <div className="space-y-3">
          {(plan?.suggestions || []).map((sugg: any, idx: number) => {
            const isReminded = remindedAppliance === sugg.appliance;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-lifepulse-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {sugg.appliance}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      -{sugg.kwh_shifted_monthly} kWh Peak Load
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="line-through text-rose-500 font-medium">
                      {sugg.current_time}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {sugg.suggested_time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isReminded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Reminder Set (+15 Pts)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetReminder(sugg.appliance, sugg.suggested_time)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t("peak.shift_btn")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
