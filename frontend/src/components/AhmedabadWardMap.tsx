"use client";

import React, { useState } from "react";
import { MapPin, Zap, CloudSun, Users, Trophy } from "lucide-react";

interface WardData {
  id: string;
  name: string;
  kwh: number;
  co2: number;
  households: number;
  score: number;
  societies: string[];
}

export const AhmedabadWardMap: React.FC<{
  wards?: any[];
  onSelectWard?: (wardName: string) => void;
}> = ({ wards = [], onSelectWard }) => {
  const [selectedWard, setSelectedWard] = useState<string>("Satellite");

  // Default ward data if empty
  const defaultWards: Record<string, WardData> = {
    Satellite: {
      id: "sat",
      name: "Satellite",
      kwh: 1240.0,
      co2: 1016.8,
      households: 38,
      score: 72,
      societies: ["Shivalik Park", "Goyal Intercity", "Samarpan Flats"],
    },
    Navrangpura: {
      id: "nav",
      name: "Navrangpura",
      kwh: 980.5,
      co2: 804.0,
      households: 32,
      score: 69,
      societies: ["Samarpan Apartment", "Swastik Residency"],
    },
    Maninagar: {
      id: "man",
      name: "Maninagar",
      kwh: 810.0,
      co2: 664.2,
      households: 28,
      score: 65,
      societies: ["Kankaria Lakefront Society", "Rambaug Greens"],
    },
    Naranpura: {
      id: "nar",
      name: "Naranpura",
      kwh: 760.0,
      co2: 623.2,
      households: 25,
      score: 67,
      societies: ["Ankur Society", "Sardar Patel Colony"],
    },
    Bopal: {
      id: "bop",
      name: "Bopal",
      kwh: 690.0,
      co2: 565.8,
      households: 22,
      score: 64,
      societies: ["South Bopal Sun City", "Aarohi Crest"],
    },
    Chandkheda: {
      id: "cha",
      name: "Chandkheda",
      kwh: 540.0,
      co2: 442.8,
      households: 18,
      score: 63,
      societies: ["Tragad Eco Enclave", "ONGC Township Colony"],
    },
  };

  const activeWardInfo = defaultWards[selectedWard] || defaultWards["Satellite"];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-extrabold tracking-tight">
              Interactive AMC Ward Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any ward to inspect live energy conservation and society rankings
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
          Ahmedabad Municipal Corp
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Interactive Map (7 cols) */}
        <div className="md:col-span-7 relative flex items-center justify-center p-2 bg-slate-950/60 rounded-2xl border border-white/5">
          <svg
            viewBox="0 0 500 420"
            className="w-full max-h-[320px] select-none filter drop-shadow-md"
          >
            {/* Background River Sabarmati Curved Ribbon */}
            <path
              d="M 280 10 Q 270 120 295 220 T 260 410"
              fill="none"
              stroke="#0284c7"
              strokeWidth="8"
              strokeOpacity="0.4"
              strokeDasharray="4 2"
            />
            <text x="290" y="50" fill="#38bdf8" fontSize="10" opacity="0.6" fontStyle="italic">
              Sabarmati River
            </text>

            {/* Ward 1: Chandkheda (North) */}
            <g
              onClick={() => {
                setSelectedWard("Chandkheda");
                onSelectWard?.("Chandkheda");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="240,25 350,30 340,95 230,90"
                fill={selectedWard === "Chandkheda" ? "#10b981" : "#065f46"}
                stroke="#34d399"
                strokeWidth={selectedWard === "Chandkheda" ? "3" : "1.2"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="285" y="65" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Chandkheda
              </text>
            </g>

            {/* Ward 2: Naranpura (North Central West) */}
            <g
              onClick={() => {
                setSelectedWard("Naranpura");
                onSelectWard?.("Naranpura");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="180,95 280,98 270,175 170,170"
                fill={selectedWard === "Naranpura" ? "#10b981" : "#047857"}
                stroke="#34d399"
                strokeWidth={selectedWard === "Naranpura" ? "3" : "1.2"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="225" y="140" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Naranpura
              </text>
            </g>

            {/* Ward 3: Navrangpura (Central Commercial) */}
            <g
              onClick={() => {
                setSelectedWard("Navrangpura");
                onSelectWard?.("Navrangpura");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="175,180 270,180 260,260 160,255"
                fill={selectedWard === "Navrangpura" ? "#10b981" : "#059669"}
                stroke="#34d399"
                strokeWidth={selectedWard === "Navrangpura" ? "3" : "1.2"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="215" y="222" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Navrangpura
              </text>
            </g>

            {/* Ward 4: Satellite (South-West Peak Hub) */}
            <g
              onClick={() => {
                setSelectedWard("Satellite");
                onSelectWard?.("Satellite");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="130,265 240,265 225,360 115,350"
                fill={selectedWard === "Satellite" ? "#10b981" : "#059669"}
                stroke="#6ee7b7"
                strokeWidth={selectedWard === "Satellite" ? "3" : "1.5"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="175" y="315" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="black">
                Satellite ★
              </text>
            </g>

            {/* Ward 5: Bopal (West Residential) */}
            <g
              onClick={() => {
                setSelectedWard("Bopal");
                onSelectWard?.("Bopal");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="25,230 120,230 110,335 15,325"
                fill={selectedWard === "Bopal" ? "#10b981" : "#047857"}
                stroke="#34d399"
                strokeWidth={selectedWard === "Bopal" ? "3" : "1.2"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="65" y="285" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Bopal
              </text>
            </g>

            {/* Ward 6: Maninagar (East of River, Kankaria Lake) */}
            <g
              onClick={() => {
                setSelectedWard("Maninagar");
                onSelectWard?.("Maninagar");
              }}
              className="cursor-pointer group"
            >
              <polygon
                points="300,210 420,205 410,330 290,320"
                fill={selectedWard === "Maninagar" ? "#10b981" : "#065f46"}
                stroke="#34d399"
                strokeWidth={selectedWard === "Maninagar" ? "3" : "1.2"}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              <text x="355" y="270" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Maninagar
              </text>
              {/* Lake dot */}
              <circle cx="340" cy="290" r="7" fill="#0284c7" />
              <text x="352" y="294" fill="#7dd3fc" fontSize="8">Kankaria</text>
            </g>
          </svg>
        </div>

        {/* Selected Ward Live Analytics Card (5 cols) */}
        <div className="md:col-span-5 bg-slate-800/80 rounded-2xl p-4 border border-white/10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Selected Municipal Zone
              </span>
              <h4 className="text-xl font-black text-white mt-0.5">
                {activeWardInfo.name} Ward
              </h4>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-1 rounded-xl text-xs border border-emerald-500/30 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Score: {activeWardInfo.score}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>kWh Saved</span>
              </span>
              <div className="text-base font-black text-amber-300 mt-1">
                ⚡ {activeWardInfo.kwh.toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-sky-400" />
                <span>CO₂ Avoided</span>
              </span>
              <div className="text-base font-black text-sky-300 mt-1">
                {activeWardInfo.co2.toFixed(1)} kg
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Participating Societies
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {activeWardInfo.societies.map((soc, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30"
                >
                  {soc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
