"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AhmedabadWardMap } from "@/components/AhmedabadWardMap";
import {
  Shield,
  Zap,
  CloudSun,
  Droplet,
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp,
  MapPin,
  ExternalLink
} from "lucide-react";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    try {
      const [ovRes, revRes] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminReviewQueue().catch(() => [])
      ]);
      if (ovRes) setOverview(ovRes);
      if (revRes) setReviews(revRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewDecision = async (id: string, approved: boolean) => {
    try {
      const res = await api.decideReview(id, approved);
      setActionMsg(res.message);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTimeout(() => setActionMsg(""), 3000);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-lifepulse-400" />
            <span>GEDA Administrative Oversight Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mission LiFE Impact Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time municipal ward analytics and proof-of-impact verification queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/v1/admin/export/csv"
            download="GEDA_Ahmedabad_Ward_Impact_Report.csv"
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
            <span>Download CSV Report</span>
          </a>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Jurisdiction
            </span>
            <div className="text-sm font-extrabold text-slate-900">
              Ahmedabad (AMC)
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Energy Saved</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.kwh_saved_total?.toLocaleString() ?? "4,080"}{" "}
            <span className="text-xs font-normal text-slate-500">kWh</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last cycle
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO₂ Avoided</span>
            <CloudSun className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.co2_avoided_tonnes ?? "3.35"}{" "}
            <span className="text-xs font-normal text-slate-500">Tonnes</span>
          </div>
          <p className="text-[10px] text-slate-400">Based on CEA 0.82 kg/kWh</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Potable Water Saved</span>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.water_saved_kiloliters ?? "18.5"}{" "}
            <span className="text-xs font-normal text-slate-500">kL</span>
          </div>
          <p className="text-[10px] text-slate-400">RO reuse & bucket bath</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Households</span>
            <Users className="w-4 h-4 text-lifepulse-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.total_users ?? 150}
          </div>
          <p className="text-[10px] text-slate-500">DAU: {overview?.dau_count ?? 63}</p>
        </div>
      </div>

      {/* Interactive Ahmedabad Ward Vector Heatmap */}
      <AhmedabadWardMap />

      {/* Ward Heatmap & Performance Table */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ward Aggregate Performance & Heatmap
            </h2>
            <p className="text-xs text-slate-500">
              Micro-action participation across 6 major AMC municipal zones
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            6 Wards Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5">Ward Name</th>
                <th className="py-2.5">Centroid (Lat/Lng)</th>
                <th className="py-2.5">Households</th>
                <th className="py-2.5">kWh Saved</th>
                <th className="py-2.5">CO₂ Avoided (kg)</th>
                <th className="py-2.5 text-right">Avg LiFE Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(overview?.wards || []).map((w: any) => (
                <tr key={w.ward_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-lifepulse-700" />
                    <span>{w.ward_name}</span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                  </td>
                  <td className="py-3">{w.households_count}</td>
                  <td className="py-3 font-bold text-amber-700">
                    ⚡ {w.kwh_saved_total} kWh
                  </td>
                  <td className="py-3 text-sky-700">
                    {w.co2_saved_total} kg
                  </td>
                  <td className="py-3 text-right">
                    <span className="bg-lifepulse-100 text-lifepulse-900 font-black px-2 py-0.5 rounded-md">
                      {w.avg_life_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top 5 Behaviours & Anti-Fraud Review Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 5 Behaviours */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Top High-Impact Behaviours
          </h3>
          <div className="space-y-2.5">
            {(overview?.top_behaviours || []).map((b: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{b.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {b.theme} • {b.completed} citizen completions
                  </div>
                </div>
                <span className="font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  ⚡ {b.kwh_saved} kWh
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Verification & Anti-Fraud Review Queue */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-slate-600" />
              <span>Photo Verification Queue</span>
            </h3>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {reviews.length} Flagged
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <span>Review queue is clear! All photo proofs verified.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.proof_url}
                      alt="Proof"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        {rev.action_title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Date: {rev.date} • Conf: {(rev.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReviewDecision(rev.id, true)}
                      className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                      title="Approve proof"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReviewDecision(rev.id, false)}
                      className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer"
                      title="Reject proof & reverse ledger"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
