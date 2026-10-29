"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Sparkles,
  Zap,
  Droplet,
  CloudSun,
  CheckCircle2,
  ChevronRight,
  Info,
  Camera,
  Timer,
  Check,
  AlertCircle,
  ArrowRight,
  Leaf
} from "lucide-react";

export default function TodayPage() {
  const { t, language } = useLanguage();
  const [scoreData, setScoreData] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [verifyType, setVerifyType] = useState<string>("self_attest");
  const [submitting, setSubmitting] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [completedSuccessMsg, setCompletedSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      const [scoreRes, actionsRes] = await Promise.all([
        api.getScore().catch(() => null),
        api.getTodayActions(language).catch(() => [])
      ]);
      if (scoreRes) setScoreData(scoreRes);
      if (actionsRes && actionsRes.length > 0) setActions(actionsRes);
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const handleCompleteAction = async () => {
    if (!selectedAction) return;
    setSubmitting(true);
    try {
      const res = await api.completeAction(selectedAction.id, verifyType);
      setCompletedSuccessMsg(res.message || "Action recorded successfully!");
      // Update action status in UI
      setActions((prev) =>
        prev.map((a) => (a.id === selectedAction.id ? { ...a, status: "done" } : a))
      );
      // Refresh score
      const freshScore = await api.getScore();
      setScoreData(freshScore);
      setTimeout(() => {
        setSelectedAction(null);
        setCompletedSuccessMsg("");
      }, 1600);
    } catch (err: any) {
      alert("Error completing action: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipAction = async (actionId: string) => {
    try {
      await api.skipAction(actionId);
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, status: "skipped" } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Safe fallback score if database is still starting
  const score = scoreData?.score ?? 68;
  const levelTitle = scoreData?.level_title ?? "Sprout (કૂંપળ / पौधा)";
  const nextAction = scoreData?.next_best_action ?? "Set AC to 24°C / AC 24 ડિગ્રી પર ચલાવો";

  const allCompleted = actions.length > 0 && actions.every((a) => a.status === "done");

  return (
    <div className="space-y-6">
      {/* 1. HERO: LiFE Score Card */}
      <section className="bg-gradient-to-br from-lifepulse-800 via-lifepulse-700 to-lifepulse-900 rounded-3xl p-6 text-white shadow-xl shadow-lifepulse-900/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-lifepulse-100 text-xs font-medium border border-white/15">
              <Leaf className="w-3.5 h-3.5 text-lifepulse-300" />
              <span>{levelTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("today.greeting")}, Rina!
            </h1>
            <p className="text-lifepulse-100/90 text-sm max-w-sm">
              Ahmedabad • Satellite Ward • Goyal Intercity
            </p>
          </div>

          {/* Circular Score Gauge */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 self-start md:self-auto">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 stroke-current"
                  strokeWidth="3.5"
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight">{score}</span>
                <span className="text-[9px] uppercase tracking-wider text-lifepulse-200">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-lifepulse-200 font-semibold">
                {t("today.score_title")}
              </div>
              <div className="text-xs text-white/90 font-medium">
                Top 12% in Satellite Ward
              </div>
              <button
                onClick={() => setShowDriverModal(true)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                <span>{t("today.how_calculated")}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Footprint Mini Counter Bar */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl py-2 px-1">
            <div className="text-xs text-lifepulse-200 font-medium flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Electricity</span>
            </div>
            <div className="text-base font-bold mt-0.5">
              {scoreData?.kwh_month ?? 210} <span className="text-xs font-normal">kWh/mo</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl py-2 px-1">
            <div className="text-xs text-lifepulse-200 font-medium flex items-center justify-center gap-1">
              <CloudSun className="w-3 h-3 text-sky-300" />
              <span>CO₂ Saved</span>
            </div>
            <div className="text-base font-bold mt-0.5">
              {scoreData?.co2_month ?? 172} <span className="text-xs font-normal">kg</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl py-2 px-1">
            <div className="text-xs text-lifepulse-200 font-medium flex items-center justify-center gap-1">
              <Droplet className="w-3 h-3 text-blue-300" />
              <span>Water</span>
            </div>
            <div className="text-base font-bold mt-0.5">
              12.1 <span className="text-xs font-normal">kL/mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HIGHEST IMPACT NEXT BEST ACTION BANNER */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 shrink-0">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            {t("today.next_best")}
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">
            {nextAction}
          </p>
        </div>
        <Link
          href="/peak"
          className="shrink-0 self-center bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1"
        >
          <span>Act</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 3. TODAY'S 3 MICRO-ACTIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {t("today.three_actions")}
            </h2>
            <p className="text-xs text-slate-500">
              Personalized for your household appliances and Gujarat grid profile
            </p>
          </div>
          <span className="text-xs font-bold text-lifepulse-700 bg-lifepulse-50 border border-lifepulse-200 px-2.5 py-1 rounded-full">
            {actions.filter((a) => a.status === "done").length}/3 Done
          </span>
        </div>

        {allCompleted && (
          <div className="p-4 rounded-2xl bg-lifepulse-50 border border-lifepulse-200 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-lifepulse-600 mx-auto" />
            <h3 className="text-sm font-bold text-lifepulse-900">
              {t("today.completed_all")}
            </h3>
            <p className="text-xs text-lifepulse-700">
              You added 85 pts to your Impact Ledger and earned 1 freeze token.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {actions.map((action, idx) => {
            const isDone = action.status === "done";
            const isSkipped = action.status === "skipped";

            return (
              <div
                key={action.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-slate-50/80 border-slate-200 opacity-80"
                    : "bg-white border-slate-200/90 hover:border-lifepulse-400 hover:shadow-md shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {action.theme.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +{action.base_points} {t("today.points")}
                      </span>
                      {action.est_kwh > 0 && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          ⚡ {action.est_kwh} kWh
                        </span>
                      )}
                      {action.est_water_l > 0 && (
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          💧 {action.est_water_l} L
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isDone ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {action.desc}
                    </p>
                  </div>

                  {/* Complete trigger button */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-lifepulse-700 bg-lifepulse-100 px-3 py-1.5 rounded-xl border border-lifepulse-200">
                        <Check className="w-3.5 h-3.5" />
                        Done
                      </span>
                    ) : isSkipped ? (
                      <span className="text-xs text-slate-400 font-medium px-2 py-1">
                        Skipped
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedAction(action)}
                          className="bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs hover:shadow-lifepulse-700/20 active:scale-95 cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>{t("actions.mark_complete")}</span>
                        </button>
                        <button
                          onClick={() => handleSkipAction(action.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {t("actions.skip")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MODAL: Verification Proof Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lifepulse-700">
                  {selectedAction.theme.replace("_", " ")}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedAction.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {completedSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-lifepulse-50 border border-lifepulse-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-lifepulse-600 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-lifepulse-900">{completedSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("actions.verify_title")}
                  </label>

                  <div
                    onClick={() => setVerifyType("self_attest")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      verifyType === "self_attest"
                        ? "border-lifepulse-600 bg-lifepulse-50/60 ring-2 ring-lifepulse-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-lifepulse-700 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {t("actions.verify_self")}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Earns base points (subject to weekly theme cap)
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setVerifyType("photo")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      verifyType === "photo"
                        ? "border-lifepulse-600 bg-lifepulse-50/60 ring-2 ring-lifepulse-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Camera className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {t("actions.verify_photo")}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        AI Image classifier verification (MobileNetV3)
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setVerifyType("timer")}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      verifyType === "timer"
                        ? "border-lifepulse-600 bg-lifepulse-50/60 ring-2 ring-lifepulse-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Timer className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {t("actions.verify_timer")}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Automatic off-peak timer confirmation
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedAction(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    onClick={handleCompleteAction}
                    className="flex-1 py-2.5 rounded-xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Verifying..." : t("actions.submit_proof")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL: How is LiFE Score Calculated? */}
      {showDriverModal && scoreData?.drivers && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t("today.how_calculated")}
                </h3>
                <p className="text-xs text-slate-500">
                  Mission LiFE transparent multi-driver scoring system
                </p>
              </div>
              <button
                onClick={() => setShowDriverModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {scoreData.drivers.map((driver: any) => (
                <div key={driver.key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{driver.name}</span>
                    <span className="font-semibold text-lifepulse-700">
                      {driver.score} / {driver.max_score} pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-lifepulse-600 h-full rounded-full transition-all"
                      style={{ width: `${driver.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{driver.tip}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowDriverModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
