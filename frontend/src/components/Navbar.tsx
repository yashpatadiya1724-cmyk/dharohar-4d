"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Landmark, FileText, Compass, Sparkles, Globe, MapPin, Volume2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  const navLinks = [
    { label: "3D Digital Twin", href: "/", icon: Landmark },
    { label: "AI Epigrapher", href: "/epigrapher", icon: FileText },
    { label: "Expedition GIS", href: "/expedition", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 px-4 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform text-xl font-bold">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Dharohar 4D</span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                IIT Gandhinagar
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">
              Blithchron '27 Heritage Revitalisation Engine (HC26-CULT01)
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/" || pathname === "/dharohar" || pathname === "/twin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="appearance-none bg-slate-900 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Explorer Fellowship Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-purple-950/80 border border-purple-800/80 text-purple-300 px-3 py-1 rounded-xl text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Explorer Lab</span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
