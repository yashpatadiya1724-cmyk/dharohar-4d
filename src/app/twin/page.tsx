"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { api, type HeritageEpoch, type StepwellData } from "@/lib/api";
import { Clock, Calendar, Sun, Eye, Landmark, Compass, Volume2 } from "lucide-react";

const VFXEngine = dynamic(() => import("@/components/3d/VFXEngine"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-4 border-heritage-gold border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-heritage-gold font-bold text-base">Loading Dharohar 4D VFX Twin...</div>
      <div className="text-slate-400 text-xs mt-1">Generating Solanki Ashlar PBR Geometry & Shaders</div>
    </div>
  ),
});

const HERITAGE_ARCHETYPES = [
  { id: "stepwell_linear", name: "Rani Ki Vav / Adalaj", sub: "Subterranean 7-Tier Stepwell", loc: "Patan / Gandhinagar, Gujarat" },
  { id: "kund_stepped", name: "Surya Kund, Modhera", sub: "Pyramidal Stepped Tank (108 Shrines)", loc: "Mehsana, Gujarat" },
  { id: "monolithic_rockcut", name: "Kailasa Temple (Ellora)", sub: "Monolithic Rock-Cut Temple", loc: "Ellora Caves, Maharashtra" },
  { id: "nagara_shikhara", name: "Somnath Temple", sub: "Curvilinear Rekha-Nagara Shikhara", loc: "Prabhas Patan, Gujarat" },
  { id: "chariot_mandapa", name: "Konark / Hampi Chariot", sub: "Stone Carved Temple Chariot", loc: "Konark / Hampi" },
  { id: "himalayan_shikhara", name: "Kedarnath Temple", sub: "Alpine Stone & Slate Gables", loc: "Rudraprayag, Uttarakhand" },
  { id: "stepped_pyramid_baori", name: "Chand Baori", sub: "13-Story Interlocking Stepped Well", loc: "Abhaneri, Rajasthan" },
  { id: "temple_mandapa", name: "Rudra Mahalaya", sub: "Solanki Pillared Hall & Torana", loc: "Siddhpur, Gujarat" },
];

