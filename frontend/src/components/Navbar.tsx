"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Flame, Shield, Globe, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lifepulse-700 to-lifepulse-500 flex items-center justify-center text-white shadow-sm shadow-lifepulse-700/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">LiFE Pulse</span>
              <span className="text-[10px] font-semibold bg-lifepulse-100 text-lifepulse-800 px-1.5 py-0.5 rounded-full border border-lifepulse-200">
                GEDA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-0.5 font-medium">{t("tagline")}</p>
          </div>
        </Link>

        {/* Right tools: Streak, Lang, Admin toggle */}
        <div className="flex items-center gap-2">
          {/* Day streak badge */}
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/70 px-2 py-1 rounded-full text-xs font-semibold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>7 {t("today.badge_streak")}</span>
          </div>

          {/* Language selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="appearance-none bg-white text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-semibold pl-2 pr-6 py-1 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-lifepulse-500 cursor-pointer shadow-2xs"
            >
              <option value="gu">ગુજરાતી</option>
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>
            <Globe className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Dharohar 4D (IIT Gandhinagar Heritage Digital Twin) */}
          <Link
            href="/dharohar"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-300/80 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
          >
            <span>🏛️ Dharohar 4D</span>
            <span className="text-[9px] bg-amber-800 text-white px-1 rounded-sm font-black">IITGN</span>
          </Link>

          {/* 3D Solar Raytracer */}
          <Link
            href="/solar"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            3D Solar
          </Link>

          {/* AR Appliance Detective */}
          <Link
            href="/detective"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded-lg transition-colors"
          >
            <span className="text-[10px] bg-purple-200/80 px-1 rounded text-purple-900 font-bold">AR</span>
            Detective
          </Link>

          {/* P2P Microgrid */}
          <Link
            href="/microgrid"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors"
          >
            <span className="text-[10px] bg-emerald-200/80 px-1 rounded text-emerald-900 font-bold">P2P</span>
            Microgrid
          </Link>

          {/* Water Tracker Link */}
          <Link
            href="/water"
            className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition-colors"
          >
            Water
          </Link>

          {/* Bill OCR Link */}
          <Link
            href="/bill"
            className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
          >
            Bill OCR
          </Link>

          {/* Certificate Report Link */}
          <Link
            href="/report"
            className="hidden xl:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors"
          >
            Certificate
          </Link>

          {/* Admin toggle */}
          <Link
            href={isAdmin ? "/" : "/admin"}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              isAdmin
                ? "bg-slate-900 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdmin ? "Citizen View" : "GEDA"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
