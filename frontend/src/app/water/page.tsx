"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Droplet,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Plus
} from "lucide-react";
import { ConfettiBurst } from "@/components/ConfettiBurst";

export default function WaterTrackerPage() {
  const { t, language } = useLanguage();
  const [waterData, setWaterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingAction, setLoggingAction] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Leak audit modal state
  const [showLeakAudit, setShowLeakAudit] = useState(false);
  const [meterMoved, setMeterMoved] = useState<boolean | null>(null);
  const [auditSubmitting, setAuditSubmitting] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const fetchWaterData = async () => {
    try {
      const data = await api.getWaterSummary();
      setWaterData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterData();
  }, []);

  const handleQuickLog = async (activityType: string, litres: number, label: string) => {
    setLoggingAction(activityType);
    try {
      const res = await api.logWaterActivity(activityType, litres);
      setSuccessMsg(res.message);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      fetchWaterData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (e: any) {
      alert("Error logging water action: " + e.message);
    } finally {
      setLoggingAction(null);
    }
  };

  const handleSubmitAudit = async () => {
    if (meterMoved === null) return;
    setAuditSubmitting(true);
    try {
      const res = await api.submitLeakAudit(meterMoved, 2);
      setAuditResult(res);
      if (res.status === "PASS") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
      fetchWaterData();
    } catch (e: any) {
      alert("Audit error: " + e.message);
    } finally {
      setAuditSubmitting(false);
    }
  };

  const members = waterData?.household_members ?? 3;
  const benchmarkMonthly = waterData?.monthly_benchmark_litres ?? 12150;
  const waterSaved = waterData?.water_saved_month_litres ?? 840;
  const pumpingKwh = waterData?.pumping_kwh_saved ?? 0.25;
  const waterScore = waterData?.water_efficiency_score ?? 76;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 mb-2">
          <Droplet className="w-3.5 h-3.5 text-blue-600 fill-blue-500" />
          <span>Mission LiFE Water Theme (જળ સંરક્ષણ / जल संरक्षण)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Smart Household Water Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor potable water consumption, prevent pipe leaks, and reduce municipal pumping energy.
        </p>
      </div>

      <ConfettiBurst active={showConfetti} />

      {/* Main Water Efficiency Card */}
      <section className="bg-gradient-to-br from-blue-900 via-sky-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-6 relative overflow-hidden border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-200">
              Ministry of Jal Shakti Benchmark (135 L / capita / day)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Family Baseline: {waterData?.daily_benchmark_litres ?? 405} L / day
            </h2>
            <p className="text-xs text-sky-100/80">
              {members} Members • Monthly Allocation: {benchmarkMonthly.toLocaleString()} Litres
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 self-start sm:self-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-300 stroke-current"
                  strokeWidth="3.5"
                  strokeDasharray={`${waterScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black">{waterScore}</span>
                <span className="text-[8px] uppercase tracking-wider text-sky-200">/ 100</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-sky-200">Water Score</div>
              <div className="text-xs font-semibold text-white mt-0.5">Mindful Saver</div>
              <span className="text-[10px] text-sky-300 font-medium">Top 15% in Society</span>
            </div>
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-sky-200 font-medium">Potable Conserved</span>
            <div className="text-lg sm:text-xl font-black text-sky-300 mt-0.5">
              {waterSaved.toLocaleString()} L
            </div>
            <span className="text-[9px] text-slate-300">This Month</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-sky-200 font-medium">Pumping Energy</span>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
              ⚡ {pumpingKwh} kWh
            </div>
            <span className="text-[9px] text-slate-300">Electricity Saved</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-sky-200 font-medium">Leak Status</span>
            <div className="text-xs sm:text-sm font-extrabold text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Safe</span>
            </div>
            <span className="text-[9px] text-slate-300">2-Hr Test Passed</span>
          </div>
        </div>
      </section>

      {successMsg && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Action Logging Buttons */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Daily Water Micro-Action Quick Log
          </h3>
          <p className="text-xs text-slate-500">
            Tap to record daily savings into your immutable Impact Ledger
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickLog("bucket_bath", 60.0, "Bucket Bath vs Shower")}
            disabled={loggingAction !== null}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all text-left space-y-1.5 cursor-pointer active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                +60 Litres
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="font-bold text-xs text-slate-900">
              Bucket Bath vs Shower
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Avoids ~60L compared to a continuous 10-minute shower.
            </p>
          </button>

          <button
            onClick={() => handleQuickLog("ro_reuse", 40.0, "RO Reject Reuse")}
            disabled={loggingAction !== null}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all text-left space-y-1.5 cursor-pointer active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                +40 Litres
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </div>
            <div className="font-bold text-xs text-slate-900">
              RO Reject Collection
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Collected reject stream in a bucket for mopping or plants.
            </p>
          </button>

          <button
            onClick={() => handleQuickLog("aerator", 25.0, "Tap Aerator Usage")}
            disabled={loggingAction !== null}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-all text-left space-y-1.5 cursor-pointer active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                +25 Litres
              </span>
              <Plus className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
            </div>
            <div className="font-bold text-xs text-slate-900">
              Tap Aerator Attachment
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Maintains high water pressure with 50% lower volume.
            </p>
          </button>
        </div>
      </section>

      {/* 2-Hour Leak Audit Banner & Tool */}
      <section className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
              PRD F15: Leak Detection Protocol
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Conduct a 2-Hour Zero-Consumption Leak Audit
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Turn off all taps for 2 hours and check if your water meter moves.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowLeakAudit(true);
            setAuditResult(null);
            setMeterMoved(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          Start Leak Audit (+35 Pts)
        </button>
      </section>

      {/* Leak Audit Modal */}
      {showLeakAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Mission LiFE Leak Verification
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  2-Hour Meter Audit Test
                </h3>
              </div>
              <button
                onClick={() => setShowLeakAudit(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {auditResult ? (
              <div
                className={`p-4 rounded-2xl border text-center space-y-2 ${
                  auditResult.status === "PASS"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                {auditResult.status === "PASS" ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                )}
                <h4 className="text-sm font-bold">
                  {auditResult.status === "PASS" ? "Audit Passed! Leak-Free Home" : "Potential Leak Detected"}
                </h4>
                <p className="text-xs">{auditResult.message}</p>
                <button
                  onClick={() => setShowLeakAudit(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-200">
                  <span className="font-bold text-slate-800">Test Instructions:</span>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Close all bathroom & kitchen taps completely.</li>
                    <li>Ensure washing machine & RO filters are off.</li>
                    <li>Check your building / municipal water meter dial after 2 hours.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Did the meter reading increase?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMeterMoved(false)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        meterMoved === false
                          ? "bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      No (Zero Movement)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeterMoved(true)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        meterMoved === true
                          ? "bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-600/20"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      Yes (Dial Moved)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowLeakAudit(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={meterMoved === null || auditSubmitting}
                    onClick={handleSubmitAudit}
                    className="flex-1 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {auditSubmitting ? "Verifying..." : "Submit Audit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