function TwinContent() {
  const searchParams = useSearchParams();
  const siteParam = searchParams.get("site") || "";

  const [stepwellData, setStepwellData] = useState<StepwellData | null>(null);
  const [epochs, setEpochs] = useState<HeritageEpoch[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [archetype, setArchetype] = useState<string>("stepwell_linear");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customLoc, setCustomLoc] = useState<string>("");
  const [viewPreset, setViewPreset] = useState<"overview" | "gallery" | "shaft" | "water">("overview");
  const [loading, setLoading] = useState(true);

  // Sync archetype with siteParam from URL
  useEffect(() => {
    if (!siteParam) return;
    const s = siteParam.toLowerCase();

    if (s.includes("kailasa") || s.includes("ellora") || s.includes("rockcut")) {
      setArchetype("monolithic_rockcut");
      setCustomTitle("Kailasa Temple (Ellora Cave 16)");
      setCustomLoc("Ellora, Maharashtra • Rashtrakuta Dynasty");
    } else if (s.includes("somnath")) {
      setArchetype("nagara_shikhara");
      setCustomTitle("Somnath Temple");
      setCustomLoc("Prabhas Patan, Veraval, Gujarat");
    } else if (s.includes("modhera") || s.includes("surya") || s.includes("kund")) {
      setArchetype("kund_stepped");
      setCustomTitle("Modhera Sun Temple & Surya Kund");
      setCustomLoc("Mehsana District, Gujarat (1026 AD)");
    } else if (s.includes("kedarnath") || s.includes("badrinath") || s.includes("himalayan")) {
      setArchetype("himalayan_shikhara");
      setCustomTitle("Kedarnath Temple");
      setCustomLoc("Garhwal Himalayas, Uttarakhand");
    } else if (s.includes("konark") || s.includes("hampi") || s.includes("chariot")) {
      setArchetype("chariot_mandapa");
      setCustomTitle("Konark Sun Temple / Hampi Chariot");
      setCustomLoc("Eastern Ganga / Vijayanagara Empire");
    } else if (s.includes("chand") || s.includes("baori")) {
      setArchetype("stepped_pyramid_baori");
      setCustomTitle("Chand Baori");
      setCustomLoc("Abhaneri, Rajasthan • 9th Century AD");
    } else if (s.includes("rudra") || s.includes("mandapa") || s.includes("siddhpur")) {
      setArchetype("temple_mandapa");
      setCustomTitle("Rudra Mahalaya");
      setCustomLoc("Siddhpur, Patan District, Gujarat");
    } else if (s.includes("rani")) {
      setArchetype("stepwell_linear");
      setCustomTitle("Rani Ki Vav (રાણકી વાવ)");
      setCustomLoc("Patan, Gujarat (UNESCO World Heritage Site)");
    } else if (s.includes("adalaj")) {
      setArchetype("stepwell_linear");
      setCustomTitle("Adalaj Ni Vav (અડાલજની વાવ)");
      setCustomLoc("Gandhinagar District, Gujarat (1498 AD)");
    }
  }, [siteParam]);

  useEffect(() => {
    async function loadData() {
      try {
        const [metadata, epochsData] = await Promise.all([
          api.getStepwellMetadata(),
          api.getStepwellEpochs(),
        ]);
        setStepwellData(metadata);
        setEpochs(epochsData);
      } catch (error) {
        console.error("Failed to load stepwell data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentEpochData = epochs[currentEpoch];

  // Solar telemetry calculation
  const solarElevation = Math.max(0, Math.sin(((timeOfDay - 6) / 12) * Math.PI) * 78).toFixed(1);
  const litTier = timeOfDay >= 11 && timeOfDay <= 13 ? 5 : timeOfDay >= 9 && timeOfDay <= 15 ? 3 : 1;
  const rt60Acoustics = (2.4 + (currentEpoch === 2 ? -0.6 : currentEpoch === 0 ? 0.3 : 0.0)).toFixed(2);

  // Active archetype item
  const activeArchObj = HERITAGE_ARCHETYPES.find((a) => a.id === archetype) || HERITAGE_ARCHETYPES[0];
  const activeTitle = customTitle || activeArchObj.name;
  const activeLoc = customLoc || activeArchObj.loc;

  return (
    <div className="pt-16 h-screen flex flex-col lg:flex-row overflow-hidden w-full">
      {/* 3D Viewport - Takes dominant width */}
      <div className="flex-1 h-full min-w-0 relative bg-slate-950 overflow-hidden">
        <VFXEngine
          epoch={currentEpoch}
          timeOfDay={timeOfDay}
          archetype={archetype as any}
          viewPreset={viewPreset}
        />

        {/* Top Left Floating Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-700/80 max-w-xs shadow-2xl z-10 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              Dharohar 4D Active Twin
            </span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            {activeTitle}
          </h2>
          <p className="text-slate-400 text-[11px] mt-1 leading-snug">
            📍 {activeLoc}
          </p>

          {/* Quick 4D Acoustic & Solar Telemetry */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-heritage-gold flex-shrink-0" />
              <span>Elev: <b className="text-white font-mono">{solarElevation}°</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>RT60: <b className="text-white font-mono">{rt60Acoustics}s</b></span>
            </div>
          </div>
        </div>

        {/* Bottom Centered Camera Presets Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-2xl z-10">
          <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Eye className="w-3 h-3 text-heritage-gold" /> Camera:
          </span>
          {[
            { id: "overview", label: "Overview" },
            { id: "gallery", label: "Pavilion 1" },
            { id: "shaft", label: "Well Shaft" },
            { id: "water", label: "Water Level" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setViewPreset(p.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                viewPreset === p.id
                  ? "bg-heritage-gold text-slate-950 shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right 4D Control Panel */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto h-full z-20 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-heritage-gold" />
            4D Engine Controls
          </h3>
          <span className="text-[10px] bg-heritage-gold/20 text-heritage-gold px-2 py-0.5 rounded-full font-mono font-bold border border-heritage-gold/30">
            VFX PBR
          </span>
        </div>

        {/* Heritage Archetype Selector (8 options) */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Heritage Archetype ({HERITAGE_ARCHETYPES.length})
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {HERITAGE_ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                onClick={() => {
                  setArchetype(arch.id);
                  setCustomTitle(arch.name);
                  setCustomLoc(arch.loc);
                }}
                className={`p-2 rounded-xl text-left transition-all border ${
                  archetype === arch.id
                    ? "bg-heritage-gold/15 border-heritage-gold text-white font-medium"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="text-xs font-bold text-white">{arch.name}</div>
                <div className="text-[10px] text-slate-400">{arch.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Solar Time Slider */}
        <div className="mb-5 bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-heritage-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Solar Time: {timeOfDay}:00
              </span>
            </div>
            <span className="text-[11px] font-mono text-heritage-gold font-bold">
              Lit Tier {litTier}/5
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="18"
            step="1"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>6 AM (Dawn)</span>
            <span>12 PM (Noon)</span>
            <span>6 PM (Dusk)</span>
          </div>
        </div>

        {/* 4D Historical Epoch Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-heritage-bronze" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Historical 4D Epoch
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {epochs.length} Epochs
            </span>
          </div>

          {loading ? (
            <div className="text-slate-500 text-xs py-3 text-center">Loading epochs from backend...</div>
          ) : (
            <div className="space-y-2">
              {epochs.map((epoch, index) => {
                const isSelected = currentEpoch === index;
                const label = epoch.label || epoch.era_label || `${epoch.year} CE Era`;
                const dynasty = epoch.dynasty || "Solanki / Chaulukya";

                return (
                  <button
                    key={epoch.year}
                    onClick={() => setCurrentEpoch(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? "bg-heritage-gold text-slate-950 font-bold border-heritage-gold shadow-lg"
                        : "bg-slate-800/70 text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-sm">{epoch.year} CE</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? "bg-slate-950/20 text-slate-950" : "bg-slate-700 text-slate-300"
                      }`}>
                        {label}
                      </span>
                    </div>
                    <div className={`text-[11px] line-clamp-1 font-medium ${isSelected ? "text-slate-900" : "text-slate-400"}`}>
                      {dynasty} • {epoch.description?.slice(0, 50)}...
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Epoch Details Card */}
        {currentEpochData && (
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/70 mb-4">
            <h4 className="text-white font-bold mb-2 flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-heritage-gold" />
              {currentEpochData.year} CE Architectural State
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              {currentEpochData.description || "Detailed subterranean stone masonry with Solanki decorative motifs."}
            </p>

            {currentEpochData.materials && (
              <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-[10px]">
                <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">Patina</span>
                  <span className="text-white font-bold font-mono">
                    {((currentEpochData.materials.patina || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">Silt</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {((currentEpochData.materials.silt || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-center">
                  <span className="text-slate-400 block">Water</span>
                  <span className="text-cyan-400 font-bold font-mono">
                    {((currentEpochData.water?.level || 0.8) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div>🖱️ <b>Rotate</b>: Left Click + Drag</div>
          <div>✋ <b>Pan</b>: Right Click + Drag</div>
          <div>🔍 <b>Zoom</b>: Scroll Wheel</div>
        </div>
      </div>
    </div>
  );
}

export default function TwinPage() {
  return (
    <div className="h-screen w-full bg-slate-950 pt-16 overflow-hidden">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-heritage-gold font-bold">
          Loading 4D Digital Twin...
        </div>
      }>
        <TwinContent />
      </Suspense>
    </div>
  );
}
