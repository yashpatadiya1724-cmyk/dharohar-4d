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
  const epochs = [
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
  const pois: POI[] = [
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
    const sandstoneTex = createSandstoneTexture();
    const friezeTex = createFriezeTexture();

    const stoneMat = new THREE.MeshStandardMaterial({
      map: sandstoneTex,
      color: 0xd4a359,
      roughness: 0.75,
      metalness: 0.06,
    });
    materialsRef.current.stone = stoneMat;

    const friezeMat = new THREE.MeshStandardMaterial({
      map: friezeTex,
      color: 0xc4934e,
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
    // 2. PROCEDURAL ARCHITECTURAL MODEL (Maru-Gurjara Subterranean Stepwell)
    // =========================================================================

    // A. Subterranean Excavation Retaining Box Trench
    const pitGeo = new THREE.BoxGeometry(17.6, 26, 46.5);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x131a29,
      roughness: 0.95,
      side: THREE.BackSide,
    });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, -12, 0);
    pit.receiveShadow = true;
    structureGroup.add(pit);

    // Ground Surface Plinth Surrounding the Well Trench
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.92,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    structureGroup.add(ground);

    // Low Carved Parapet Wall around the Ground Aperture
    const parapetGeo = new THREE.BoxGeometry(17.8, 1.2, 46.8);
    const parapet = new THREE.Mesh(parapetGeo, friezeMat);
    parapet.position.set(0, 0.6, 0);
    parapet.castShadow = true;
    structureGroup.add(parapet);

    // B. Retaining Wall Zig-Zag Ghat Steps (Stepped Triangular Pyramids)
    for (let side = -1; side <= 1; side += 2) {
      for (let level = 0; level < 5; level++) {
        const yBase = -level * 4.8;
        for (let i = 0; i < 4; i++) {
          const stepPyramidGeo = new THREE.ConeGeometry(1.65, 2.3, 4);
          const stepPyramid = new THREE.Mesh(stepPyramidGeo, friezeMat);
          stepPyramid.position.set(side * 7.45, yBase - 1.2, 12 - level * 7.5 + (i - 1.5) * 2.5);
          stepPyramid.rotation.y = Math.PI / 4;
          stepPyramid.castShadow = true;
          stepPyramid.receiveShadow = true;
          structureGroup.add(stepPyramid);
        }
      }
    }

    // C. 5 Tiers of Pavilions (Mandapas) with Ornate Columns & Arches
    const tierDepths = [0, -4.8, -9.6, -14.4, -19.2];
    const columnOffsets = [
      [-3.2, -2.0],
      [3.2, -2.0],
      [-3.2, 2.0],
      [3.2, 2.0],
    ];

    tierDepths.forEach((yDepth, tierIdx) => {
      const zPos = 16 - tierIdx * 7.5;

      // Gallery Floor with molded cornice
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
          step.position.set(0, yDepth - (s + 1) * 0.65, zPos - 2.8 - s * 0.62);
          step.receiveShadow = true;
          step.castShadow = true;
          structureGroup.add(step);
        }
      }

      // Pillars per Tier (Solanki 16-Sided Fluted Columns with Bracket Capitals)
      columnOffsets.forEach(([px, pz]) => {
        // Base: Kalasha Pot Plinth
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.68, 0.65, 8);
        const base = new THREE.Mesh(baseGeo, friezeMat);
        base.position.set(px, yDepth + 0.68, zPos + pz);
        base.castShadow = true;
        pillarsGroup.add(base);

        // Fluted 16-sided Column Shaft
        const shaftColGeo = new THREE.CylinderGeometry(0.38, 0.46, 3.6, 16);
        const colShaft = new THREE.Mesh(shaftColGeo, stoneMat);
        colShaft.position.set(px, yDepth + 2.65, zPos + pz);
        colShaft.castShadow = true;
        colShaft.receiveShadow = true;
        pillarsGroup.add(colShaft);

        // Double Bracket Capital (Torana Arm)
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

    // D. Octagonal Subterranean Light-Well Shaft (-14m to -24m)
    const shaftRadius = 5.6;
    const octShaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, 24, 8, 1, true);
    const octShaftMat = new THREE.MeshStandardMaterial({
      map: sandstoneTex,
      color: 0xb58448,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const octShaft = new THREE.Mesh(octShaftGeo, octShaftMat);
    octShaft.position.set(0, -12, -8);
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

    // E. Volumetric Sun Shaft Cone (God Ray through Octagonal Oculus)
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

    // F. Floating Subterranean Dust Motes (450 Atmospheric Particles)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 12;
      particlePositions[p * 3 + 1] = -Math.random() * 24;
      particlePositions[p * 3 + 2] = -8 + (Math.random() - 0.5) * 20;
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

    // G. Subterranean Cistern Water Surface with Submerged Steps
    const waterGeo = new THREE.CircleGeometry(5.2, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -22.2, -8);
    water.receiveShadow = true;
    structureGroup.add(water);
    waterMeshRef.current = water;

    // Submerged stone steps descending into the cistern
    for (let ws = 0; ws < 4; ws++) {
      const wStepGeo = new THREE.BoxGeometry(4.2, 0.35, 0.65);
      const wStep = new THREE.Mesh(wStepGeo, stoneMat);
      wStep.position.set(0, -22.4 - ws * 0.45, -5.5 - ws * 0.55);
      structureGroup.add(wStep);
    }

    // H. Surface Entrance Gateway Torana Arch
    const mainToranaGeo = new THREE.TorusGeometry(3.6, 0.35, 12, 32, Math.PI);
    const mainTorana = new THREE.Mesh(mainToranaGeo, friezeMat);
    mainTorana.position.set(0, 3.6, 16);
    mainTorana.castShadow = true;
    structureGroup.add(mainTorana);

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

    const tourWaypoints = [
      { pos: new THREE.Vector3(26, 16, 28), look: new THREE.Vector3(0, 0, 12) },
      { pos: new THREE.Vector3(12, 5, 20), look: new THREE.Vector3(0, -2, 14) },
      { pos: new THREE.Vector3(-4, -1, 14), look: new THREE.Vector3(-2.8, -4.5, 9) },
      { pos: new THREE.Vector3(0, -7, 4), look: new THREE.Vector3(0, -13, -8) },
      { pos: new THREE.Vector3(2, -15, -3), look: new THREE.Vector3(0, -21, -8) },
      { pos: new THREE.Vector3(0, -20, -3), look: new THREE.Vector3(0, -22.5, -8) },
    ];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Water Ripple Oscillation
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -22.2 + Math.sin(elapsedTime * 1.6) * 0.06;
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
  }, [isTourPlaying, isAutoRotate]);

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
                Adalaj Subterranean Stepwell 3D Digital Twin
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Solanki Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              5-Tier Pavilion Corridor • Octagonal Light Shaft • 24.5m Depth • Procedural Stone Masonry
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