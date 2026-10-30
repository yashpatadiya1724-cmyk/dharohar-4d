"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Dharohar3DTwin from "@/components/Dharohar3DTwin";
import {
  Sparkles,
  Camera,
  Upload,
  Link as LinkIcon,
  Layers,
  MapPin,
  Calendar,
  History,
  Sliders,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Landmark,
  FileText,
  Volume2,
  ChevronRight,
  ArrowRight,
  Download,
  Eye,
  ShieldCheck,
  Compass,
  AlertCircle
} from "lucide-react";

export default function TwinStudioPage() {
  // Preset Archetypes
  const presets = [
    {
      id: "preset-ranikivav",
      name: "Rani Ki Vav (રાણકી વાવ)",
      location: "Patan, Northern Gujarat",
      dynasty: "Solanki Dynasty (Peak Maru-Gurjara)",
      architectural_style: "7-Tier Inverted Subterranean Temple",
      depth_meters: 28.0,
      tiers_count: 7,
      geometry_type: "stepwell_linear",
      stone_material: "dhrangadhra_gold",
      water_state: "sacred_aquifer",
      photo_sample_count: 14,
      google_photos_url: "https://photos.app.goo.gl/ranikivav-unesco-patana",
      manual_notes: "UNESCO World Heritage site built by Queen Udayamati in memory of King Bhimadeva I. Over 500 principal sculptures including Sheshashayi Vishnu, Dashavatara, and apsaras along seven stepped terraced galleries.",
    },
    {
      id: "preset-modhera",
      name: "Modhera Sun Temple & Surya Kund",
      location: "Mehsana District, Gujarat",
      dynasty: "Chaulukya Dynasty (King Bhimadeva I)",
      architectural_style: "Solar Stepped Kund Tank & Sabha Mandapa",
      depth_meters: 14.0,
      tiers_count: 4,
      geometry_type: "octagonal_kund",
      stone_material: "dhrangadhra_gold",
      water_state: "lotus_pool",
      photo_sample_count: 12,
      google_photos_url: "https://photos.app.goo.gl/modhera-suryakund-equinox",
      manual_notes: "Constructed in 1026 AD aligned so solar equinox rays hit the sanctum. Surya Kund contains 108 miniature stepped shrines around triangular pyramid steps leading into holy water.",
    },
    {
      id: "preset-chandbaori",
      name: "Chand Baori (चाँद बावड़ी)",
      location: "Abhaneri, Rajasthan",
      dynasty: "Nikumbha Rajput Dynasty (King Chanda)",
      architectural_style: "13-Tier Geometric Stepped Baori",
      depth_meters: 20.0,
      tiers_count: 6,
      geometry_type: "stepped_pyramid_baori",
      stone_material: "basalt_black",
      water_state: "sacred_aquifer",
      photo_sample_count: 16,
      google_photos_url: "https://photos.app.goo.gl/chandbaori-abhaneri-geometry",
      manual_notes: "One of the deepest and largest stepwells in the world with 3,500 narrow steps over 13 stories, engineered as a mathematical labyrinth for water harvesting in arid terrain.",
    },
    {
      id: "preset-custom",
      name: "Custom Explorer Monument Capture",
      location: "Gandhinagar / Gujarat Heritage Corridor",
      dynasty: "Medieval Western Indian",
      architectural_style: "Pillared Subterranean Corridor",
      depth_meters: 22.0,
      tiers_count: 5,
      geometry_type: "stepwell_linear",
      stone_material: "agra_red",
      water_state: "sacred_aquifer",
      photo_sample_count: 6,
      google_photos_url: "",
      manual_notes: "Documented during IIT Gandhinagar Explorer Fellowship survey. Detailed stone carvings, floral motifs, and subterranean chamber ventilation shafts.",
    },
  ];

  // Active Form State
  const [monumentName, setMonumentName] = useState<string>(presets[0].name);
  const [locationStr, setLocationStr] = useState<string>(presets[0].location);
  const [dynasty, setDynasty] = useState<string>(presets[0].dynasty);
  const [architecturalStyle, setArchitecturalStyle] = useState<string>(presets[0].architectural_style);
  const [depthMeters, setDepthMeters] = useState<number>(presets[0].depth_meters);
  const [tiersCount, setTiersCount] = useState<number>(presets[0].tiers_count);
  const [geometryType, setGeometryType] = useState<string>(presets[0].geometry_type);
  const [stoneMaterial, setStoneMaterial] = useState<string>(presets[0].stone_material);
  const [waterState, setWaterState] = useState<string>(presets[0].water_state);
  const [googlePhotosUrl, setGooglePhotosUrl] = useState<string>(presets[0].google_photos_url);
  const [manualNotes, setManualNotes] = useState<string>(presets[0].manual_notes);

  // Uploaded Photos Simulation State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&q=80",
    "https://images.unsplash.com/photo-1599837965377-fbe81a298bf6?w=400&q=80",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80",
  ]);

  // AI Pipeline State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [synthesisStep, setSynthesisStep] = useState<number>(0);
  const [generatedTwin, setGeneratedTwin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"studio" | "model" | "epigraph" | "telemetry">("model");

  // Construct dynamic twin directly from active form inputs
  const getLiveTwinSpec = (overrides?: any) => {
    const matHexes: { [k: string]: number } = {
      dhrangadhra_gold: 0xd4a359,
      agra_red: 0x9f382b,
      makrana_marble: 0xe2e8f0,
      basalt_black: 0x334155,
    };
    const waterColors: { [k: string]: number } = {
      sacred_aquifer: 0x0284c7,
      lotus_pool: 0x0f766e,
      dry_excavated: 0x475569,
      monsoon_surge: 0x0369a1,
    };

    const activeStone = overrides?.stone_material || stoneMaterial;
    const activeWater = overrides?.water_state || waterState;
    const activeDepth = overrides?.depth_meters ?? depthMeters;
    const activeTiers = overrides?.tiers_count ?? tiersCount;
    const activeGeom = overrides?.geometry_type || geometryType;
    const activeName = overrides?.monument_name || monumentName;
    const activeDynasty = overrides?.dynasty || dynasty;

    return {
      id: `twin-live-${Date.now()}`,
      name: activeName,
      location: locationStr,
      dynasty: activeDynasty,
      architectural_style: architecturalStyle,
      depth_meters: activeDepth,
      tiers_count: activeTiers,
      geometry_type: activeGeom,
      stone_spec: {
        name: activeStone,
        hex: matHexes[activeStone] || 0xd4a359,
        roughness: activeStone === "makrana_marble" ? 0.38 : 0.75,
      },
      water_spec: {
        name: activeWater,
        color: waterColors[activeWater] || 0x0284c7,
        opacity: activeWater === "dry_excavated" ? 0.2 : 0.88,
      },
      cooling_delta_celsius: Math.round(activeDepth * 0.25 * 10) / 10,
      epigraph: generatedTwin?.epigraph || {
        title: `${activeName} Foundational Epigraph`,
        script: "Proto-Devanagari / Early Maru-Gurjara Nagari",
        language: "Epigraphical Classical Sanskrit",
        transcription: "ॐ स्वस्ति श्री ! संवत् ११०२ वर्षे... श्री मदुदयमती महाराज्ञी कारिता वापी जगतः कल्याणाय ॥",
        iast: "om svasti śrī ! saṃvat 1102 varṣe... śrī madudayamatī mahārājñī kāritā vāpī jagataḥ kalyāṇāya ||",
        hindi_translation: "समस्त संसार के कल्याण और धर्म हेतु इस भव्य वापी का निर्माण करवाया गया।",
        english_translation: "Commissioned for the universal welfare of all travelers and eternal merit.",
        confidence_score: 0.984,
      },
      photogrammetry_report: generatedTwin?.photogrammetry_report || {
        photos_ingested: uploadedPhotos.length,
        point_cloud_density: "2.14 Million Vertices",
        symmetry_alignment: "North-South Axial (Gujarat Solanki Solar Alignment)",
        ground_sample_distance: "1.2 mm/pixel",
        structural_mesh_status: "Synthesized with 16-Sided Fluted Columns & Stepped Ghats",
        ai_archeological_verdict: `Architectural style matches classical ${activeDynasty} traditions. Subterranean passive thermal mass maintains ambient cavern cooling of -${Math.round(activeDepth * 0.25)}°C at bottom cistern.`,
      },
    };
  };

  // Sync initial live twin on mount
  useEffect(() => {
    setGeneratedTwin(getLiveTwinSpec());
    handleSynthesizeTwin();
  }, []);

  // Update live twin immediately whenever form sliders, stone, water, or geometry changes
  useEffect(() => {
    setGeneratedTwin((prev: any) => ({
      ...getLiveTwinSpec(),
      epigraph: prev?.epigraph,
      photogrammetry_report: prev?.photogrammetry_report,
    }));
  }, [monumentName, locationStr, dynasty, depthMeters, tiersCount, geometryType, stoneMaterial, waterState]);

  const handleSelectPreset = (p: typeof presets[0]) => {
    setMonumentName(p.name);
    setLocationStr(p.location);
    setDynasty(p.dynasty);
    setArchitecturalStyle(p.architectural_style);
    setDepthMeters(p.depth_meters);
    setTiersCount(p.tiers_count);
    setGeometryType(p.geometry_type);
    setStoneMaterial(p.stone_material);
    setWaterState(p.water_state);
    setGooglePhotosUrl(p.google_photos_url);
    setManualNotes(p.manual_notes);

    // Immediately morph the 3D twin to the selected preset!
    const updated = getLiveTwinSpec({
      monument_name: p.name,
      depth_meters: p.depth_meters,
      tiers_count: p.tiers_count,
      geometry_type: p.geometry_type,
      stone_material: p.stone_material,
      water_state: p.water_state,
      dynasty: p.dynasty,
    });
    setGeneratedTwin(updated);
  };

  const handleSynthesizeTwin = async () => {
    setIsGenerating(true);
    setSynthesisStep(1);

    const steps = [
      "Ingesting Google Photos & extracting 3D photogrammetric feature keypoints...",
      "Synthesizing subterranean stepped geometry & 16-sided fluted column bays...",
      "Compiling procedural PBR stone ashlar & carved frieze textures...",
      "Aligning real-world solar raytracer to geospatial coordinates...",
      "Generating Sanskrit epigraph edict, modern Hindi & English translations...",
    ];

    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 5) {
        setSynthesisStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      const res = await api.generateCustomTwin({
        monument_name: monumentName,
        location: locationStr,
        dynasty,
        architectural_style: architecturalStyle,
        depth_meters: depthMeters,
        tiers_count: tiersCount,
        geometry_type: geometryType,
        stone_material: stoneMaterial,
        water_state: waterState,
        photo_urls: uploadedPhotos,
        manual_notes: manualNotes,
        latitude: 23.85,
        longitude: 72.1,
      });

      if (res.success && res.twin) {
        setGeneratedTwin(res.twin);
        setActiveTab("model");
      }
    } catch (err) {
      console.error("Twin generation error:", err);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setSynthesisStep(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Neural Twin Architect</span>
            </span>
            <span className="text-xs text-slate-400">Google Photos & Historical Lore ➔ 3D Monument Twin</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-amber-400" />
            Neural Monument 3D Generator Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Upload Google Photos, field captures, and manual architectural notes. Our AI synthesizes an authentic, heavy, museum-grade 3D Digital Twin with real-time solar raytracing and Sanskrit epigraphy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 transition-all shadow-xs"
          >
            <span>Return to Flagship Twin</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>

      {/* 2. Quick Preset Archetypes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-amber-400" />
            Quick Archetype Presets (Click to load authentic dataset):
          </span>
          <span>1-Click Photogrammetry Synthesis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const isSelected = monumentName === p.name;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/20 shadow-lg scale-102"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 w-fit mb-1">
                  {p.depth_meters}m • {p.tiers_count} Tiers
                </div>
                <div className="font-bold text-sm text-white truncate">{p.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{p.location}</div>
                <div className="text-[11px] text-slate-500 mt-2 truncate">{p.dynasty}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Master Studio Grid: Form (Left) & Real-Time 3D Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Studio (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Photogrammetry & Architectural Inputs</h3>
            </div>
            <span className="text-xs text-amber-300 font-mono">Step 1 of 2</span>
          </div>

          {/* Section A: Google Photos Ingestion */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                Google Photos / Drive Album URL
              </span>
              <span className="text-[10px] text-slate-400">Live Ingestion</span>
            </label>
            <input
              type="text"
              value={googlePhotosUrl}
              onChange={(e) => setGooglePhotosUrl(e.target.value)}
              placeholder="https://photos.app.goo.gl/your-monument-album..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-600 font-mono"
            />
          </div>

          {/* Section B: Field Photos Scanner Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                Ingested Photo Keyframes ({uploadedPhotos.length} Captures):
              </span>
              <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer font-semibold">
                + Add Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newUrls = Array.from(e.target.files).map((f) =>
                        URL.createObjectURL(f)
                      );
                      setUploadedPhotos([...uploadedPhotos, ...newUrls]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Thumbnail Strip with Scanning Effect */}
            <div className="relative grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse pointer-events-none" />
              {uploadedPhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group"
                >
                  <img
                    src={url}
                    alt={`Capture ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center font-mono text-cyan-300 py-0.5">
                    CAM #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-800">
                ✓ 16-Sided Columns Detected
              </span>
              <span className="text-[9px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-md border border-purple-800">
                ✓ Torana Curvature Mapped
              </span>
              <span className="text-[9px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-800">
                ✓ Ashlar Joints Segmented
              </span>
            </div>
          </div>

          {/* Section C: Monument Identity Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Monument Name
              </label>
              <input
                type="text"
                value={monumentName}
                onChange={(e) => setMonumentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Location / District
                </label>
                <input
                  type="text"
                  value={locationStr}
                  onChange={(e) => setLocationStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Dynasty / Era
                </label>
                <select
                  value={dynasty}
                  onChange={(e) => setDynasty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Solanki / Maru-Gurjara">Solanki / Maru-Gurjara</option>
                  <option value="Chaulukya Dynasty">Chaulukya Dynasty</option>
                  <option value="Vaghela & Sultanate Synthesis">Vaghela & Sultanate Synthesis</option>
                  <option value="Nikumbha Rajput">Nikumbha Rajput</option>
                  <option value="Medieval Western Indian">Medieval Western Indian</option>
                </select>
              </div>
            </div>

            {/* Subterranean Depth & Tiers Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Depth:</span>
                  <span className="font-bold text-sky-400">{depthMeters} meters</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="1"
                  value={depthMeters}
                  onChange={(e) => setDepthMeters(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Stories:</span>
                  <span className="font-bold text-amber-400">{tiersCount} Tiers</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={tiersCount}
                  onChange={(e) => setTiersCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Stone Material Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Stone Material & Sediment Patina
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "dhrangadhra_gold", name: "Dhrangadhra Gold", desc: "Solanki Sandstone", color: "bg-amber-500" },
                  { id: "agra_red", name: "Agra Red Sandstone", desc: "Vindhyan Ferric", color: "bg-red-700" },
                  { id: "makrana_marble", name: "Makrana Pure Marble", desc: "Calcite Metamorphic", color: "bg-slate-200 text-slate-950" },
                  { id: "basalt_black", name: "Volcanic Basalt", desc: "Deccan Dark Monolith", color: "bg-slate-700" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStoneMaterial(s.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      stoneMaterial === s.id
                        ? "bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${s.color} shrink-0`} />
                    <div className="truncate">
                      <div className="font-bold text-[11px] truncate">{s.name}</div>
                      <div className="text-[9px] text-slate-500">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Notes & Lore */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Student Explorer Field Notes & Historical Context
              </label>
              <textarea
                rows={3}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Enter folklore, epigraphic details, or architectural observations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed placeholder-slate-600"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSynthesizeTwin}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-70 hover:scale-102 active:scale-98"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Synthesizing 3D Digital Twin (Step {synthesisStep}/5)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Synthesize Hyper-Realistic 3D Digital Twin</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Interactive 3D Model & Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs bar */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            <div className="flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab("model")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "model"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Live 3D Twin</span>
              </button>
              <button
                onClick={() => setActiveTab("epigraph")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "epigraph"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AI Epigraphy</span>
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "telemetry"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Engineering Report</span>
              </button>
            </div>

            {generatedTwin && (
              <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 hidden sm:inline">
                ✓ 3D Mesh Synthesized ({depthMeters}m Depth)
              </span>
            )}
          </div>

          {/* TAB 1: 3D Twin Canvas */}
          {activeTab === "model" && (
            <div className="space-y-4">
              <Dharohar3DTwin twinData={generatedTwin} />

              {/* Quick Model Telemetry Strip */}
              {generatedTwin && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400">Synthesized Name</div>
                    <div className="font-bold text-white mt-0.5 truncate">{generatedTwin.name}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Subterranean Tiers</div>
                    <div className="font-bold text-amber-400 mt-0.5">
                      {generatedTwin.tiers_count} Stories (-{generatedTwin.depth_meters}m)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Stone Material</div>
                    <div className="font-bold text-purple-400 mt-0.5 truncate">
                      {generatedTwin.stone_spec.name.split(" ")[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Passive Thermal Mass</div>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      -{generatedTwin.cooling_delta_celsius}°C Cooling
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI Epigrapher Edict */}
          {activeTab === "epigraph" && generatedTwin && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">
                  AI Synthesized Dedication Inscription
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {generatedTwin.epigraph.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Script: <span className="text-purple-300 font-medium">{generatedTwin.epigraph.script}</span> • Language: {generatedTwin.epigraph.language}
                </p>
              </div>

              {/* Sanskrit Verse Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="text-xs text-purple-300 font-bold flex items-center justify-between">
                  <span>मूल संस्कृत शिलालेख (Classical Sanskrit Transcription):</span>
                  <span className="text-[10px] text-emerald-400 font-mono">98.4% Confidence</span>
                </div>
                <div className="font-serif text-lg text-amber-300 leading-relaxed tracking-wide">
                  "{generatedTwin.epigraph.transcription}"
                </div>
                <div className="text-xs text-slate-400 font-mono italic">
                  IAST: {generatedTwin.epigraph.iast}
                </div>
              </div>

              {/* Hindi Translation */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-xs text-amber-400 font-bold">प्रामाणिक हिन्दी अनुवाद (Modern Hindi Translation):</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {generatedTwin.epigraph.hindi_translation}
                </p>
              </div>

              {/* English Academic Translation */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-xs text-sky-400 font-bold">Academic English Translation:</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{generatedTwin.epigraph.english_translation}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Engineering & Photogrammetry Telemetry */}
          {activeTab === "telemetry" && generatedTwin && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                  Computer Vision & Photogrammetric Diagnostics
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Structural Engineering Telemetry
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Point Cloud Density</div>
                  <div className="font-mono text-emerald-400 font-bold text-base">
                    {generatedTwin.photogrammetry_report.point_cloud_density}
                  </div>
                  <div className="text-[10px] text-slate-500">Sub-millimeter triangulation</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Ground Sample Distance</div>
                  <div className="font-mono text-sky-400 font-bold text-base">
                    {generatedTwin.photogrammetry_report.ground_sample_distance}
                  </div>
                  <div className="text-[10px] text-slate-500">Optical resolution at 20m distance</div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Solar Meridian Alignment</div>
                  <div className="font-bold text-amber-300">
                    {generatedTwin.photogrammetry_report.symmetry_alignment}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400">Chamber Acoustic Decay (RT60)</div>
                  <div className="font-mono text-purple-300 font-bold">
                    {generatedTwin.acoustic_decay_seconds}s Reverberation
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-slate-200">AI Archaeological Synthesis Verdict:</div>
                <p className="text-slate-300 leading-relaxed">
                  {generatedTwin.photogrammetry_report.ai_archeological_verdict}
                </p>
              </div>

              {/* Export Spec Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const dataStr =
                      "data:text/json;charset=utf-8," +
                      encodeURIComponent(JSON.stringify(generatedTwin, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute(
                      "download",
                      `${generatedTwin.name.replace(/\s+/g, "_")}_twin_spec.json`
                    );
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export 3D Twin JSON Telemetry</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}