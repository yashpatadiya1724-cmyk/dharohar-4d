"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Home,
  CheckCircle2,
  Zap,
  Sun,
  Sliders,
  Users2,
  Bot
} from "lucide-react";

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Hide bottom nav on admin routes
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { label: t("nav.today"), href: "/", icon: Home },
    { label: t("nav.actions"), href: "/actions", icon: CheckCircle2 },
    { label: t("nav.peak"), href: "/peak", icon: Zap },
    { label: t("nav.solar"), href: "/solar", icon: Sun },
    { label: t("nav.simulate"), href: "/simulate", icon: Sliders },
    { label: t("nav.community"), href: "/community", icon: Users2 },
    { label: t("nav.coach"), href: "/coach", icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200/90 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? "text-lifepulse-700 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? "bg-lifepulse-100" : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-lifepulse-700 stroke-[2.3]" : ""}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
