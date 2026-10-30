"use client";

import React, { useState, useEffect } from "react";
import MicroGridCanvas, { MicroGridNode } from "@/components/MicroGridCanvas";
import { api } from "@/lib/api";
import {
  Zap,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRightLeft,
  Coins,
  Leaf,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function MicrogridPage() {
  const [hour, setHour] = useState<number>(14.0); // 2:00 PM default solar afternoon
  const [loading, setLoading] = useState<boolean>(true);
  const [gridData, setGridData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<MicroGridNode | null>(null);

  // Trading modal state
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [traderName, setTraderName] = useState<string>("Flat 304 (My Home)");
  const [unitsKwh, setUnitsKwh] = useState<number>(3.5);
  const [bidPrice, setBidPrice] = useState<number>(6.0);
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch state on hour change
  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const res = await api.getMicrogridState(hour);
        if (isMounted) {
          setGridData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load microgrid state:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchState();
    return () => {
      isMounted = false;
    };
  }, [hour]);

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTradeStatus(null);
    try {
      const res = await api.placeMicrogridTrade({
        trader_name: traderName,
        trade_type: tradeType,
        units_kwh: unitsKwh,
        bid_price: bidPrice,
      });

      if (res.success) {
        setTradeStatus(`Success! Matched with ${res.transaction.seller || res.transaction.buyer} at ₹${res.transaction.price_per_kwh}/kWh.`);
        // Refresh grid data
        const updated = await api.getMicrogridState(hour);
        setGridData(updated);
      }
    } catch (err: any) {
      setTradeStatus("Trading error: " + (err.message || "Failed to submit trade"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatHour = (h: number) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const period = hr >= 12 ? "PM" : "AM";
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    return `${displayHr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${period}`;
  };

  const metrics = gridData?.metrics || {
    total_solar_generation_kw: 16.6,
    total_consumption_kw: 20.0,
    net_grid_import_kw: 3.4,
    net_grid_export_kw: 0.0,
    self_sufficiency_pct: 83.0,
    p2p_clearing_price_inr: 5.95,
    discom_standard_tariff_inr: 7.50,
    buyer_savings_pct: 20.7,
    seller_gain_pct: 138.0,
    co2_avoided_today_kg: 13.6,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GEDA Smart Grid Pilot
            </span>
            <span className="text-xs text-slate-400">P2P Virtual Power Plant (VPP)</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-emerald-400" />
            Society Micro-Grid P2P Energy Exchange
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Decentralized peer-to-peer solar trading for residential societies in Gujarat. Cut grid peak strain & earn 2.4× more than standard export tariffs.
          </p>
        </div>

        {/* Live Market Price Pill */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Algorithmic Clearing Price</div>
            <div className="text-2xl font-bold text-emerald-400">
              ₹{metrics.p2p_clearing_price_inr.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal"> / kWh</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-slate-800" />
          <div className="text-xs text-slate-400 space-y-1">
            <div>
              Grid Peak: <span className="line-through text-red-400">₹7.50</span>
            </div>
            <div>
              Buyer Saves: <span className="text-emerald-400 font-semibold">{metrics.buyer_savings_pct}%</span>
            </div>
            <div>
              Seller Boost: <span className="text-sky-400 font-semibold">+{metrics.seller_gain_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time-of-Day Diurnal Simulation Slider */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-sm font-semibold text-slate-200">Diurnal Grid Time Simulation:</span>{" "}
              <span className="text-base font-bold text-amber-400 ml-1">{formatHour(hour)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">
              {hour >= 6 && hour <= 17 ? "☀️ Solar Surplus Hours" : "🌙 Evening Peak Load Hours (Torrent Grid)"}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="6.0"
          max="23.0"
          step="0.5"
          value={hour}
          onChange={(e) => setHour(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-2">
          <span>06:00 AM (Sunrise)</span>
          <span>10:00 AM (Rooftop Peak)</span>
          <span>01:00 PM (Surplus Solar)</span>
          <span className="text-amber-400 font-medium">07:00 PM (Peak Torrent Grid)</span>
          <span>11:00 PM (Night Low)</span>
        </div>
      </div>

      {/* Grid Key Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Zap className="h-4 w-4 text-emerald-400" />
            Solar Generation
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {metrics.total_solar_generation_kw.toFixed(1)}{" "}
            <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {hour >= 6 && hour <= 18 ? "Active rooftop arrays" : "0.0 kW (Night time)"}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Activity className="h-4 w-4 text-sky-400" />
            Society Consumption
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {metrics.total_consumption_kw.toFixed(1)}{" "}
            <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Aggregated load across 24 flats</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            Self-Reliance Score
          </div>
          <div className="text-2xl font-bold text-amber-400">{metrics.self_sufficiency_pct}%</div>
          <div className="text-xs text-slate-400 mt-1">Solar meets internal demand</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Leaf className="h-4 w-4 text-emerald-400" />
            CO₂ Cut Today
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {metrics.co2_avoided_today_kg.toFixed(1)}{" "}
            <span className="text-xs text-slate-400 font-normal">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Clean green Gujarat footprint</div>
        </div>
      </div>

      {/* Main Grid Interactive Canvas & Node Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {gridData?.nodes ? (
            <MicroGridCanvas nodes={gridData.nodes} onSelectNode={setSelectedNode} />
          ) : (
            <div className="h-[460px] flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
              Loading Microgrid Canvas...
            </div>
          )}
        </div>

        {/* Selected Node Details or Society Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-400" />
                {selectedNode ? selectedNode.name : "Society Node Telemetry"}
              </h3>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Node Type</span>
                    <span className="capitalize font-semibold text-sky-400">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Installed Solar</span>
                    <span className="font-medium text-slate-200">{selectedNode.solar_kw} kWp</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Instant Solar Output</span>
                    <span className="font-bold text-emerald-400">
                      +{selectedNode.current_generation_kw.toFixed(2)} kW
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Active Load Demand</span>
                    <span className="font-medium text-red-400">
                      -{selectedNode.current_load_kw.toFixed(2)} kW
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-300 font-medium">Net P2P Position</span>
                    <span
                      className={`font-bold ${
                        selectedNode.net_export_kw >= 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {selectedNode.net_export_kw >= 0
                        ? `Exporting ${selectedNode.net_export_kw.toFixed(2)} kW`
                        : `Importing ${Math.abs(selectedNode.net_export_kw).toFixed(2)} kW`}
                    </span>
                  </div>
                </div>

                {selectedNode.battery_soc_pct > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Battery Storage State (BESS)</span>
                      <span className="font-semibold text-purple-400">{selectedNode.battery_soc_pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${selectedNode.battery_soc_pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400 space-y-3">
                <p>
                  This microgrid links rooftop solar arrays and battery banks into a localized smart energy exchange.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="text-emerald-400 font-semibold">How P2P Settlements Work:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Surplus generation is routed to neighbor apartments instantly over the 11kV bus.</li>
                    <li>Sellers receive ₹5.95/kWh (vs standard ₹2.50 DISCOM export rate).</li>
                    <li>Buyers get clean power at ₹5.95/kWh (avoiding ₹7.50 grid peak charges).</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Torrent Power Substation: Active</span>
            <span className="text-emerald-400 font-medium">Zero Feeder Stress</span>
          </div>
        </div>
      </div>

      {/* Trading Desk & Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P2P Order Terminal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" />
              1-Click P2P Energy Trading Terminal
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Smart Order Match</span>
          </div>

          <form onSubmit={handleExecuteTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTradeType("buy")}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  tradeType === "buy"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Buy Green Energy
              </button>
              <button
                type="button"
                onClick={() => setTradeType("sell")}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  tradeType === "sell"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-900/40"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Sell Solar Surplus
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Society Account</label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Energy Units (kWh)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={unitsKwh}
                  onChange={(e) => setUnitsKwh(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Price (₹/kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2.5"
                  max="7.5"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Value:</span>
                <span className="font-semibold text-slate-200">₹{(unitsKwh * bidPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Avoided Grid Peak Cost:</span>
                <span className="font-semibold">₹{(unitsKwh * (7.5 - bidPrice)).toFixed(2)}</span>
              </div>
            </div>

            {tradeStatus && (
              <div className="p-3 rounded-lg text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{tradeStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Matching Order..." : "Submit P2P Trade Order"}
            </button>
          </form>
        </div>

        {/* Real-time Order Book / Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Live Matched Transactions Ledger
              </h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Consensus Synced
              </span>
            </div>

            <div className="space-y-3">
              {(gridData?.recent_trades || []).slice(0, 5).map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                    <span className="text-sky-400">{tx.hash}</span>
                    <span>{tx.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-emerald-400">{tx.seller}</span>
                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-amber-400">{tx.buyer}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-900">
                    <span>
                      {tx.energy_kwh} kWh @ <span className="text-slate-100 font-bold">₹{tx.price_per_kwh}/unit</span>
                    </span>
                    <span className="text-emerald-400 font-medium">
                      Saved ₹{((tx.discom_avoided_cost - tx.price_per_kwh) * tx.energy_kwh).toFixed(2)} vs Grid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Verified by GEDA Microgrid Smart Engine</span>
            <span className="text-sky-400">ERC-3643 Energy Token Compatible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
