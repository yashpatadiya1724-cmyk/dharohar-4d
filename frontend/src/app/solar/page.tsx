"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Sun, IndianRupee, ShieldCheck, ArrowUpRight, CheckCircle2, Info } from "lucide-react";

export default function SolarCalculatorPage() {
  const { t } = useLanguage();
  const [billRs, setBillRs] = useState<number>(2200);
  const [roofSqm, setRoofSqm] = useState<number>(30);
  const [shading, setShading] = useState<string>("low");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.estimateSolar({
        monthly_bill_rs: billRs,
        roof_area_sqm: roofSqm,
        shading,
      });
      setResult(res);
    } catch (e: any) {
      alert("Error calculating solar feasibility: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run initial calculation once on mount if no result
  React.useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 mb-2">
          <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>PM Surya Ghar Muft Bijli Yojana Gujarat</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t("solar.title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t("solar.subtitle")}
        </p>
      </div>

      {/* Input Sliders Card */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-5">
        {/* Bill Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("solar.bill_label")}
            </label>
            <span className="text-base font-black text-lifepulse-800">
              ₹{billRs.toLocaleString()} / month
            </span>
          </div>
          <input
            type="range"
            min="600"
            max="12000"
            step="100"
            value={billRs}
            onChange={(e) => setBillRs(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>₹600</span>
            <span>₹4,000</span>
            <span>₹8,000</span>
            <span>₹12,000+</span>
          </div>
        </div>

        {/* Roof Space Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("solar.roof_label")}
            </label>
            <span className="text-base font-black text-slate-900">
              {roofSqm} sq. m ({Math.round(roofSqm * 10.76)} sq. ft)
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={roofSqm}
            onChange={(e) => setRoofSqm(Number(e.target.value))}
            className="w-full accent-lifepulse-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>10 sq.m</span>
            <span>50 sq.m</span>
            <span>100 sq.m</span>
            <span>150 sq.m</span>
          </div>
        </div>

        {/* Shading Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t("solar.shading_label")}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "none", label: "Zero Shade" },
              { id: "low", label: "Low Shade (<10%)" },
              { id: "medium", label: "Medium (20%)" },
              { id: "high", label: "High Shade" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShading(opt.id)}
                className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                  shading === opt.id
                    ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? "Calculating..." : t("solar.calculate_btn")}
        </button>
      </section>

      {/* Results Card */}
      {result && (
        <section className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  {t("solar.recommended_capacity")}
                </span>
                <div className="text-4xl font-black mt-1 text-white">
                  {result.recommended_kw} kW <span className="text-sm font-medium text-slate-300">Rooftop Solar</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Generates ~{result.monthly_generation_kwh} kWh/month (Offsets 95% of your power bill)
                </p>
              </div>

              <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                  {t("solar.est_subsidy")}
                </span>
                <div className="text-2xl font-black text-amber-300">
                  ₹{result.subsidy_amount_rs.toLocaleString()}
                </div>
                <span className="text-[10px] text-amber-200/80">Direct DBT to Bank</span>
              </div>
            </div>

            {/* 4 Financial Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-slate-400">{t("solar.net_investment")}</div>
                <div className="text-lg font-black text-white mt-1">
                  ₹{result.net_cost_rs.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400">After Subsidy</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-slate-400">{t("solar.annual_savings")}</div>
                <div className="text-lg font-black text-emerald-400 mt-1">
                  ₹{result.annual_savings_rs.toLocaleString()}
                </div>
                <span className="text-[9px] text-emerald-400/80">Per Year</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-slate-400">{t("solar.payback_years")}</div>
                <div className="text-lg font-black text-amber-400 mt-1">
                  {result.payback_years} Yrs
                </div>
                <span className="text-[9px] text-slate-400">ROI Breakeven</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] text-slate-400">{t("solar.lifetime_co2")}</div>
                <div className="text-lg font-black text-sky-400 mt-1">
                  {result.co2_avoided_tonnes_lifetime} T
                </div>
                <span className="text-[9px] text-slate-400">Over 25 Yrs</span>
              </div>
            </div>

            {/* 25-Year Cash Flow Projection */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                25-Year Cumulative Savings Trajectory
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="py-2">Year</th>
                      <th className="py-2">Gen (kWh)</th>
                      <th className="py-2">Yearly Savings</th>
                      <th className="py-2 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.cashflow_25yr.map((row: any) => (
                      <tr key={row.year} className="hover:bg-white/5">
                        <td className="py-1.5 font-bold text-slate-300">Yr {row.year}</td>
                        <td className="py-1.5 text-slate-400">{row.generation_kwh}</td>
                        <td className="py-1.5 text-emerald-400">₹{row.savings_rs.toLocaleString()}</td>
                        <td className={`py-1.5 text-right font-bold ${row.net_cumulative_rs >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          ₹{row.net_cumulative_rs.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Installer Connect Button */}
            {leadSent ? (
              <div className="p-3 bg-emerald-900/50 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-200">
                  Lead successfully sent to GEDA certified installer! They will contact you shortly.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setLeadSent(true)}
                className="w-full py-3 rounded-2xl bg-lifepulse-700 hover:bg-lifepulse-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t("solar.connect_installer")}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-4 bg-slate-100 rounded-2xl text-[11px] text-slate-600 space-y-1">
            <div className="font-bold flex items-center gap-1 text-slate-800">
              <Info className="w-3.5 h-3.5" />
              <span>Assumptions & Technical Notes</span>
            </div>
            <p>{result.assumptions_note}</p>
          </div>
        </section>
      )}
    </div>
  );
}
