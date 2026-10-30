"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, FileText, Compass, Layers } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "3D Twin", href: "/", icon: Landmark },
    { label: "AI Epigrapher", href: "/epigrapher", icon: FileText },
    { label: "Expedition GIS", href: "/expedition", icon: Compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/dharohar" || pathname === "/twin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-amber-500/20 text-amber-400" : "bg-transparent"
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNav;
