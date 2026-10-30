"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Sun,
  Clock,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Info,
  Maximize2,
  Minimize2,
  Calendar,
  Eye,
  Sliders,
  History,
  ShieldCheck,
  RotateCcw,
  Play,
  Pause,
  MapPin,
  ChevronRight,
  Scan,
  Camera,
  Flame,
  Radio,
  CheckCircle2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface Dharohar3DTwinProps {
  onDepthChange?: (depthMeters: number) => void;
  onEpochChange?: (epochId: string) => void;
  twinData?: any;
}

interface POI {
  id: string;
  name: string;
  tier: string;
  elevation: string;
  description: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

export const Dharohar3DTwin: React.FC<Dharohar3DTwinProps> = ({
  onDepthChange,
  onEpochChange,
  twinData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Simulation Controls State
  const [timeHour, setTimeHour] = useState<number>(11.5); // 11:30 AM default
  const [epochIndex, setEpochIndex] = useState<number>(0);
  const [currentDepth, setCurrentDepth] = useState<number>(12);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [renderMode, setRenderMode] = useState<"realistic" | "xray" | "lidar">("realistic");
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Architectural Layer Visibility Toggles
  const [layerPillars, setLayerPillars] = useState<boolean>(true);
  const [layerShaft, setLayerShaft] = useState<boolean>(true);
  const [layerWater, setLayerWater] = useState<boolean>(true);
  const [layerRays, setLayerRays] = useState<boolean>(true);
  const [layerTorches, setLayerTorches] = useState<boolean>(true);

  // Cinematic Walkthrough State
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const tourProgressRef = useRef<number>(0);

  // Spatial Audio Synthesizer State
  const [ambientAudioActive, setAmbientAudioActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunShaftConeRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const dustParticlesRef = useRef<THREE.Points | null>(null);
  const structureGroupRef = useRef<THREE.Group | null>(null);
  const pillarsGroupRef = useRef<THREE.Group | null>(null);
  const shaftGroupRef = useRef<THREE.Group | null>(null);
  const torchesGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial }>({});
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(26, 18, 28));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -9, 0));
  const autoRotateAngleRef = useRef<number>(0);

  // Historical Epoch Definitions
  const epochs = twinData?.epochs || [
    {
      id: "1063",
      year: "1063 AD",
      name: "Solanki Golden Age",
      patron: "Queen Udayamati (Rani Ki Vav Era)",
      sandstoneHex: 0xd4a359,
      sandstoneRoughness: 0.72,
      waterColor: 0x0284c7,
      description: "Pristine carved Dhrangadhra golden sandstone, sacred subterranean water cisterns, and crisp Dashavatara sculptures.",
    },
    {
      id: "1498",
      year: "1498 AD",
      name: "Vaghela & Sultanate Synthesis",
      patron: "Queen Rudabai (Adalaj Era)",
      sandstoneHex: 0xc4934e,
      sandstoneRoughness: 0.78,
      waterColor: 0x0369a1,
      description: "Queen Rudabai's memorial stepwell: Jain & Hindu motifs fused with intricate Indo-Islamic arches and Sanskrit royal edict.",
    },
    {
      id: "1890",
      year: "1890 AD",
      name: "Colonial Survey Era",
      patron: "Archaeological Survey of Western India",
      sandstoneHex: 0x9e7b47,
      sandstoneRoughness: 0.9,
      waterColor: 0x075985,
      description: "Historical documentation, natural weathering, silt accumulation, and rediscovery of subterranean galleries.",
    },
    {
      id: "2026",
      year: "2026 AD",
      name: "Modern ASI Protected Heritage",
      patron: "Archaeological Survey of India (ASI)",
      sandstoneHex: 0x8a6a3b,
      sandstoneRoughness: 0.85,
      waterColor: 0x0c4a6e,
      description: "UNESCO protected monument equipped with laser photogrammetry, high-resolution digital twins, and visitor galleries.",
    },
  ];

  // Architectural Hotspots (POIs)
  const pois: POI[] = twinData?.pois || [
    {
      id: "poi-aerial",
      name: "Aerial Axial Overview",
      tier: "Surface Level",
      elevation: "+24.0m",
      description: "Birds-eye perspective of the 5-tiered linear stepped corridor cutting 24.5m into the earth, aligned along Gujarat's north-south solar axis.",
      camPos: [28, 22, 32],
      lookAt: [0, -10, 0],
    },
    {
      id: "poi-torana",
      name: "Torana Entrance Mandapa",
      tier: "Surface Level",
      elevation: "0.0m",
      description: "Triple-entrance gateway framed by sculpted lotus rosettes, pot-and-foliage (kalasha) plinths, and ornamental bracket capitals.",
      camPos: [14, 5, 23],
      lookAt: [0, 2, 14],
    },
    {
      id: "poi-edict",
      name: "Queen Rudabai Sanskrit Edict",
      tier: "Tier 1 Pavilion",
      elevation: "-4.5m",
      description: "Carved marble niche stele in Vikram Samvat 1555 recording the foundation of the stepwell for public welfare and spiritual merit.",
      camPos: [-5, -2, 13],
      lookAt: [-2.8, -4.5, 9],
    },
    {
      id: "poi-shaft",
      name: "Octagonal Breathing Oculus",
      tier: "Tier 3 Intermediate",
      elevation: "-14.0m",
      description: "Octagonal subterranean light shaft acting as a solar clock and passive thermal chimney, casting dramatic sunbeams down to lower tiers.",
      camPos: [0, -7, -2],
      lookAt: [0, -14, -8],
    },
    {
      id: "poi-cistern",
      name: "Deep Subterranean Cistern",
      tier: "Tier 5 Cistern",
      elevation: "-22.5m",
      description: "Subterranean groundwater reservoir maintaining a natural 6°C cooler microclimate through passive thermal ground coupling.",
      camPos: [0, -18, -1],
      lookAt: [0, -22, -8],
    },
  ];

  // =========================================================================
  // Helper: Procedural Sandstone Ashlar Block Texture (Canvas Generated)
  // =========================================================================
  const createSandstoneTexture = (baseColor = "#d4a359", darkerColor = "#8a6125"): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // 1. Base sandstone fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Geological sediment horizontal strata
    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? darkerColor : "#fef3c7";
      ctx.globalAlpha = 0.05 + Math.random() * 0.08;
      ctx.fillRect(0, y, 512, 2 + Math.random() * 2);
    }

    // 3. Ashlar masonry stone course seams
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = darkerColor;
    ctx.lineWidth = 2.5;
    const blockH = 64;
    for (let y = 0; y <= 512; y += blockH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      const offset = (Math.floor(y / blockH) % 2) * 64;
      for (let x = offset; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + blockH);
        ctx.stroke();
      }
    }

    // 4. Weathering grain speckles
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? "#000000" : "#ffffff";
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  };

  // Helper: Procedural Floral Frieze Texture (Canvas Generated)
  const createFriezeTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = "#c4934e";
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = "#6b3b0d";
    ctx.fillStyle = "#eab308";
    ctx.lineWidth = 2.5;

    for (let x = 32; x < 512; x += 64) {
      // Diamond lozenge
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x + 22, 64);
      ctx.lineTo(x, 112);
      ctx.lineTo(x - 22, 64);
      ctx.closePath();
      ctx.stroke();

      // Inner rosette
      ctx.beginPath();
      ctx.arc(x, 64, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    return texture;
  };

  // =========================================================================
  // 1. Initialize High-Fidelity 3D WebGL Scene
  // =========================================================================
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 560;

    // A. Scene with Atmospheric Depth Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.015);
    sceneRef.current = scene;

    // B. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(26, 18, 28);
    camera.lookAt(0, -9, 0);
    cameraRef.current = camera;

    // C. WebGL Renderer with High Precision & Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // D. Master Groups
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);
    structureGroupRef.current = structureGroup;

    const pillarsGroup = new THREE.Group();
    structureGroup.add(pillarsGroup);
    pillarsGroupRef.current = pillarsGroup;

    const shaftGroup = new THREE.Group();
    structureGroup.add(shaftGroup);
    shaftGroupRef.current = shaftGroup;

    const torchesGroup = new THREE.Group();
    structureGroup.add(torchesGroup);
    torchesGroupRef.current = torchesGroup;

    // E. Realistic Materials with Procedural Textures
    const sandstoneHex = twinData?.stone_spec?.hex || 0xd4a359;
    const sandstoneRoughness = twinData?.stone_spec?.roughness || 0.75;
    const stoneColorCss = `#${sandstoneHex.toString(16).padStart(6, "0")}`;
    const sandstoneTex = createSandstoneTexture(stoneColorCss);
    const friezeTex = createFriezeTexture();

    const stoneMat = new THREE.MeshStandardMaterial({
      map: sandstoneTex,
      color: sandstoneHex,
      roughness: sandstoneRoughness,
      metalness: 0.06,
    });
    materialsRef.current.stone = stoneMat;

    const friezeMat = new THREE.MeshStandardMaterial({
      map: friezeTex,
      color: sandstoneHex,
      roughness: 0.7,
      metalness: 0.1,
    });
    materialsRef.current.carved = friezeMat;

    const goldIconMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.32,
      metalness: 0.88,
    });
    materialsRef.current.gold = goldIconMat;

    // =========================================================================
    // 2. PROCEDURAL ARCHITECTURAL MODEL (Multi-Archetype Heritage Engine)
    // =========================================================================

    const numTiers = twinData?.tiers_count ? Math.max(1, Math.min(7, twinData.tiers_count)) : 5;
    const totalDepth = twinData?.depth_meters ? Math.max(6, Math.min(38, twinData.depth_meters)) : 24.5;
    const geomType = twinData?.geometry_type || "stepwell_linear";

    if (geomType === "himalayan_shikhara") {
      // -----------------------------------------------------------------------
      // ARCHETYPE 0: HIMALAYAN MOUNTAIN TEMPLE (Kedarnath, Badrinath, Tungnath)
      // High-altitude Garhwal Himalayan stone temple amidst snow-capped peaks
      // -----------------------------------------------------------------------
      // A. Snow-Capped Himalayan Mountain Range in Background
      const mountainMat = new THREE.MeshStandardMaterial({
        color: 0x475569, // dark slate rock
        roughness: 0.95,
      });
      const snowMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc, // pure mountain snow
        roughness: 0.8,
      });

      // Majestic Himalayan Peaks behind Kedarnath
      const peaks = [
        { x: -38, z: -55, h: 48, r: 24 },
        { x: -14, z: -65, h: 58, r: 28 }, // Kedarnath Peak / Kedar Dome
        { x: 18, z: -60, h: 52, r: 26 },
        { x: 42, z: -52, h: 44, r: 22 },
        { x: -50, z: -35, h: 36, r: 18 },
        { x: 50, z: -35, h: 38, r: 20 },
      ];

      peaks.forEach((p) => {
        const peakGeo = new THREE.ConeGeometry(p.r, p.h, 7);
        const peak = new THREE.Mesh(peakGeo, mountainMat);
        peak.position.set(p.x, p.h / 2, p.z);
        peak.receiveShadow = true;
        structureGroup.add(peak);

        const snowGeo = new THREE.ConeGeometry(p.r * 0.45, p.h * 0.42, 7);
        const snow = new THREE.Mesh(snowGeo, snowMat);
        snow.position.set(p.x, p.h * 0.79, p.z);
        structureGroup.add(snow);
      });

      // B. Ground Alpine Valley Plinth
      const groundGeo = new THREE.PlaneGeometry(180, 180);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: 0x334155, // cold slate valley floor
        roughness: 0.92,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // C. Elevated Heavy Grey Granite Temple Plinth (Jagati)
      const plinthGeo = new THREE.BoxGeometry(19, 2.4, 32);
      const plinthMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: 0x475569, // heavy grey ashlar stone
        roughness: 0.88,
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.set(0, 1.2, 0);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      structureGroup.add(plinth);

      // D. Main Garbhagriha (Sanctum) & Towering Grey Stone Shikhara
      const sanctumBaseGeo = new THREE.BoxGeometry(11, 7.5, 12);
      const sanctumBase = new THREE.Mesh(sanctumBaseGeo, friezeMat);
      sanctumBase.position.set(0, 5.95, -7);
      sanctumBase.castShadow = true;
      sanctumBase.receiveShadow = true;
      structureGroup.add(sanctumBase);

      // Stepped Pyramid Shikhara Tower (5 tiers)
      for (let lvl = 0; lvl < 5; lvl++) {
        const sw = 10.2 - lvl * 1.7;
        const sl = 11.2 - lvl * 1.7;
        const sh = 2.4;
        const spLvlGeo = new THREE.BoxGeometry(sw, sh, sl);
        const spLvl = new THREE.Mesh(spLvlGeo, friezeMat);
        spLvl.position.set(0, 9.7 + lvl * sh + sh / 2, -7);
        spLvl.castShadow = true;
        structureGroup.add(spLvl);

        const cornGeo = new THREE.BoxGeometry(sw + 0.5, 0.35, sl + 0.5);
        const corn = new THREE.Mesh(cornGeo, stoneMat);
        corn.position.set(0, 9.7 + lvl * sh + sh, -7);
        structureGroup.add(corn);
      }

      // Massive Ribbed Stone Amalaka & Golden Kalasha
      const amalakaGeo = new THREE.CylinderGeometry(2.4, 2.4, 1.4, 20);
      const amalaka = new THREE.Mesh(amalakaGeo, friezeMat);
      amalaka.position.set(0, 9.7 + 5 * 2.4 + 0.8, -7);
      amalaka.castShadow = true;
      structureGroup.add(amalaka);

      const kalashaGeo = new THREE.SphereGeometry(1.5, 16, 16);
      const kalasha = new THREE.Mesh(kalashaGeo, goldIconMat);
      kalasha.position.set(0, 9.7 + 5 * 2.4 + 2.4, -7);
      kalasha.castShadow = true;
      structureGroup.add(kalasha);

      // E. Front Sabha Mandapa with Sloping Snow-Shedding Gabled Roof
      const mandapaBaseGeo = new THREE.BoxGeometry(13.2, 5.8, 14);
      const mandapaBase = new THREE.Mesh(mandapaBaseGeo, plinthMat);
      mandapaBase.position.set(0, 5.1, 5);
      mandapaBase.castShadow = true;
      structureGroup.add(mandapaBase);

      const roofLGeo = new THREE.BoxGeometry(7.8, 0.6, 15);
      const roofL = new THREE.Mesh(roofLGeo, friezeMat);
      roofL.position.set(-3.2, 9.2, 5);
      roofL.rotation.z = 0.55; // Sloped down to shed snow
      roofL.castShadow = true;
      structureGroup.add(roofL);

      const roofRGeo = new THREE.BoxGeometry(7.8, 0.6, 15);
      const roofR = new THREE.Mesh(roofRGeo, friezeMat);
      roofR.position.set(3.2, 9.2, 5);
      roofR.rotation.z = -0.55; // Sloped down to shed snow
      roofR.castShadow = true;
      structureGroup.add(roofR);

      // Front Carved Wooden Entrance Portal with Brass Trim
      const portalGeo = new THREE.BoxGeometry(3.6, 5.0, 0.8);
      const portal = new THREE.Mesh(portalGeo, goldIconMat);
      portal.position.set(0, 4.7, 12.1);
      structureGroup.add(portal);

      const doorOpeningGeo = new THREE.BoxGeometry(2.4, 3.8, 0.9);
      const doorOpeningMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const doorOpening = new THREE.Mesh(doorOpeningGeo, doorOpeningMat);
      doorOpening.position.set(0, 4.1, 12.15);
      structureGroup.add(doorOpening);

      // F. Sacred Seated Stone Nandi Bull Facing the Shrine Entrance
      const nandiPlinthGeo = new THREE.BoxGeometry(3.2, 1.2, 4.4);
      const nandiPlinth = new THREE.Mesh(nandiPlinthGeo, stoneMat);
      nandiPlinth.position.set(0, 3.0, 18.5);
      nandiPlinth.castShadow = true;
      structureGroup.add(nandiPlinth);

      const nandiBodyGeo = new THREE.BoxGeometry(1.8, 1.6, 3.0);
      const nandiBody = new THREE.Mesh(nandiBodyGeo, friezeMat);
      nandiBody.position.set(0, 4.4, 18.5);
      nandiBody.castShadow = true;
      structureGroup.add(nandiBody);

      const nandiHumpGeo = new THREE.SphereGeometry(0.7, 12, 12);
      const nandiHump = new THREE.Mesh(nandiHumpGeo, friezeMat);
      nandiHump.position.set(0, 5.4, 19.2);
      structureGroup.add(nandiHump);

      const nandiHeadGeo = new THREE.BoxGeometry(1.2, 1.1, 1.4);
      const nandiHead = new THREE.Mesh(nandiHeadGeo, friezeMat);
      nandiHead.position.set(0, 4.8, 16.8); // facing towards the door
      structureGroup.add(nandiHead);

      const garlandGeo = new THREE.TorusGeometry(0.75, 0.12, 8, 16);
      const garland = new THREE.Mesh(garlandGeo, goldIconMat);
      garland.position.set(0, 4.6, 17.5);
      structureGroup.add(garland);

      // G. Monumental Golden Trishul (Trident) & Damru Beside Portal
      const trishulStaffGeo = new THREE.CylinderGeometry(0.12, 0.15, 12, 8);
      const trishulStaff = new THREE.Mesh(trishulStaffGeo, goldIconMat);
      trishulStaff.position.set(5.4, 8.2, 13.5);
      trishulStaff.castShadow = true;
      pillarsGroup.add(trishulStaff);

      [-0.6, 0, 0.6].forEach((tx, idx) => {
        const prongGeo = new THREE.ConeGeometry(0.12, idx === 1 ? 1.6 : 1.2, 8);
        const prong = new THREE.Mesh(prongGeo, goldIconMat);
        prong.position.set(5.4 + tx, 14.8 + (idx === 1 ? 0.3 : 0), 13.5);
        pillarsGroup.add(prong);
      });

      const damruGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 8);
      const damru = new THREE.Mesh(damruGeo, goldIconMat);
      damru.position.set(5.4, 13.2, 13.5);
      pillarsGroup.add(damru);

      // H. Saffron Temple Prayer Flag (Dhwaja) on Tall Mast
      const mastGeo = new THREE.CylinderGeometry(0.1, 0.12, 14, 8);
      const mast = new THREE.Mesh(mastGeo, stoneMat);
      mast.position.set(-5.4, 9.2, 13.5);
      structureGroup.add(mast);

      const flagGeo = new THREE.ConeGeometry(1.2, 2.4, 3);
      const flagMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(-5.4, 15.2, 14.2);
      flag.rotation.z = Math.PI / 2;
      structureGroup.add(flag);

      // I. Ceremonial Flight of Front Granite Steps
      for (let st = 0; st < 6; st++) {
        const stepGeo = new THREE.BoxGeometry(10, 0.42, 0.75);
        const step = new THREE.Mesh(stepGeo, plinthMat);
        step.position.set(0, 2.1 - st * 0.42, 16.2 + st * 0.7);
        step.castShadow = true;
        structureGroup.add(step);
      }
    } else if (geomType === "nagara_shikhara") {
      // -----------------------------------------------------------------------
      // ARCHETYPE: CLASSICAL NAGARA MOUNTAIN SPIRE (Ayodhya Ram Mandir, Somnath, Dwarka)
      // Curvilinear shikhara with cascading urushringas, Jagati plinth & Kirti Torana
      // -----------------------------------------------------------------------
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.88,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // Grand Carved Jagati Plinth
      const jagatiGeo = new THREE.BoxGeometry(20, 2.8, 36);
      const jagati = new THREE.Mesh(jagatiGeo, stoneMat);
      jagati.position.set(0, 1.4, -2);
      jagati.castShadow = true;
      jagati.receiveShadow = true;
      structureGroup.add(jagati);

      // Main Garbhagriha & Curvilinear Nagara Shikhara (Latina/Shekhari Style)
      const sanctumGeo = new THREE.BoxGeometry(12, 8, 12);
      const sanctum = new THREE.Mesh(sanctumGeo, friezeMat);
      sanctum.position.set(0, 6.8, -10);
      sanctum.castShadow = true;
      structureGroup.add(sanctum);

      // 6 Tiers of Curvilinear Urushringa Spires
      for (let lvl = 0; lvl < 6; lvl++) {
        const nw = 11.2 - lvl * 1.6;
        const nl = 11.2 - lvl * 1.6;
        const nh = 2.6;
        const nLvlGeo = new THREE.BoxGeometry(nw, nh, nl);
        const nLvl = new THREE.Mesh(nLvlGeo, friezeMat);
        nLvl.position.set(0, 10.8 + lvl * nh + nh / 2, -10);
        nLvl.castShadow = true;
        structureGroup.add(nLvl);

        // Cascading miniature corner spires (Urushringas)
        [-nw / 2 + 0.6, nw / 2 - 0.6].forEach((ux) => {
          [-nl / 2 + 0.6, nl / 2 - 0.6].forEach((uz) => {
            const uGeo = new THREE.ConeGeometry(0.7, 1.8, 4);
            const uSpire = new THREE.Mesh(uGeo, friezeMat);
            uSpire.position.set(ux, 10.8 + lvl * nh + nh, -10 + uz);
            uSpire.rotation.y = Math.PI / 4;
            structureGroup.add(uSpire);
          });
        });
      }

      // Massive Ribbed Amalaka & Golden Kalasha
      const amalakaGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.6, 24);
      const amalaka = new THREE.Mesh(amalakaGeo, friezeMat);
      amalaka.position.set(0, 10.8 + 6 * 2.6 + 0.9, -10);
      amalaka.castShadow = true;
      structureGroup.add(amalaka);

      const kalashaGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const kalasha = new THREE.Mesh(kalashaGeo, goldIconMat);
      kalasha.position.set(0, 10.8 + 6 * 2.6 + 2.7, -10);
      kalasha.castShadow = true;
      structureGroup.add(kalasha);

      // Gudhamandapa (Hall with Stepped Pyramidal Samvarana Roof)
      const gudhaGeo = new THREE.BoxGeometry(14, 6.5, 14);
      const gudha = new THREE.Mesh(gudhaGeo, stoneMat);
      gudha.position.set(0, 6.0, 3);
      gudha.castShadow = true;
      structureGroup.add(gudha);

      for (let s = 0; s < 4; s++) {
        const sw = 13.5 - s * 2.2;
        const sl = 13.5 - s * 2.2;
        const sGeo = new THREE.BoxGeometry(sw, 1.4, sl);
        const sRoof = new THREE.Mesh(sGeo, friezeMat);
        sRoof.position.set(0, 9.9 + s * 1.4, 3);
        sRoof.castShadow = true;
        structureGroup.add(sRoof);
      }

      // Kirti Torana (Arch of Glory) at Entrance
      const toranaGeo = new THREE.TorusGeometry(3.6, 0.38, 12, 32, Math.PI);
      const torana = new THREE.Mesh(toranaGeo, goldIconMat);
      torana.position.set(0, 4.6, 16);
      torana.castShadow = true;
      structureGroup.add(torana);

      // Front Flight of Steps
      for (let st = 0; st < 6; st++) {
        const stepGeo = new THREE.BoxGeometry(9, 0.45, 0.8);
        const step = new THREE.Mesh(stepGeo, stoneMat);
        step.position.set(0, 2.5 - st * 0.45, 15.5 + st * 0.75);
        step.castShadow = true;
        structureGroup.add(step);
      }
    } else if (geomType === "dravidian_gopuram") {
      // -----------------------------------------------------------------------
      // ARCHETYPE: MONUMENTAL DRAVIDIAN GOPURAM (Meenakshi Amman, Madurai, Rameswaram)
      // Soaring 7-tier pyramidal Gopuram gateway, thousand-pillar Yali hall & Vimana
      // -----------------------------------------------------------------------
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.9,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // Monumental 7-Tier Pyramidal Gopuram Gateway (Front Entrance)
      const gopuramBaseGeo = new THREE.BoxGeometry(16, 6, 8);
      const gopuramBase = new THREE.Mesh(gopuramBaseGeo, stoneMat);
      gopuramBase.position.set(0, 3, 16);
      gopuramBase.castShadow = true;
      structureGroup.add(gopuramBase);

      // Soaring Tiers of Gopuram with Deity Friezes
      for (let lvl = 0; lvl < 7; lvl++) {
        const gw = 15.2 - lvl * 1.5;
        const gl = 7.5 - lvl * 0.7;
        const gh = 2.4;
        const gLvlGeo = new THREE.BoxGeometry(gw, gh, gl);
        const gLvl = new THREE.Mesh(gLvlGeo, friezeMat);
        gLvl.position.set(0, 6.0 + lvl * gh + gh / 2, 16);
        gLvl.castShadow = true;
        structureGroup.add(gLvl);
      }

      // Barrel-Vaulted Shala Crown with 5 Golden Kalashams
      const shalaGeo = new THREE.CylinderGeometry(1.6, 1.6, 6.2, 12, 1, false, 0, Math.PI);
      const shala = new THREE.Mesh(shalaGeo, friezeMat);
      shala.position.set(0, 6.0 + 7 * 2.4 + 1.2, 16);
      shala.rotation.z = Math.PI / 2;
      structureGroup.add(shala);

      for (let k = -2; k <= 2; k++) {
        const kGeo = new THREE.SphereGeometry(0.45, 12, 12);
        const kMesh = new THREE.Mesh(kGeo, goldIconMat);
        kMesh.position.set(k * 1.2, 6.0 + 7 * 2.4 + 2.8, 16);
        structureGroup.add(kMesh);
      }

      // Thousand-Pillar Hypostyle Hall (Pillared Arcade behind Gopuram)
      for (let px = -6; px <= 6; px += 3) {
        for (let pz = -2; pz <= 8; pz += 3.2) {
          const yaliColGeo = new THREE.CylinderGeometry(0.35, 0.45, 5.5, 12);
          const yaliCol = new THREE.Mesh(yaliColGeo, friezeMat);
          yaliCol.position.set(px, 2.75, pz);
          yaliCol.castShadow = true;
          pillarsGroup.add(yaliCol);
        }
      }

      // Inner Sanctum Vimana Tower
      const vimanaGeo = new THREE.BoxGeometry(10, 8, 10);
      const vimana = new THREE.Mesh(vimanaGeo, stoneMat);
      vimana.position.set(0, 4, -10);
      vimana.castShadow = true;
      structureGroup.add(vimana);

      const vimDomeGeo = new THREE.SphereGeometry(2.8, 16, 16);
      const vimDome = new THREE.Mesh(vimDomeGeo, goldIconMat);
      vimDome.position.set(0, 10.5, -10);
      vimDome.castShadow = true;
      structureGroup.add(vimDome);
    } else if (geomType === "monolithic_rockcut") {
      // -----------------------------------------------------------------------
      // ARCHETYPE 1: KAILASA MONOLITHIC ROCK-CUT TEMPLE (Ellora Cave 16)
      // Carved top-down out of a single mountain cliff; 200,000 tonnes of basalt
      // -----------------------------------------------------------------------
      const courtFloorY = -totalDepth * 0.55;

      // 1. Monolithic Courtyard Floor (Basalt Stone Flags)
      const courtFloorGeo = new THREE.BoxGeometry(38, 2.0, 52);
      const courtFloor = new THREE.Mesh(courtFloorGeo, stoneMat);
      courtFloor.position.set(0, courtFloorY - 1.0, 0);
      courtFloor.receiveShadow = true;
      structureGroup.add(courtFloor);

      // 2. Three Towering Basalt Mountain Cliff Walls (North, South, East)
      const cliffHeight = 36;
      const cliffMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.92,
        metalness: 0.08,
      });

      // East (Rear) Cliff Wall
      const rearCliffGeo = new THREE.BoxGeometry(38, cliffHeight, 4.0);
      const rearCliff = new THREE.Mesh(rearCliffGeo, cliffMat);
      rearCliff.position.set(0, courtFloorY + cliffHeight / 2, -26);
      rearCliff.receiveShadow = true;
      rearCliff.castShadow = true;
      structureGroup.add(rearCliff);

      // North & South Flanking Cliff Walls with Carved Horizontal Stratification
      [-19, 19].forEach((cx) => {
        const sideCliffGeo = new THREE.BoxGeometry(4.0, cliffHeight, 52);
        const sideCliff = new THREE.Mesh(sideCliffGeo, cliffMat);
        sideCliff.position.set(cx, courtFloorY + cliffHeight / 2, 0);
        sideCliff.receiveShadow = true;
        sideCliff.castShadow = true;
        structureGroup.add(sideCliff);

        // Double-Storey Rock-Cut Cloister Arcades along Cliff Faces
        for (let storey = 0; storey < 2; storey++) {
          const sy = courtFloorY + 1.2 + storey * 5.2;
          for (let p = 0; p < 8; p++) {
            const pz = -18 + p * 5.0;
            // Rock pillar
            const clColGeo = new THREE.BoxGeometry(0.7, 4.6, 0.7);
            const clCol = new THREE.Mesh(clColGeo, friezeMat);
            clCol.position.set(cx > 0 ? cx - 2.4 : cx + 2.4, sy + 2.3, pz);
            clCol.castShadow = true;
            pillarsGroup.add(clCol);

            // Sculpted niche inside the rock
            const nicheGeo = new THREE.BoxGeometry(0.9, 2.2, 0.4);
            const niche = new THREE.Mesh(nicheGeo, friezeMat);
            niche.position.set(cx > 0 ? cx - 1.2 : cx + 1.2, sy + 2.2, pz);
            structureGroup.add(niche);

            // Golden deity relief
            const deityGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.2, 8);
            const deity = new THREE.Mesh(deityGeo, goldIconMat);
            deity.position.set(cx > 0 ? cx - 1.2 : cx + 1.2, sy + 2.2, pz);
            structureGroup.add(deity);
          }
        }
      });

      // 3. Central Temple Plinth (Jagati)
      const plinthGeo = new THREE.BoxGeometry(15, 3.6, 26);
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.set(0, courtFloorY + 1.8, -4);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      structureGroup.add(plinth);

      // Colossal Elephant Relief Frieze around Plinth Base
      for (let e = -4; e <= 4; e++) {
        [-7.9, 7.9].forEach((ex) => {
          const eleBodyGeo = new THREE.BoxGeometry(0.8, 2.0, 2.2);
          const eleBody = new THREE.Mesh(eleBodyGeo, friezeMat);
          eleBody.position.set(ex, courtFloorY + 1.2, -4 + e * 2.7);
          eleBody.castShadow = true;
          structureGroup.add(eleBody);

          const trunkGeo = new THREE.CylinderGeometry(0.15, 0.28, 1.2, 8);
          const trunk = new THREE.Mesh(trunkGeo, friezeMat);
          trunk.position.set(ex > 0 ? ex + 0.35 : ex - 0.35, courtFloorY + 0.9, -4 + e * 2.7);
          trunk.rotation.z = ex > 0 ? -0.4 : 0.4;
          structureGroup.add(trunk);
        });
      }

      // 4. Sabha Mandapa (Great Hypostyle Rock-Cut Hall)
      const mandapaRoofGeo = new THREE.BoxGeometry(13.6, 1.0, 14);
      const mandapaRoof = new THREE.Mesh(mandapaRoofGeo, stoneMat);
      mandapaRoof.position.set(0, courtFloorY + 8.4, 2);
      mandapaRoof.castShadow = true;
      structureGroup.add(mandapaRoof);

      // 16 Square Monolithic Pillars inside Sabha Mandapa
      for (let mx = -4.5; mx <= 4.5; mx += 3.0) {
        for (let mz = -3.5; mz <= 7.5; mz += 3.6) {
          const mColGeo = new THREE.BoxGeometry(0.7, 4.8, 0.7);
          const mCol = new THREE.Mesh(mColGeo, friezeMat);
          mCol.position.set(mx, courtFloorY + 6.0, mz);
          mCol.castShadow = true;
          pillarsGroup.add(mCol);
        }
      }

      // 5. Main 5-Tier Dravidian Vimana Tower over the Sanctum
      for (let lvl = 0; lvl < 5; lvl++) {
        const vw = 11.5 - lvl * 1.8;
        const vl = 12.5 - lvl * 1.8;
        const vh = 2.4;
        const vLvlGeo = new THREE.BoxGeometry(vw, vh, vl);
        const vLvl = new THREE.Mesh(vLvlGeo, friezeMat);
        vLvl.position.set(0, courtFloorY + 8.4 + lvl * vh + vh / 2, -10);
        vLvl.castShadow = true;
        structureGroup.add(vLvl);

        // Miniature Kudus (Horseshoe Arch Niches) on outer tiers
        for (let k = 0; k < 4; k++) {
          const kx = -vw / 2 + (k + 0.5) * (vw / 4);
          const kuduGeo = new THREE.ConeGeometry(0.45, 0.8, 4);
          const kudu = new THREE.Mesh(kuduGeo, friezeMat);
          kudu.position.set(kx, courtFloorY + 8.4 + lvl * vh + vh, -10 + vl / 2);
          kudu.castShadow = true;
          structureGroup.add(kudu);
        }
      }

      // Crowning Octagonal Shikhara Dome & Golden Kalasha Finial
      const octShikharaGeo = new THREE.CylinderGeometry(1.6, 2.5, 2.2, 8);
      const octShikhara = new THREE.Mesh(octShikharaGeo, friezeMat);
      octShikhara.position.set(0, courtFloorY + 8.4 + 5 * 2.4 + 1.1, -10);
      octShikhara.castShadow = true;
      structureGroup.add(octShikhara);

      const kalashaGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const kalasha = new THREE.Mesh(kalashaGeo, goldIconMat);
      kalasha.position.set(0, courtFloorY + 8.4 + 5 * 2.4 + 2.8, -10);
      kalasha.castShadow = true;
      structureGroup.add(kalasha);

      // 6. Detached Nandi Mandapa & Monolithic Rock Bridge
      const nandiBaseGeo = new THREE.BoxGeometry(6.4, 3.6, 6.4);
      const nandiBase = new THREE.Mesh(nandiBaseGeo, stoneMat);
      nandiBase.position.set(0, courtFloorY + 1.8, 14);
      nandiBase.castShadow = true;
      structureGroup.add(nandiBase);

      const nandiRoofGeo = new THREE.BoxGeometry(5.8, 0.8, 5.8);
      const nandiRoof = new THREE.Mesh(nandiRoofGeo, friezeMat);
      nandiRoof.position.set(0, courtFloorY + 7.8, 14);
      structureGroup.add(nandiRoof);

      // 4 Pillars for Nandi Mandapa
      [-2.2, 2.2].forEach((nx) => {
        [-2.2, 2.2].forEach((nz) => {
          const nColGeo = new THREE.BoxGeometry(0.6, 4.2, 0.6);
          const nCol = new THREE.Mesh(nColGeo, friezeMat);
          nCol.position.set(nx, courtFloorY + 5.7, 14 + nz);
          pillarsGroup.add(nCol);
        });
      });

      // Monolithic Suspended Rock Bridge connecting Nandi Mandapa to Sabha Mandapa
      const bridgeGeo = new THREE.BoxGeometry(2.4, 0.7, 5.5);
      const bridge = new THREE.Mesh(bridgeGeo, stoneMat);
      bridge.position.set(0, courtFloorY + 8.0, 8.5);
      bridge.castShadow = true;
      structureGroup.add(bridge);

      // 7. Two Colossal Monolithic Victory Pillars (Dhwaja Stambhas)
      [-9.2, 9.2].forEach((px) => {
        // Base
        const stambhaBaseGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2);
        const stambhaBase = new THREE.Mesh(stambhaBaseGeo, friezeMat);
        stambhaBase.position.set(px, courtFloorY + 1.0, 14);
        pillarsGroup.add(stambhaBase);

        // Monolithic shaft rising 16m
        const stambhaShaftGeo = new THREE.CylinderGeometry(0.65, 0.95, 14.5, 16);
        const stambhaShaft = new THREE.Mesh(stambhaShaftGeo, friezeMat);
        stambhaShaft.position.set(px, courtFloorY + 9.25, 14);
        stambhaShaft.castShadow = true;
        pillarsGroup.add(stambhaShaft);

        // Trident / Kalasha Crown
        const tridentGeo = new THREE.CylinderGeometry(0.2, 0.7, 1.8, 8);
        const trident = new THREE.Mesh(tridentGeo, goldIconMat);
        trident.position.set(px, courtFloorY + 17.2, 14);
        pillarsGroup.add(trident);
      });

      // 8. Front Entrance Rock Gopuram Gateway
      const gopuramGeo = new THREE.BoxGeometry(24, 8, 3.5);
      const gopuram = new THREE.Mesh(gopuramGeo, friezeMat);
      gopuram.position.set(0, courtFloorY + 4.0, 24);
      gopuram.castShadow = true;
      structureGroup.add(gopuram);

      const portalArchGeo = new THREE.TorusGeometry(3.2, 0.4, 8, 24, Math.PI);
      const portalArch = new THREE.Mesh(portalArchGeo, goldIconMat);
      portalArch.position.set(0, courtFloorY + 3.8, 24);
      structureGroup.add(portalArch);

    } else if (geomType === "chariot_mandapa") {
      // -----------------------------------------------------------------------
      // ARCHETYPE 2: CELESTIAL SUN CHARIOT (Konark Sun Temple & Hampi)
      // Monumental Sun Chariot with 24 carved stone wheels & 7 galloping horses
      // -----------------------------------------------------------------------
      // 1. Broad Sandstone Terrace Ground Plinth
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.88,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // 2. Colossal Chariot Platform Plinth (Jagati)
      const plinthGeo = new THREE.BoxGeometry(17, 3.4, 32);
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.set(0, 1.7, -1);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      structureGroup.add(plinth);

      // Carved Plinth Mouldings (Lotus Petal Borders)
      const plinthMouldGeo = new THREE.BoxGeometry(17.8, 0.45, 32.8);
      const plinthMould = new THREE.Mesh(plinthMouldGeo, friezeMat);
      plinthMould.position.set(0, 3.3, -1);
      plinthMould.castShadow = true;
      structureGroup.add(plinthMould);

      // 3. 24 Sculpted Celestial Stone Wheels (12 North, 12 South)
      for (let w = 0; w < 6; w++) {
        const wz = -13 + w * 4.6;
        [-8.8, 8.8].forEach((wx) => {
          // Outer carved beaded rim
          const rimGeo = new THREE.TorusGeometry(1.95, 0.22, 12, 32);
          const rim = new THREE.Mesh(rimGeo, goldIconMat);
          rim.position.set(wx, 2.0, wz);
          rim.rotation.y = Math.PI / 2;
          rim.castShadow = true;
          structureGroup.add(rim);

          // 8 Primary Carved Spokes with Medallions
          for (let sp = 0; sp < 8; sp++) {
            const spAngle = (sp * Math.PI) / 4;
            const spokeGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.85, 8);
            const spoke = new THREE.Mesh(spokeGeo, friezeMat);
            spoke.position.set(wx, 2.0 + Math.sin(spAngle) * 0.9, wz + Math.cos(spAngle) * 0.9);
            spoke.rotation.x = spAngle;
            structureGroup.add(spoke);

            // Carved medallion on spoke
            const medGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8);
            const med = new THREE.Mesh(medGeo, goldIconMat);
            med.position.set(wx > 0 ? wx + 0.05 : wx - 0.05, 2.0 + Math.sin(spAngle) * 1.0, wz + Math.cos(spAngle) * 1.0);
            med.rotation.z = Math.PI / 2;
            structureGroup.add(med);
          }

          // Central decorative wheel axle hub
          const hubGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.65, 16);
          const hub = new THREE.Mesh(hubGeo, friezeMat);
          hub.position.set(wx, 2.0, wz);
          hub.rotation.z = Math.PI / 2;
          hub.castShadow = true;
          structureGroup.add(hub);

          const axlePinGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 8);
          const axlePin = new THREE.Mesh(axlePinGeo, goldIconMat);
          axlePin.position.set(wx, 2.0, wz);
          axlePin.rotation.z = Math.PI / 2;
          structureGroup.add(axlePin);
        });
      }

      // 4. 7 Galloping Celestial Stone Horses Surging Eastward
      for (let h = 0; h < 7; h++) {
        const hx = -6.0 + h * 2.0;
        const hz = 17.5 + (h % 2) * 1.2;

        // Horse Body
        const horseBodyGeo = new THREE.BoxGeometry(0.85, 1.8, 3.2);
        const horseBody = new THREE.Mesh(horseBodyGeo, friezeMat);
        horseBody.position.set(hx, 2.2, hz);
        horseBody.rotation.x = -0.22; // Rearing forward motion
        horseBody.castShadow = true;
        structureGroup.add(horseBody);

        // Horse Head & Neck
        const headGeo = new THREE.BoxGeometry(0.65, 1.4, 1.1);
        const head = new THREE.Mesh(headGeo, friezeMat);
        head.position.set(hx, 3.4, hz + 1.4);
        head.rotation.x = 0.35;
        head.castShadow = true;
        structureGroup.add(head);

        // Ornamental Harness / Reins
        const bridleGeo = new THREE.TorusGeometry(0.38, 0.06, 8, 16);
        const bridle = new THREE.Mesh(bridleGeo, goldIconMat);
        bridle.position.set(hx, 3.5, hz + 1.5);
        bridle.rotation.y = Math.PI / 2;
        structureGroup.add(bridle);
      }

      // 5. Natya Mandapa (Hypostyle Hall of Dance with 16 Apsara Pillars)
      const natyaPlinthGeo = new THREE.BoxGeometry(11, 1.0, 11);
      const natyaPlinth = new THREE.Mesh(natyaPlinthGeo, friezeMat);
      natyaPlinth.position.set(0, 3.9, 9.5);
      structureGroup.add(natyaPlinth);

      for (let nx = -4; nx <= 4; nx += 2.6) {
        for (let nz = 7; nz <= 12; nz += 2.5) {
          const colGeo = new THREE.CylinderGeometry(0.32, 0.42, 3.8, 12);
          const col = new THREE.Mesh(colGeo, friezeMat);
          col.position.set(nx, 5.8, nz);
          col.castShadow = true;
          pillarsGroup.add(col);

          const bracketGeo = new THREE.BoxGeometry(0.85, 0.35, 0.85);
          const bracket = new THREE.Mesh(bracketGeo, goldIconMat);
          bracket.position.set(nx, 7.8, nz);
          pillarsGroup.add(bracket);
        }
      }

      // 6. Jagamohana (Audience Hall) 5-Tier Stepped Pyramidal Roof (Pidha Deula)
      for (let lvl = 0; lvl < 5; lvl++) {
        const jw = 14.5 - lvl * 2.1;
        const jl = 16.5 - lvl * 2.2;
        const jh = 2.4;
        const jRoofGeo = new THREE.BoxGeometry(jw, jh, jl);
        const jRoof = new THREE.Mesh(jRoofGeo, friezeMat);
        jRoof.position.set(0, 4.6 + lvl * jh + jh / 2, -6);
        jRoof.castShadow = true;
        structureGroup.add(jRoof);

        // Cornice moulding along edge
        const corniceGeo = new THREE.BoxGeometry(jw + 0.6, 0.35, jl + 0.6);
        const cornice = new THREE.Mesh(corniceGeo, stoneMat);
        cornice.position.set(0, 4.6 + lvl * jh + jh, -6);
        structureGroup.add(cornice);
      }

      // Colossal Ribbed Stone Amalaka & Golden Kalasha Finial
      const amalakaGeo = new THREE.CylinderGeometry(2.6, 2.6, 1.5, 24);
      const amalaka = new THREE.Mesh(amalakaGeo, friezeMat);
      amalaka.position.set(0, 4.6 + 5 * 2.4 + 0.9, -6);
      amalaka.castShadow = true;
      structureGroup.add(amalaka);

      const kalashaGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const kalasha = new THREE.Mesh(kalashaGeo, goldIconMat);
      kalasha.position.set(0, 4.6 + 5 * 2.4 + 2.5, -6);
      kalasha.castShadow = true;
      structureGroup.add(kalasha);

      // 7. Ceremonial Front Steps Flanked by Royal Guardian Lions
      for (let st = 0; st < 8; st++) {
        const stepGeo = new THREE.BoxGeometry(8.5, 0.42, 0.75);
        const step = new THREE.Mesh(stepGeo, stoneMat);
        step.position.set(0, 3.4 - st * 0.42, 14.8 + st * 0.7);
        step.castShadow = true;
        structureGroup.add(step);
      }

      [-4.6, 4.6].forEach((lx) => {
        const lionGeo = new THREE.BoxGeometry(1.2, 2.2, 1.8);
        const lion = new THREE.Mesh(lionGeo, friezeMat);
        lion.position.set(lx, 2.2, 17.5);
        lion.castShadow = true;
        structureGroup.add(lion);
      });

    } else if (geomType === "octagonal_kund") {
      // -----------------------------------------------------------------------
      // ARCHETYPE 3: MODHERA SUN TEMPLE & SURYA KUND
      // Concentric stepped ghat reservoir with 108 shrines & 52-pillared Sabha Mandapa
      // -----------------------------------------------------------------------
      // Ground Surface
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.92,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // Stepped Kund Basin Tiers
      const kundLevels = 5;
      for (let level = 0; level < kundLevels; level++) {
        const yLevel = -level * (totalDepth / kundLevels);
        const w = 26 - level * (14 / kundLevels);
        const l = 34 - level * (18 / kundLevels);

        // Terrace flat step
        const terraceGeo = new THREE.BoxGeometry(w, 0.7, l);
        const terrace = new THREE.Mesh(terraceGeo, stoneMat);
        terrace.position.set(0, yLevel, 0);
        terrace.receiveShadow = true;
        structureGroup.add(terrace);

        // Miniature Stepped Shrines (Devakulikas) along the 4 edges
        const numShrines = 6;
        for (let s = 0; s < numShrines; s++) {
          const sx = -w / 2 + (s + 0.5) * (w / numShrines);
          [-l / 2, l / 2].forEach((sz) => {
            const shrineBaseGeo = new THREE.BoxGeometry(1.1, 1.4, 1.1);
            const shrineBase = new THREE.Mesh(shrineBaseGeo, friezeMat);
            shrineBase.position.set(sx, yLevel + 0.7, sz);
            shrineBase.castShadow = true;
            structureGroup.add(shrineBase);

            const shikharaGeo = new THREE.ConeGeometry(0.7, 1.5, 4);
            const shikhara = new THREE.Mesh(shikharaGeo, friezeMat);
            shikhara.position.set(sx, yLevel + 2.15, sz);
            shikhara.rotation.y = Math.PI / 4;
            shikhara.castShadow = true;
            structureGroup.add(shikhara);
          });
        }
      }

      // Sacred Lotus Pool at the bottom of the Kund
      const waterColor = twinData?.water_spec?.color || 0x0f766e;
      const waterOpacity = twinData?.water_spec?.opacity || 0.88;
      const poolGeo = new THREE.PlaneGeometry(13, 17);
      const poolMat = new THREE.MeshStandardMaterial({
        color: waterColor,
        roughness: 0.08,
        metalness: 0.9,
        transparent: true,
        opacity: waterOpacity,
      });
      const poolWater = new THREE.Mesh(poolGeo, poolMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.set(0, -totalDepth + 1.2, 0);
      structureGroup.add(poolWater);
      waterMeshRef.current = poolWater;

      // Sabha Mandapa (52 Carved Torana Pillars) at Western Plinth Edge
      const sabhaPlinthGeo = new THREE.CylinderGeometry(9.0, 9.5, 2.2, 8);
      const sabhaPlinth = new THREE.Mesh(sabhaPlinthGeo, stoneMat);
      sabhaPlinth.position.set(0, 1.1, -22);
      sabhaPlinth.castShadow = true;
      structureGroup.add(sabhaPlinth);

      // 52 Intricately Carved Pillars in Concentric Octagons
      for (let ring = 0; ring < 2; ring++) {
        const radius = ring === 0 ? 5.2 : 7.8;
        const count = ring === 0 ? 8 : 16;
        for (let p = 0; p < count; p++) {
          const angle = (p * Math.PI * 2) / count;
          const px = Math.cos(angle) * radius;
          const pz = -22 + Math.sin(angle) * radius;

          const pColGeo = new THREE.CylinderGeometry(0.32, 0.42, 4.2, 16);
          const pCol = new THREE.Mesh(pColGeo, friezeMat);
          pCol.position.set(px, 4.3, pz);
          pCol.castShadow = true;
          pillarsGroup.add(pCol);

          // Cusped torana arch between outer pillars
          if (ring === 1 && p % 2 === 0) {
            const archGeo = new THREE.TorusGeometry(1.6, 0.16, 8, 16, Math.PI);
            const arch = new THREE.Mesh(archGeo, goldIconMat);
            arch.position.set(px, 6.2, pz);
            arch.rotation.y = angle + Math.PI / 2;
            pillarsGroup.add(arch);
          }
        }
      }

      // Sabha Mandapa Stepped Pyramidal Roof
      const sabhaRoofGeo = new THREE.ConeGeometry(8.2, 4.6, 8);
      const sabhaRoof = new THREE.Mesh(sabhaRoofGeo, friezeMat);
      sabhaRoof.position.set(0, 8.6, -22);
      sabhaRoof.castShadow = true;
      structureGroup.add(sabhaRoof);

      // Kirti Torana (Arch of Triumph) at Eastern Approach
      const kirtiToranaGeo = new THREE.TorusGeometry(3.6, 0.38, 12, 32, Math.PI);
      const kirtiTorana = new THREE.Mesh(kirtiToranaGeo, friezeMat);
      kirtiTorana.position.set(0, 3.6, 20);
      kirtiTorana.castShadow = true;
      structureGroup.add(kirtiTorana);

    } else if (geomType === "stepped_pyramid_baori") {
      // -----------------------------------------------------------------------
      // ARCHETYPE 4: CHAND BAORI (Abhaneri, Rajasthan)
      // 13-Tier Geometric Chevron Zigzag Step Maze with North Royal Palace
      // -----------------------------------------------------------------------
      // Retaining Well Trench Box
      const pitGeo = new THREE.BoxGeometry(28, totalDepth + 4, 30);
      const pitMat = new THREE.MeshStandardMaterial({
        color: 0x131a29,
        roughness: 0.95,
        side: THREE.BackSide,
      });
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.position.set(0, -(totalDepth + 4) / 2, 0);
      pit.receiveShadow = true;
      structureGroup.add(pit);

      // Ground Surface
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.92,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // 13 Tiers of Interlocking Chevron Zigzag Stairs (3 Sides: South, East, West)
      const baoriLevels = 10;
      for (let level = 0; level < baoriLevels; level++) {
        const yLevel = -level * (totalDepth / baoriLevels);
        const w = 24 - level * (16 / baoriLevels);
        const l = 26 - level * (18 / baoriLevels);

        // Terrace Step
        const bStepGeo = new THREE.BoxGeometry(w, 0.45, l);
        const bStep = new THREE.Mesh(bStepGeo, stoneMat);
        bStep.position.set(0, yLevel, 0);
        bStep.receiveShadow = true;
        structureGroup.add(bStep);

        // Chevron Triangular Zigzag Steps
        for (let c = 0; c < 6; c++) {
          const cx = -w / 2 + (c + 0.5) * (w / 6);
          const chevronGeo = new THREE.ConeGeometry(1.1, 1.4, 4);
          const chevron = new THREE.Mesh(chevronGeo, friezeMat);
          chevron.position.set(cx, yLevel + 0.55, l / 2);
          chevron.rotation.y = Math.PI / 4;
          chevron.castShadow = true;
          structureGroup.add(chevron);
        }
      }

      // North Royal Pavilion Palace (Hawa Mahal Facade overlooking Steps)
      const palaceHeight = totalDepth + 2;
      const palaceGeo = new THREE.BoxGeometry(24, palaceHeight, 5.0);
      const palace = new THREE.Mesh(palaceGeo, friezeMat);
      palace.position.set(0, -totalDepth / 2 + 1, -12);
      palace.castShadow = true;
      structureGroup.add(palace);

      // Multi-Storey Jharokhas (Projecting Arched Balconies)
      for (let storey = 0; storey < 3; storey++) {
        const jy = -totalDepth + 4.5 + storey * 5.2;
        [-6, 0, 6].forEach((jx) => {
          const jharokhaGeo = new THREE.BoxGeometry(2.4, 3.2, 1.4);
          const jharokha = new THREE.Mesh(jharokhaGeo, friezeMat);
          jharokha.position.set(jx, jy, -9.2);
          jharokha.castShadow = true;
          structureGroup.add(jharokha);

          const archDomeGeo = new THREE.SphereGeometry(1.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const archDome = new THREE.Mesh(archDomeGeo, goldIconMat);
          archDome.position.set(jx, jy + 1.8, -9.2);
          structureGroup.add(archDome);
        });
      }

      // Deep Subterranean Aquifer Water Surface
      const waterColor = twinData?.water_spec?.color || 0x0284c7;
      const waterOpacity = twinData?.water_spec?.opacity || 0.88;
      const waterGeo = new THREE.PlaneGeometry(8, 9);
      const waterMat = new THREE.MeshStandardMaterial({
        color: waterColor,
        roughness: 0.08,
        metalness: 0.9,
        transparent: true,
        opacity: waterOpacity,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -totalDepth + 1.2, 1);
      structureGroup.add(water);
      waterMeshRef.current = water;

    } else {
      // -----------------------------------------------------------------------
      // ARCHETYPE 5: LINEAR STEPPED TEMPLE CORRIDOR (Rani Ki Vav & Adalaj Ni Vav)
      // 7-Tier Inverted Subterranean Temple Corridor with 16-Sided Fluted Columns
      // -----------------------------------------------------------------------
      const tierSpacing = (totalDepth - 4.5) / Math.max(1, numTiers - 1);
      const tierDepths = Array.from({ length: numTiers }, (_, i) => -i * tierSpacing);
      const columnOffsets = [
        [-3.2, -2.0],
        [3.2, -2.0],
        [-3.2, 2.0],
        [3.2, 2.0],
      ];

      // Subterranean Excavation Retaining Box Trench
      const pitGeo = new THREE.BoxGeometry(17.6, totalDepth + 4, 46.5);
      const pitMat = new THREE.MeshStandardMaterial({
        color: 0x131a29,
        roughness: 0.95,
        side: THREE.BackSide,
      });
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.position.set(0, -(totalDepth + 4) / 2, 0);
      pit.receiveShadow = true;
      structureGroup.add(pit);

      // Ground Surface Plinth
      const groundGeo = new THREE.PlaneGeometry(160, 160);
      const groundMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.92,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      structureGroup.add(ground);

      // Retaining Wall Zig-Zag Ghat Steps
      for (let side = -1; side <= 1; side += 2) {
        for (let level = 0; level < numTiers; level++) {
          const yBase = -level * (totalDepth / numTiers);
          for (let i = 0; i < 4; i++) {
            const stepPyramidGeo = new THREE.ConeGeometry(1.65, 2.3, 4);
            const stepPyramid = new THREE.Mesh(stepPyramidGeo, friezeMat);
            stepPyramid.position.set(side * 7.45, yBase - 1.2, 12 - level * (30 / numTiers) + (i - 1.5) * 2.5);
            stepPyramid.rotation.y = Math.PI / 4;
            stepPyramid.castShadow = true;
            stepPyramid.receiveShadow = true;
            structureGroup.add(stepPyramid);
          }
        }
      }

      // Dynamic Tiers of Pavilions (Mandapas) with Ornate Columns & Arches
      tierDepths.forEach((yDepth, tierIdx) => {
        const zPos = 16 - tierIdx * (30 / Math.max(1, numTiers - 1));

        // Gallery Floor
        const floorGeo = new THREE.BoxGeometry(8.8, 0.75, 6.6);
        const floor = new THREE.Mesh(floorGeo, stoneMat);
        floor.position.set(0, yDepth, zPos);
        floor.receiveShadow = true;
        floor.castShadow = true;
        structureGroup.add(floor);

        // Stone Balustrade (Vedika) on flanks
        [-3.9, 3.9].forEach((bx) => {
          const balustradeGeo = new THREE.BoxGeometry(0.4, 0.95, 6.4);
          const balustrade = new THREE.Mesh(balustradeGeo, friezeMat);
          balustrade.position.set(bx, yDepth + 0.8, zPos);
          balustrade.castShadow = true;
          structureGroup.add(balustrade);
        });

        // Flights of Stairs (Descending toward north)
        if (tierIdx < tierDepths.length - 1) {
          for (let s = 0; s < 7; s++) {
            const stepGeo = new THREE.BoxGeometry(6.6, 0.42, 0.72);
            const step = new THREE.Mesh(stepGeo, stoneMat);
            step.position.set(0, yDepth - (s + 1) * (tierSpacing / 7.2), zPos - 2.8 - s * 0.62);
            step.receiveShadow = true;
            step.castShadow = true;
            structureGroup.add(step);
          }
        }

        // Pillars per Tier (Solanki 16-Sided Fluted Columns with Bracket Capitals)
        columnOffsets.forEach(([px, pz]) => {
          const baseGeo = new THREE.CylinderGeometry(0.55, 0.68, 0.65, 8);
          const base = new THREE.Mesh(baseGeo, friezeMat);
          base.position.set(px, yDepth + 0.68, zPos + pz);
          base.castShadow = true;
          pillarsGroup.add(base);

          const shaftColGeo = new THREE.CylinderGeometry(0.38, 0.46, 3.6, 16);
          const colShaft = new THREE.Mesh(shaftColGeo, stoneMat);
          colShaft.position.set(px, yDepth + 2.65, zPos + pz);
          colShaft.castShadow = true;
          colShaft.receiveShadow = true;
          pillarsGroup.add(colShaft);

          const capitalGeo = new THREE.BoxGeometry(1.45, 0.45, 1.45);
          const capital = new THREE.Mesh(capitalGeo, friezeMat);
          capital.position.set(px, yDepth + 4.55, zPos + pz);
          capital.castShadow = true;
          pillarsGroup.add(capital);
        });

        // Transverse Carved Stone Lintels
        [-2.0, 2.0].forEach((lz) => {
          const lintelGeo = new THREE.BoxGeometry(7.9, 0.55, 0.88);
          const lintel = new THREE.Mesh(lintelGeo, friezeMat);
          lintel.position.set(0, yDepth + 4.88, zPos + lz);
          lintel.castShadow = true;
          pillarsGroup.add(lintel);
        });

        // Cusped Torana Arch
        const toranaArchGeo = new THREE.TorusGeometry(3.2, 0.24, 8, 24, Math.PI);
        const arch = new THREE.Mesh(toranaArchGeo, friezeMat);
        arch.position.set(0, yDepth + 4.35, zPos);
        arch.castShadow = true;
        pillarsGroup.add(arch);
      });

      // Octagonal Subterranean Light-Well Shaft at Western End
      const shaftRadius = 5.6;
      const octShaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, totalDepth + 2, 8, 1, true);
      const octShaftMat = new THREE.MeshStandardMaterial({
        map: sandstoneTex,
        color: sandstoneHex,
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      const octShaft = new THREE.Mesh(octShaftGeo, octShaftMat);
      octShaft.position.set(0, -totalDepth / 2, -8);
      octShaft.castShadow = true;
      octShaft.receiveShadow = true;
      shaftGroup.add(octShaft);

      // Multi-Tier Balconies (Jharokhas) & Golden Niches inside Octagonal Shaft
      for (let r = 0; r < 8; r++) {
        const angle = (r * Math.PI * 2) / 8;
        const nx = Math.cos(angle) * (shaftRadius - 0.25);
        const nz = -8 + Math.sin(angle) * (shaftRadius - 0.25);

        // Niche Frame
        const nicheGeo = new THREE.BoxGeometry(1.1, 2.3, 0.55);
        const niche = new THREE.Mesh(nicheGeo, friezeMat);
        niche.position.set(nx, -14, nz);
        niche.rotation.y = -angle + Math.PI / 2;
        niche.castShadow = true;
        shaftGroup.add(niche);

        // Golden Idol (Vishnu / Dashavatara / Apsara) inside Niche
        const idolGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.25, 8);
        const idol = new THREE.Mesh(idolGeo, goldIconMat);
        idol.position.set(nx * 0.95, -14, nz * 0.95);
        idol.castShadow = true;
        shaftGroup.add(idol);
      }

      // Volumetric Sun Shaft Cone (God Ray through Octagonal Oculus)
      const coneGeo = new THREE.CylinderGeometry(2.8, 5.5, 25, 24, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const sunShaftCone = new THREE.Mesh(coneGeo, coneMat);
      sunShaftCone.position.set(0, -11, -8);
      structureGroup.add(sunShaftCone);
      sunShaftConeRef.current = sunShaftCone;

      // Subterranean Cistern Water Surface with Submerged Steps
      const waterColor = twinData?.water_spec?.color || 0x0284c7;
      const waterOpacity = twinData?.water_spec?.opacity || 0.88;
      const waterGeo = new THREE.CircleGeometry(5.2, 48);
      const waterMat = new THREE.MeshStandardMaterial({
        color: waterColor,
        roughness: 0.08,
        metalness: 0.9,
        transparent: true,
        opacity: waterOpacity,
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -totalDepth + 1.8, -8);
      water.receiveShadow = true;
      structureGroup.add(water);
      waterMeshRef.current = water;

      // Surface Entrance Gateway Torana Arch
      const mainToranaGeo = new THREE.TorusGeometry(3.6, 0.35, 12, 32, Math.PI);
      const mainTorana = new THREE.Mesh(mainToranaGeo, friezeMat);
      mainTorana.position.set(0, 3.6, 16);
      mainTorana.castShadow = true;
      structureGroup.add(mainTorana);
    }

    // Floating Atmospheric Dust Motes (Available across all archetypes)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 18;
      particlePositions[p * 3 + 1] = -Math.random() * (totalDepth || 24);
      particlePositions[p * 3 + 2] = -8 + (Math.random() - 0.5) * 28;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    structureGroup.add(dustParticles);
    dustParticlesRef.current = dustParticles;

    // =========================================================================
    // 3. LIGHTING (Directional Sun & Warm Torches)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.68);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const sunGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const sunMeshMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunMesh = new THREE.Mesh(sunGeo, sunMeshMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Subterranean Flaming Wall Torches (Mashaals with Point Lights)
    const torch1 = new THREE.PointLight(0xf97316, 2.8, 14, 1.4);
    torch1.position.set(0, -15, -6);
    torchesGroup.add(torch1);

    const torch2 = new THREE.PointLight(0xf97316, 2.2, 12, 1.4);
    torch2.position.set(0, -9.6, 8);
    torchesGroup.add(torch2);

    // Decorative Torch Brackets
    [torch1.position, torch2.position].forEach((pos) => {
      const sconceGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
      const sconce = new THREE.Mesh(sconceGeo, goldIconMat);
      sconce.position.copy(pos);
      sconce.position.y -= 0.4;
      torchesGroup.add(sconce);

      const flameGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.copy(pos);
      torchesGroup.add(flame);
    });

    // =========================================================================
    // 4. MOUSE ORBITAL CONTROLS & EVENT LISTENERS
    // =========================================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.85;
    let sphericalPhi = 0.82;
    let sphericalRadius = 44;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      setIsAutoRotate(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.007;
      sphericalPhi = Math.max(0.12, Math.min(Math.PI / 2.05, sphericalPhi - deltaY * 0.007));

      targetCamPosRef.current.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      targetCamPosRef.current.y = sphericalRadius * Math.cos(sphericalPhi) - 6;
      targetCamPosRef.current.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      sphericalRadius = Math.max(14, Math.min(75, sphericalRadius + e.deltaY * 0.04));
      targetCamPosRef.current.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      targetCamPosRef.current.y = sphericalRadius * Math.cos(sphericalPhi) - 6;
      targetCamPosRef.current.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // =========================================================================
    // 5. ANIMATION & RENDER LOOP
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const getTourWaypoints = () => {
      if (geomType === "himalayan_shikhara") {
        return [
          { pos: new THREE.Vector3(0, 4, 26), look: new THREE.Vector3(0, 4, 16) },
          { pos: new THREE.Vector3(12, 8, 12), look: new THREE.Vector3(5, 10, 13) },
          { pos: new THREE.Vector3(16, 14, -4), look: new THREE.Vector3(0, 12, -7) },
          { pos: new THREE.Vector3(-14, 8, 6), look: new THREE.Vector3(0, 7, 5) },
          { pos: new THREE.Vector3(26, 22, 28), look: new THREE.Vector3(0, 10, -20) },
        ];
      } else if (geomType === "nagara_shikhara") {
        return [
          { pos: new THREE.Vector3(0, 5, 26), look: new THREE.Vector3(0, 4, 16) },
          { pos: new THREE.Vector3(16, 8, 6), look: new THREE.Vector3(0, 6, 2) },
          { pos: new THREE.Vector3(18, 16, -6), look: new THREE.Vector3(0, 12, -6) },
          { pos: new THREE.Vector3(-14, 4, 0), look: new THREE.Vector3(0, 2, 0) },
          { pos: new THREE.Vector3(26, 22, 28), look: new THREE.Vector3(0, 6, 0) },
        ];
      } else if (geomType === "dravidian_gopuram") {
        return [
          { pos: new THREE.Vector3(0, 18, 28), look: new THREE.Vector3(0, 12, 14) },
          { pos: new THREE.Vector3(16, 12, -6), look: new THREE.Vector3(0, 8, -8) },
          { pos: new THREE.Vector3(8, 4, 4), look: new THREE.Vector3(0, 3, 0) },
          { pos: new THREE.Vector3(-14, 4, 0), look: new THREE.Vector3(0, 2, 0) },
          { pos: new THREE.Vector3(32, 26, 32), look: new THREE.Vector3(0, 8, 0) },
        ];
      } else if (geomType === "monolithic_rockcut") {
        return [
          { pos: new THREE.Vector3(26, 12, 28), look: new THREE.Vector3(0, -6, 8) },
          { pos: new THREE.Vector3(14, -6, 18), look: new THREE.Vector3(-9, -2, 14) },
          { pos: new THREE.Vector3(0, -2, 18), look: new THREE.Vector3(0, 0, 8) },
          { pos: new THREE.Vector3(12, 6, -4), look: new THREE.Vector3(0, 8, -10) },
          { pos: new THREE.Vector3(-14, -8, -4), look: new THREE.Vector3(-8, -12, -4) },
          { pos: new THREE.Vector3(28, 22, 28), look: new THREE.Vector3(0, -6, 0) },
        ];
      } else if (geomType === "chariot_mandapa") {
        return [
          { pos: new THREE.Vector3(0, 5, 28), look: new THREE.Vector3(0, 3, 14) },
          { pos: new THREE.Vector3(16, 5, 6), look: new THREE.Vector3(8, 2, -2) },
          { pos: new THREE.Vector3(10, 8, 12), look: new THREE.Vector3(0, 6, 9) },
          { pos: new THREE.Vector3(18, 16, -6), look: new THREE.Vector3(0, 12, -6) },
          { pos: new THREE.Vector3(-16, 6, -2), look: new THREE.Vector3(-8, 2, -2) },
          { pos: new THREE.Vector3(26, 20, 26), look: new THREE.Vector3(0, 4, 0) },
        ];
      } else if (geomType === "octagonal_kund") {
        return [
          { pos: new THREE.Vector3(0, 6, 26), look: new THREE.Vector3(0, 2, 12) },
          { pos: new THREE.Vector3(16, 4, 14), look: new THREE.Vector3(0, -4, 0) },
          { pos: new THREE.Vector3(0, -6, 4), look: new THREE.Vector3(0, -12, 0) },
          { pos: new THREE.Vector3(-12, 6, -18), look: new THREE.Vector3(0, 4, -22) },
          { pos: new THREE.Vector3(26, 22, 26), look: new THREE.Vector3(0, -4, 0) },
        ];
      } else if (geomType === "stepped_pyramid_baori") {
        return [
          { pos: new THREE.Vector3(18, 12, 20), look: new THREE.Vector3(0, -6, 0) },
          { pos: new THREE.Vector3(0, 0, -4), look: new THREE.Vector3(0, -4, -12) },
          { pos: new THREE.Vector3(-10, -8, 10), look: new THREE.Vector3(0, -12, 0) },
          { pos: new THREE.Vector3(0, -14, 2), look: new THREE.Vector3(0, -18, 0) },
          { pos: new THREE.Vector3(24, 22, 24), look: new THREE.Vector3(0, -8, 0) },
        ];
      } else {
        return [
          { pos: new THREE.Vector3(26, 16, 28), look: new THREE.Vector3(0, 0, 12) },
          { pos: new THREE.Vector3(12, 5, 20), look: new THREE.Vector3(0, -2, 14) },
          { pos: new THREE.Vector3(-4, -1, 14), look: new THREE.Vector3(-2.8, -4.5, 9) },
          { pos: new THREE.Vector3(0, -7, 4), look: new THREE.Vector3(0, -13, -8) },
          { pos: new THREE.Vector3(2, -15, -3), look: new THREE.Vector3(0, -21, -8) },
          { pos: new THREE.Vector3(0, -20, -3), look: new THREE.Vector3(0, -22.5, -8) },
        ];
      }
    };

    const tourWaypoints = getTourWaypoints();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Water Ripple Oscillation
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -totalDepth + 1.8 + Math.sin(elapsedTime * 1.6) * 0.06;
      }

      // Torches Flame Flickering
      torch1.intensity = 2.8 + Math.sin(elapsedTime * 6.5) * 0.45;
      torch2.intensity = 2.2 + Math.cos(elapsedTime * 5.8) * 0.35;

      // Dust Motes Slow Upward Drift
      if (dustParticlesRef.current) {
        const positions = dustParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += 0.012;
          if (positions[i] > 1) positions[i] = -24;
        }
        dustParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Auto-Rotate Turntable
      if (isAutoRotate && !isTourPlaying) {
        autoRotateAngleRef.current += 0.003;
        targetCamPosRef.current.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(autoRotateAngleRef.current);
        targetCamPosRef.current.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(autoRotateAngleRef.current);
      }

      // Guided Walkthrough Camera Flight
      if (isTourPlaying) {
        tourProgressRef.current += 0.0022;
        if (tourProgressRef.current >= tourWaypoints.length - 1) {
          tourProgressRef.current = 0;
        }

        const currIdx = Math.floor(tourProgressRef.current);
        const nextIdx = (currIdx + 1) % tourWaypoints.length;
        const segmentProgress = tourProgressRef.current - currIdx;

        camera.position.lerpVectors(tourWaypoints[currIdx].pos, tourWaypoints[nextIdx].pos, segmentProgress);
        const currentLookAt = new THREE.Vector3().lerpVectors(
          tourWaypoints[currIdx].look,
          tourWaypoints[nextIdx].look,
          segmentProgress
        );
        camera.lookAt(currentLookAt);
      } else {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        camera.lookAt(targetLookAtRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [isTourPlaying, isAutoRotate, twinData]);

  // =========================================================================
  // 6. DYNAMIC UPDATES (Sun Raytracer, Render Modes, Layer Toggles)
  // =========================================================================

  // Update Sun Lighting from Slider (7 AM to 6 PM)
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current) return;

    const normalizedHour = (timeHour - 7) / 11;
    const angle = normalizedHour * Math.PI;

    const sunDist = 44;
    const sunX = Math.cos(angle) * sunDist * 0.9;
    const sunY = Math.sin(angle) * sunDist * 0.85 + 2;
    const sunZ = Math.sin(angle * 0.8) * 14 - 4;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.lookAt(0, -10, -4);
    sunMeshRef.current.position.set(sunX, sunY, sunZ);

    if (timeHour < 9 || timeHour > 16.5) {
      sunLightRef.current.color.setHex(0xfdba74);
      sunLightRef.current.intensity = 2.0;
      if (sunShaftConeRef.current) {
        (sunShaftConeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05;
      }
    } else {
      sunLightRef.current.color.setHex(0xfffbeb);
      sunLightRef.current.intensity = 3.4;
      if (sunShaftConeRef.current) {
        (sunShaftConeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18;
      }
    }
  }, [timeHour]);

  // Update Render Modes (Realistic Sandstone, X-Ray Cutaway, LiDAR Laser Scan)
  useEffect(() => {
    if (!structureGroupRef.current) return;

    structureGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (renderMode === "realistic") {
          const selected = epochs[epochIndex];
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.wireframe = false;
            child.material.transparent = false;
            child.material.opacity = 1.0;
            if (child === waterMeshRef.current) {
              child.material.transparent = true;
              child.material.opacity = 0.88;
            } else if (child.name !== "pit") {
              child.material.color.setHex(selected.sandstoneHex);
            }
          }
        } else if (renderMode === "xray") {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.wireframe = false;
            child.material.transparent = true;
            child.material.opacity = 0.35;
            child.material.color.setHex(0x38bdf8); // neon cyan
          }
        } else if (renderMode === "lidar") {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.wireframe = true;
            child.material.transparent = true;
            child.material.opacity = 0.8;
            child.material.color.setHex(0x34d399); // emerald lidar
          }
        }
      }
    });

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(
        renderMode === "lidar" ? 0x02130e : renderMode === "xray" ? 0x031326 : 0x060913
      );
    }
  }, [renderMode, epochIndex]);

  // Architectural Layer Visibility
  useEffect(() => {
    if (pillarsGroupRef.current) pillarsGroupRef.current.visible = layerPillars;
    if (shaftGroupRef.current) shaftGroupRef.current.visible = layerShaft;
    if (waterMeshRef.current) waterMeshRef.current.visible = layerWater;
    if (sunShaftConeRef.current) sunShaftConeRef.current.visible = layerRays;
    if (dustParticlesRef.current) dustParticlesRef.current.visible = layerRays;
    if (torchesGroupRef.current) torchesGroupRef.current.visible = layerTorches;
  }, [layerPillars, layerShaft, layerWater, layerRays, layerTorches]);

  // Handle Hotspot (POI) Flyto
  const handleSelectPoi = (poi: POI) => {
    setSelectedPoi(poi);
    setIsTourPlaying(false);
    setIsAutoRotate(false);
    targetCamPosRef.current.set(...poi.camPos);
    targetLookAtRef.current.set(...poi.lookAt);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 3D Spatial Audio Synthesizer (Web Audio API)
  const playSpatialAcoustic = (type: "water" | "bell" | "ambient_toggle") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const depthReverbScale = Math.max(0.6, currentDepth / 6);

      if (type === "ambient_toggle") {
        if (ambientAudioActive && droneNodesRef.current) {
          droneNodesRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          setTimeout(() => {
            droneNodesRef.current?.osc1.stop();
            droneNodesRef.current?.osc2.stop();
            droneNodesRef.current = null;
          }, 500);
          setAmbientAudioActive(false);
        } else {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(55, now);
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(55.8, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(140, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.15, now + 1.5);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          droneNodesRef.current = { osc1, osc2, gain };
          setAmbientAudioActive(true);
        }
        return;
      }

      if (type === "water") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + depthReverbScale * 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2 + depthReverbScale * 0.4);
      } else if (type === "bell") {
        const frequencies = [440, 880, 1320, 1760];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq + (idx === 1 ? 4 : 0), now);

          const decay = (1.5 + depthReverbScale) / (idx + 1);
          gain.gain.setValueAtTime(0.2 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + decay);
        });
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  const formatTime = (h: number) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const period = hr >= 12 ? "PM" : "AM";
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    return `${displayHr}:${min.toString().padStart(2, "0")} ${period}`;
  };

  const currentEpoch = epochs[epochIndex];

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      }`}
    >
      {/* 1. Header HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 border border-amber-400/50 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-white tracking-wide">
                {twinData?.name || "Adalaj Subterranean Stepwell 3D Digital Twin"}
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                {twinData?.dynasty || "Solanki Architecture"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {twinData?.tiers_count || 5}-Tier Pavilion Corridor • Octagonal Light Shaft • {twinData?.depth_meters || 24.5}m Depth • Procedural Stone Masonry
            </p>
          </div>
        </div>

        {/* View Mode Switcher: Realistic / X-Ray / LiDAR */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setRenderMode("realistic")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                renderMode === "realistic"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏛️ Stone
            </button>
            <button
              onClick={() => setRenderMode("xray")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                renderMode === "xray"
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📐 X-Ray
            </button>
            <button
              onClick={() => setRenderMode("lidar")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                renderMode === "lidar"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ LiDAR
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-xs"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas */}
      <div
        ref={containerRef}
        className={`w-full ${isFullscreen ? "h-screen" : "h-[540px]"} cursor-grab active:cursor-grabbing block`}
      />

      {/* 3. Floating Left Bar: Architectural Hotspots */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5 hidden sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur w-fit shadow-xs">
          Architectural Hotspots (POIs)
        </span>
        <div className="flex flex-col gap-1.5">
          {pois.map((poi) => (
            <button
              key={poi.id}
              onClick={() => handleSelectPoi(poi)}
              className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur transition-all flex items-center gap-2 border ${
                selectedPoi?.id === poi.id
                  ? "bg-amber-950/90 border-amber-500 text-amber-200 ring-2 ring-amber-500/20 shadow-lg"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate max-w-[170px]">
                <div className="font-bold text-[11px] truncate">{poi.name}</div>
                <div className="text-[9px] text-slate-400">{poi.elevation}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Hotspot Archaeological Telemetry Modal */}
      {selectedPoi && (
        <div className="absolute bottom-40 left-4 right-4 md:right-auto md:max-w-md z-20 bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {selectedPoi.tier} • Elevation: {selectedPoi.elevation}
            </span>
            <button
              onClick={() => setSelectedPoi(null)}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              ✕ Close
            </button>
          </div>
          <h4 className="font-extrabold text-sm text-white">{selectedPoi.name}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedPoi.description}</p>
        </div>
      )}

      {/* 5. Subterranean Telemetry HUD (Right Side) */}
      <div className="absolute top-20 right-4 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 backdrop-blur space-y-2 max-w-[210px] pointer-events-none hidden sm:block shadow-xl">
        <div className="flex items-center justify-between text-amber-400 font-semibold border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            Shaft Penetration
          </span>
          <span>{timeHour >= 11 && timeHour <= 13 ? "Direct Bore" : "Oblique Ray"}</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Sun Altitude:</span>
            <span className="font-mono font-bold text-white">
              {(Math.sin(((timeHour - 7) / 11) * Math.PI) * 78).toFixed(1)}°
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ray Reaches:</span>
            <span className="font-semibold text-emerald-400">
              {timeHour >= 11 && timeHour <= 13.5 ? "Tier 5 (-22m Cistern)" : "Tier 2 (-8m Pavilion)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Chamber Temp:</span>
            <span className="font-mono text-sky-300 font-bold">
              {32 - Math.round(currentDepth * 0.25)}°C (Cooling)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Acoustic Decay:</span>
            <span className="font-mono text-purple-300 font-bold">
              {(0.4 + (currentDepth / 6) * 0.8).toFixed(1)}s Reverb
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Master Controls: Layer Dissection, Walkthrough, Time Travel & Sun Sliders */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 space-y-4">
        {/* Row A: Walkthrough, Auto-Rotate & Audio Synthesizer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTourPlaying(!isTourPlaying);
                setSelectedPoi(null);
                setIsAutoRotate(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isTourPlaying
                  ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400/50"
                  : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              }`}
            >
              {isTourPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Walkthrough</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>Start 3D Walkthrough</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsAutoRotate(!isAutoRotate);
                setIsTourPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAutoRotate
                  ? "bg-amber-950/80 border-amber-500 text-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
            >
              🔄 Auto-Rotate
            </button>
          </div>

          {/* Architectural Layer Dissection Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <span className="text-slate-400 px-1.5 hidden md:inline">Layers:</span>
            <button
              onClick={() => setLayerPillars(!layerPillars)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                layerPillars ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-500"
              }`}
            >
              Pillars
            </button>
            <button
              onClick={() => setLayerShaft(!layerShaft)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                layerShaft ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-500"
              }`}
            >
              Shaft
            </button>
            <button
              onClick={() => setLayerWater(!layerWater)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                layerWater ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-500"
              }`}
            >
              Cistern
            </button>
            <button
              onClick={() => setLayerRays(!layerRays)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                layerRays ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "text-slate-500"
              }`}
            >
              God Rays
            </button>
            <button
              onClick={() => setLayerTorches(!layerTorches)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                layerTorches ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-slate-500"
              }`}
            >
              Torches
            </button>
          </div>

          {/* Spatial Audio Synthesizer */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => playSpatialAcoustic("ambient_toggle")}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                ambientAudioActive
                  ? "bg-purple-950 border-purple-500 text-purple-200"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              }`}
              title="Toggle Subterranean Cavern Atmosphere"
            >
              <Volume2 className={`w-3.5 h-3.5 ${ambientAudioActive ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
              <span>{ambientAudioActive ? "Cavern Sound On" : "Cavern Atmosphere"}</span>
            </button>

            <button
              onClick={() => playSpatialAcoustic("water")}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 flex items-center gap-1 transition-all"
              title="Trigger Water Droplet Reverb"
            >
              <span>💧 Drop Echo</span>
            </button>
            <button
              onClick={() => playSpatialAcoustic("bell")}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1 transition-all"
              title="Trigger Temple Bell Resonance"
            >
              <span>🔔 Bell Reverb</span>
            </button>
          </div>
        </div>

        {/* Row B: 4D Time-Travel Epoch Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                4D Time-Travel Epoch:
              </span>
              <span className="text-sm font-extrabold text-purple-400">
                {currentEpoch.year} — {currentEpoch.name}
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Patron: {currentEpoch.patron}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {epochs.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => {
                  setEpochIndex(idx);
                  if (onEpochChange) onEpochChange(ep.id);
                }}
                className={`py-2 px-2.5 text-center rounded-xl border text-xs font-bold transition-all ${
                  epochIndex === idx
                    ? "bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-500/30 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <div>{ep.year}</div>
                <div className="text-[10px] font-normal truncate opacity-80">{ep.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Row C: Diurnal Sun Slider & Subterranean Elevation Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Subterranean Sun Path:
              </span>
              <span className="font-bold text-amber-400">{formatTime(timeHour)}</span>
            </div>
            <input
              type="range"
              min="7.0"
              max="18.0"
              step="0.25"
              value={timeHour}
              onChange={(e) => setTimeHour(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>07:00 AM (Sunrise)</span>
              <span>12:00 PM (Solar Noon)</span>
              <span>06:00 PM (Sunset)</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Subterranean Depth View:
              </span>
              <span className="font-bold text-sky-400">-{currentDepth} meters depth</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={currentDepth}
              onChange={(e) => {
                const d = parseInt(e.target.value);
                setCurrentDepth(d);
                targetCamPosRef.current.y = 10 - d;
                targetLookAtRef.current.set(0, -d, -4);
                if (onDepthChange) onDepthChange(d);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Ground (0m)</span>
              <span>Pavilion Tier 3 (-12m)</span>
              <span>Deep Cistern (-24m)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dharohar3DTwin;