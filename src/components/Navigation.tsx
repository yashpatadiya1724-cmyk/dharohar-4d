"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Place Explorer 4D" },
  { href: "/twin", label: "3D Twin" },
  { href: "/corridor", label: "Corridor" },
  { href: "/epigrapher", label: "Epigrapher" },
  { href: "/expedition", label: "Expedition" },
  { href: "/studio", label: "Studio" },
  { href: "/monument4d", label: "Monument 4D" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-heritage-gold transition-colors">
            <Landmark className="w-6 h-6" />
            <span className="font-bold text-lg">Dharohar 4D</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-heritage-gold text-slate-950"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
