"use client";

import { useState, useEffect } from "react";
import { api, type HeritageLocus, type LocusCollection } from "@/lib/api";
import { MapPin, ExternalLink, Image as ImageIcon, Info } from "lucide-react";
import Image from "next/image";

export default function CorridorPage() {
  const [loci, setLoci] = useState<HeritageLocus[]>([]);
  const [activeLocus, setActiveLocus] = useState<HeritageLocus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLoci() {
      try {
        const data: LocusCollection = await api.getLoci();
        setLoci(data.features);
        if (data.features.length > 0) {
          setActiveLocus(data.features[0]);
        }
      } catch (error) {
        console.error("Failed to load loci:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLoci();
  }, []);

  const getConditionColor = (condition: string) => {
    if (!condition) return "text-slate-500 bg-slate-500/20";
    
    switch (condition.toLowerCase()) {
      case "excellent":
        return "text-green-500 bg-green-500/20";
      case "good":
        return "text-emerald-500 bg-emerald-500/20";
      case "fair":
        return "text-yellow-500 bg-yellow-500/20";
      case "poor":
        return "text-orange-500 bg-orange-500/20";
      case "critical":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-slate-500 bg-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Map View */}
        <div className="flex-1 relative bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white">Loading heritage corridor...</div>
            </div>
          ) : (
            <div className="p-8">
              {/* Simple Map Grid Representation */}
              <div className="relative h-full bg-slate-800 rounded-xl border border-slate-700 p-8">
                <h3 className="text-white text-xl font-bold mb-4">
                  Gujarat Sacred Hydraulic Corridor
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {loci.map((locus) => {
                    const isActive = activeLocus?.properties.id === locus.properties.id;
                    const lat = locus.properties?.lat ?? locus.geometry?.coordinates?.[1];
                    const lon = locus.properties?.lon ?? locus.geometry?.coordinates?.[0];
                    return (
                      <button
                        key={locus.properties.id}
                        onClick={() => setActiveLocus(locus)}
                        className={`p-4 rounded-lg border transition-all ${
                          isActive
                            ? "bg-heritage-gold text-slate-950 border-heritage-gold"
                            : "bg-slate-700 text-white border-slate-600 hover:border-heritage-sandstone"
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-5 h-5 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-semibold">{locus.properties.name}</div>
                            <div className="text-xs opacity-70">{locus.properties.type} • {locus.properties.district || "Gujarat"}</div>
                          </div>
                        </div>
                        <div className="text-xs opacity-80 font-mono">
                          {lat != null ? lat.toFixed(4) : "—"}°N, {lon != null ? lon.toFixed(4) : "—"}°E
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto">
          {activeLocus ? (
            <div className="p-6">
              {/* Image Gallery */}
              {activeLocus.properties.images && activeLocus.properties.images.length > 0 && (
                <div className="mb-6 relative h-48 bg-slate-800 rounded-lg overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-600" />
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                      {activeLocus.properties.images.length} images
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeLocus.properties.name}
              </h2>

              {/* Type Badge */}
              <div className="inline-block px-3 py-1 bg-heritage-indigo/20 text-heritage-indigo rounded-full text-sm font-medium mb-4">
                {activeLocus.properties.type}
              </div>

              {/* Condition */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-slate-400 text-sm">Status / Condition:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionColor(activeLocus.properties.condition || "good")}`}>
                  {activeLocus.properties.condition || activeLocus.properties.asi_status || "ASI Protected"}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {activeLocus.properties.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Period & Patronage</div>
                  <div className="text-white font-medium">
                    {activeLocus.properties.construction_period || activeLocus.properties.era || "Historical"} • {activeLocus.properties.built_by || activeLocus.properties.dynasty || "Gujarat"}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-xs mb-1">Architectural Dynasty / Style</div>
                  <div className="text-white font-medium">
                    {activeLocus.properties.architectural_style || activeLocus.properties.dynasty || "Maru-Gurjara / Solanki"}
                  </div>
                </div>

                {activeLocus.properties.unesco_status && (
                  <div>
                    <div className="text-slate-400 text-xs mb-1">UNESCO Status</div>
                    <div className="text-heritage-gold font-medium">
                      {activeLocus.properties.unesco_status}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-slate-400 text-xs mb-1">Coordinates</div>
                  <div className="text-white font-mono text-sm">
                    {(activeLocus.properties.lat ?? activeLocus.geometry?.coordinates?.[1])?.toFixed(6) ?? "23.166700"}°N, {(activeLocus.properties.lon ?? activeLocus.geometry?.coordinates?.[0])?.toFixed(6) ?? "72.580000"}°E
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                {activeLocus.properties.links?.twin_url && (
                  <a
                    href={activeLocus.properties.links.twin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-heritage-gold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">View 3D Twin</span>
                  </a>
                )}
                
                {activeLocus.properties.links?.inscription_url && (
                  <a
                    href={activeLocus.properties.links.inscription_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-heritage-bronze"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">View Inscriptions</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-slate-500 text-center">
              Select a heritage site to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
