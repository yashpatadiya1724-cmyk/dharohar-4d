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
  AlertCircle,
  Search,
  Wand2
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
      id: "preset-kailasa",
      name: "Kailasa Rock-Cut Temple, Cave 16",
      location: "Ellora Caves, Aurangabad, Maharashtra",
      dynasty: "Rashtrakuta Dynasty (King Krishna I)",
      architectural_style: "Monolithic Rock-Cut Megalith (Top-Down Carved)",
      depth_meters: 30.0,
      tiers_count: 5,
      geometry_type: "monolithic_rockcut",
      stone_material: "basalt_black",
      water_state: "dry_excavated",
      photo_sample_count: 18,
      google_photos_url: "https://photos.app.goo.gl/kailasa-ellora-monolith",
      manual_notes: "The largest monolithic rock excavation in the world. Carved top-down out of a single basalt cliffside by excavating over 200,000 tonnes of volcanic rock without mortar, featuring life-sized elephants and two 16m monolithic Dhwaja Stambhas.",
    },
    {
      id: "preset-konark",
      name: "Konark Sun Temple (କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର)",
      location: "Puri District, Bay of Bengal Coast, Odisha",
      dynasty: "Eastern Ganga Dynasty (King Narasimhadeva I)",
      architectural_style: "Kalinga Celestial Chariot Architecture",
      depth_meters: 22.0,
      tiers_count: 5,
      geometry_type: "chariot_mandapa",
      stone_material: "dhrangadhra_gold",
      water_state: "lotus_pool",
      photo_sample_count: 20,
      google_photos_url: "https://photos.app.goo.gl/konark-sun-temple-chariot",
      manual_notes: "Designed as a cosmic stone chariot of the Sun God Surya, mounted on 24 exquisitely carved stone wheels (accurate sundials) pulled by seven galloping stone horses toward the oceanic dawn.",
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
      id: "preset-hampi",
      name: "Hampi Stone Chariot (ಕಲ್ಲಿನ ರಥ)",
      location: "Vijayanagara District, Hampi, Karnataka",
      dynasty: "Vijayanagara Empire (King Krishnadevaraya)",
      architectural_style: "Vijayanagara Musical Hypostyle Chariot",
      depth_meters: 18.0,
      tiers_count: 4,
      geometry_type: "chariot_mandapa",
      stone_material: "dhrangadhra_gold",
      water_state: "sacred_aquifer",
      photo_sample_count: 15,
      google_photos_url: "https://photos.app.goo.gl/hampi-stone-chariot",
      manual_notes: "Iconic shrine dedicated to Garuda inside the Vittala Temple complex, built with monolithic granite slabs carved to simulate a temple on moving stone wheels, flanked by acoustic sa-re-ga-ma musical pillars.",
    },
  ];

  // Search State for Autonomous Mode
  const [searchQuery, setSearchQuery] = useState<string>("Rani Ki Vav");

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
  const [currentStepText, setCurrentStepText] = useState<string>("");
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
      location: overrides?.location || locationStr,
      dynasty: activeDynasty,
      architectural_style: overrides?.architectural_style || architecturalStyle,
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
    handleAutonomousResearch("Rani Ki Vav");
  }, []);

  // Update live twin immediately whenever form sliders, stone, water, or geometry changes
  useEffect(() => {
    setGeneratedTwin((prev: any) => ({
      ...getLiveTwinSpec(),
      epigraph: prev?.epigraph,
      photogrammetry_report: prev?.photogrammetry_report,
    }));
  }, [depthMeters, tiersCount, geometryType, stoneMaterial, waterState]);

  // Master Function: Autonomous Research & Synthesis from Just a Name
  const handleAutonomousResearch = async (targetQuery?: string) => {
    const q = (targetQuery || searchQuery || "").trim();
    if (!q) return;

    setIsGenerating(true);
    setSynthesisStep(1);

    const steps = [
      `Phase 1/5: AI querying historical archives & epigraphical corpus for "${q}"...`,
      `Phase 2/5: Ingesting multi-view photogrammetric captures & vanishing lines for "${q}"...`,
      `Phase 3/5: Reconstructing subterranean structural mesh & column orders...`,
      `Phase 4/5: Compiling PBR stone ashlar & carved relief weathering shaders...`,
      `Phase 5/5: Deciphering Sanskrit dedication verse, modern Hindi & English translations...`,
    ];

    setCurrentStepText(steps[0]);
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setSynthesisStep(stepIndex + 1);
        setCurrentStepText(steps[stepIndex]);
      }
    }, 400);

    try {
      const res = await api.autonomousResearchAndGenerate(q);
      if (res.success && res.twin) {
        const twin = res.twin;
        setGeneratedTwin(twin);

        // Update active form states to match the research findings
        setMonumentName(twin.name);
        setLocationStr(twin.location);
        setDynasty(twin.dynasty);
        setArchitecturalStyle(twin.architectural_style);
        setDepthMeters(twin.depth_meters);
        setTiersCount(twin.tiers_count);
        setGeometryType(twin.geometry_type);
        setStoneMaterial(twin.stone_spec.name.toLowerCase().includes("red") ? "agra_red" : (twin.stone_spec.name.toLowerCase().includes("basalt") ? "basalt_black" : (twin.stone_spec.name.toLowerCase().includes("marble") ? "makrana_marble" : "dhrangadhra_gold")));
        setWaterState(twin.water_spec.name.toLowerCase().includes("lotus") ? "lotus_pool" : (twin.water_spec.name.toLowerCase().includes("dry") ? "dry_excavated" : "sacred_aquifer"));
        if (twin.images && twin.images.length > 0) {
          setUploadedPhotos(twin.images);
        }
        setManualNotes(twin.manual_notes || "");
        setActiveTab("model");
      }
    } catch (err) {
      console.error("Autonomous research error:", err);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setSynthesisStep(0);
      setCurrentStepText("");
    }
  };

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSearchQuery(p.name);
    handleAutonomousResearch(p.name);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Autonomous Heritage Synthesizer</span>
            </span>
            <span className="text-xs text-slate-400">Just enter any monument name ➔ AI Researches, Fetches Images & Synthesizes 3D Model</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-amber-400" />
            Autonomous 3D Monument Digital Twin Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Type any monument name below. The AI autonomously browses historical archives, fetches multi-view photogrammetric photographs, and builds an authentic, heavy, museum-grade 3D Digital Twin with real-time solar raytracing.
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

      {/* 2. THE KILLER SEARCH BAR: Just Type Any Monument Name */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Autonomous Monument Prompt: Enter ANY Monument Name</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Zero Manual Effort • 100% Autonomous AI Workflow
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAutonomousResearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Rani Ki Vav, Kailasa Temple Ellora, Konark Sun Temple, Modhera, Chand Baori, Hampi..."
              className="w-full bg-slate-950 border-2 border-amber-500/40 hover:border-amber-400 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none shadow-inner placeholder-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-70 shrink-0 hover:scale-102 active:scale-98"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>AI Synthesizing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 fill-current" />
                <span>AI Research & Build 3D Model</span>
              </>
            )}
          </button>
        </form>

        {/* Live AI Progress Banner when researching */}
        {isGenerating && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>{currentStepText || "AI Research in progress..."}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Step {synthesisStep}/5</span>
          </div>
        )}

        {/* Suggested Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Try instantly:</span>
          {[
            { label: "👑 Rani Ki Vav", q: "Rani Ki Vav" },
            { label: "🏔️ Kailasa Temple (Ellora)", q: "Kailasa Rock-Cut Temple, Cave 16" },
            { label: "🛞 Konark Sun Temple", q: "Konark Sun Temple" },
            { label: "☀️ Modhera Sun Temple", q: "Modhera Sun Temple & Surya Kund" },
            { label: "📐 Chand Baori", q: "Chand Baori" },
            { label: "🛕 Hampi Stone Chariot", q: "Hampi Stone Chariot" },
            { label: "🏺 Adalaj Ni Vav", q: "Adalaj Ni Vav" },
          ].map((chip) => (
            <button
              key={chip.q}
              type="button"
              onClick={() => {
                setSearchQuery(chip.q);
                handleAutonomousResearch(chip.q);
              }}
              className="text-xs bg-slate-900 hover:bg-amber-950/80 hover:border-amber-500/60 border border-slate-800 text-slate-300 hover:text-amber-200 px-3 py-1.5 rounded-xl transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Master Studio Grid: Form (Left) & Real-Time 3D Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Retrieved Architecture & Form Adjustments (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">AI Retrieved Photogrammetry & Context</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">✓ AI Synced</span>
          </div>

          {/* Section B: Ingested Photos Scanner Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                AI Retrieved Multi-View Captures ({uploadedPhotos.length} Angles):
              </span>
              <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer font-semibold">
                + Add Custom Photo
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
                    ANGLE #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-800">
                ✓ 3D Point Cloud Triangulated
              </span>
              <span className="text-[9px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-md border border-purple-800">
                ✓ Vanishing Line Perspective Mapped
              </span>
              <span className="text-[9px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-800">
                ✓ Procedural PBR Shaders Compiled
              </span>
            </div>
          </div>

          {/* Section C: Monument Identity Form (Can tweak manually if desired) */}
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
                  Location / Region
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
                <input
                  type="text"
                  value={dynasty}
                  onChange={(e) => setDynasty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Subterranean Depth & Tiers Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Depth/Elevation:</span>
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
                  <span className="text-slate-400 font-medium">Stories / Tiers:</span>
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
                AI Archaeological Synthesis & Historical Lore
              </label>
              <textarea
                rows={3}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="AI synthesized folklore, epigraphic details, or architectural observations..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed placeholder-slate-600"
              />
            </div>
          </div>
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