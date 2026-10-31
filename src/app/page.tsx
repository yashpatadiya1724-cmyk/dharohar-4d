"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Landmark, Map, FileText, Route, Box, Clock } from "lucide-react";

const features = [
  {
    icon: Box,
    title: "3D Digital Twin",
    description: "VFX-grade procedural reconstruction of Adalaj Stepwell with solar tracking",
    href: "/twin",
    color: "from-heritage-gold to-heritage-bronze",
  },
  {
    icon: Map,
    title: "Heritage Corridor",
    description: "Interactive GIS explorer for Gujarat's sacred hydraulic sites",
    href: "/corridor",
    color: "from-heritage-jade to-heritage-indigo",
  },
  {
    icon: FileText,
    title: "AI Epigrapher",
    description: "ML-powered inscription analysis with TEI-XML export",
    href: "/epigrapher",
    color: "from-heritage-terracotta to-heritage-sandstone",
  },
  {
    icon: Route,
    title: "Field Expeditions",
    description: "NLP journal ingestion with automated route mapping",
    href: "/expedition",
    color: "from-heritage-indigo to-heritage-jade",
  },
  {
    icon: Landmark,
    title: "Twin Studio",
    description: "Procedural 3D twin generator with research job queue",
    href: "/studio",
    color: "from-heritage-bronze to-heritage-gold",
  },
  {
    icon: Clock,
    title: "Monument 4D",
    description: "Multi-epoch condition tracking and structural evidence catalog",
    href: "/monument4d",
    color: "from-heritage-sandstone to-heritage-terracotta",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-heritage-gold via-heritage-sandstone to-heritage-bronze bg-clip-text text-transparent">
            Dharohar 4D
          </h1>
          <p className="text-2xl text-slate-300 mb-4">
            Heritage Digital Twin Platform
          </p>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Explore Gujarat's sacred hydraulic heritage through time with procedural 3D reconstruction,
            AI-powered epigraphy, solar azimuth tracking, and GIS expedition mapping
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group relative h-full p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm">
                    {feature.description}
                  </p>
                  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-heritage-gold text-sm">Explore →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-slate-900/30 border border-slate-800 rounded-xl p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Built with Modern Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">⚛️</div>
              <p className="text-slate-300 font-medium">Next.js 14</p>
              <p className="text-slate-500 text-sm">React Framework</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎨</div>
              <p className="text-slate-300 font-medium">Three.js</p>
              <p className="text-slate-500 text-sm">3D Graphics</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-slate-300 font-medium">FastAPI</p>
              <p className="text-slate-500 text-sm">Python Backend</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-slate-300 font-medium">ML Pipeline</p>
              <p className="text-slate-500 text-sm">AI Analysis</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
