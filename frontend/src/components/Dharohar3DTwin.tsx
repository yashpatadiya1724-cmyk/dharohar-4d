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
  Calendar,
  Eye,
  Sliders,
  History,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface Dharohar3DTwinProps {
  onDepthChange?: (depthMeters: number) => void;
  onEpochChange?: (epochId: string) => void;
}

export const Dharohar3DTwin: React.FC<Dharohar3DTwinProps> = ({
  onDepthChange,
  onEpochChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls
  const [timeHour, setTimeHour] = useState<number>(11.5); // 11:30 AM
  const [epochIndex, setEpochIndex] = useState<number>(0); // 0: 1063 AD, 1: 1498 AD, 2: 1890 AD, 3: 2026 AD
  const [currentDepth, setCurrentDepth] = useState<number>(12); // -12m depth view
  const [activeLayers, setActiveLayers] = useState({
    surface: true,
    pillars: true,
    subterranean: true,
    cistern: true,
  });

  // Audio State
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const structureGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial }>({});
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const epochs = [
    {
      id: "1063",
      year: "1063 AD",
      name: "Solanki Golden Age",
      patron: "Queen Udayamati (Rani Ki Vav Era)",
      sandstoneHex: 0xd9a766, // Warm golden Dhrangadhra sandstone
      ambientIntensity: 0.8,
      waterColor: 0x0ea5e9, // Crystal turquoise aquifer
      torchCount: 8,
      description: "Pristine carved sandstone, vibrant mineral frescos, and sacred ritual pools.",
    },
    {
      id: "1498",
      year: "1498 AD",
      name: "Vaghela & Sultanate Synthesis",
      patron: "Queen Rudabai (Adalaj Era)",
      sandstoneHex: 0xc8985c, // Mellow ornate sandstone
      ambientIntensity: 0.7,
      waterColor: 0x0284c7,
      torchCount: 6,
      description: "Queen Rudabai's memorial stepwell: Jain & Hindu motifs fused with Islamic arches.",
    },
    {
      id: "1890",
      year: "1890 AD",
      name: "Colonial Survey Era",
      patron: "Archaeological Survey of Western India",
      sandstoneHex: 0xa88556, // Weathered patina & silt lines
      ambientIntensity: 0.5,
      waterColor: 0x0369a1,
      torchCount: 2,
      description: "Historical documentation, silt accumulation, and discovery of ancient Sanskrit epigraphs.",
    },
    {
      id: "2026",
      year: "2026 AD",
      name: "Modern ASI Protected Heritage",
      patron: "Archaeological Survey of India (ASI)",
      sandstoneHex: 0x96774a, // Ancient preserved stone with modern lighting
      ambientIntensity: 0.65,
      waterColor: 0x075985,
      torchCount: 0,
      description: "UNESCO protected monument with laser scanning, digital preservation, and tourism conservation.",
    },
  ];

  // 1. Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 480;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.018);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 16, 26);
    camera.lookAt(0, -8, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Group for whole structure
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);
    structureGroupRef.current = structureGroup;

    // Master Materials
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd9a766,
      roughness: 0.85,
      metalness: 0.05,
    });
    materialsRef.current.stone = stoneMat;

    const carvedMat = new THREE.MeshStandardMaterial({
      color: 0xc89255,
      roughness: 0.8,
      metalness: 0.1,
    });
    materialsRef.current.carved = carvedMat;

    // 2. Build Subterranean Stepwell Architecture
    // A. Subterranean Excavation Walls (Ground Level down to -24m)
    const pitGeo = new THREE.BoxGeometry(16, 26, 44);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      side: THREE.BackSide,
    });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, -12, 0);
    pit.receiveShadow = true;
    structureGroup.add(pit);

    // Ground Surface Surrounding
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    structureGroup.add(ground);

    // B. Five Descending Tiers of Pavilions & Stepped Corridors
    const tierDepths = [0, -5, -10, -15, -20];
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.42, 4.6, 12);
    const capitalGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const lintelGeo = new THREE.BoxGeometry(7, 0.5, 0.8);

    tierDepths.forEach((yDepth, tierIdx) => {
      const zPos = 16 - tierIdx * 7.5; // Stepping deeper from south to north

      // Stepped floor corridor
      const floorGeo = new THREE.BoxGeometry(8, 0.6, 6);
      const floor = new THREE.Mesh(floorGeo, stoneMat);
      floor.position.set(0, yDepth, zPos);
      floor.receiveShadow = true;
      floor.castShadow = true;
      structureGroup.add(floor);

      // Flight of stairs descending between tiers
      if (tierIdx < tierDepths.length - 1) {
        for (let s = 0; s < 6; s++) {
          const stepGeo = new THREE.BoxGeometry(6, 0.45, 0.7);
          const step = new THREE.Mesh(stepGeo, stoneMat);
          step.position.set(0, yDepth - (s + 1) * 0.75, zPos - 2.5 - s * 0.6);
          step.receiveShadow = true;
          step.castShadow = true;
          structureGroup.add(step);
        }
      }

      // 4 Pillars per Pavilion Tier (Solanki Style)
      const pillarOffsets = [
        [-2.8, -1.8],
        [2.8, -1.8],
        [-2.8, 1.8],
        [2.8, 1.8],
      ];

      pillarOffsets.forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, stoneMat);
        pillar.position.set(px, yDepth + 2.3, zPos + pz);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        structureGroup.add(pillar);

        // Carved bracket capital (Torana support)
        const capital = new THREE.Mesh(capitalGeo, carvedMat);
        capital.position.set(px, yDepth + 4.6, zPos + pz);
        capital.castShadow = true;
        structureGroup.add(capital);
      });

      // Transverse stone lintels
      const lintel1 = new THREE.Mesh(lintelGeo, stoneMat);
      lintel1.position.set(0, yDepth + 4.9, zPos - 1.8);
      lintel1.castShadow = true;
      structureGroup.add(lintel1);

      const lintel2 = new THREE.Mesh(lintelGeo, stoneMat);
      lintel2.position.set(0, yDepth + 4.9, zPos + 1.8);
      lintel2.castShadow = true;
      structureGroup.add(lintel2);
    });

    // C. Octagonal Subterranean Shaft (The Breathing Aperture)
    const shaftRadius = 5.2;
    const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, 22, 8, 1, true);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xb88850,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, -11, -8);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    structureGroup.add(shaft);

    // Decorative Sculptural Niches inside Shaft
    for (let r = 0; r < 8; r++) {
      const angle = (r * Math.PI * 2) / 8;
      const nicheGeo = new THREE.BoxGeometry(0.8, 1.8, 0.4);
      const niche = new THREE.Mesh(nicheGeo, carvedMat);
      niche.position.set(
        Math.cos(angle) * (shaftRadius - 0.2),
        -14,
        -8 + Math.sin(angle) * (shaftRadius - 0.2)
      );
      niche.rotation.y = -angle + Math.PI / 2;
      niche.castShadow = true;
      structureGroup.add(niche);
    }

    // D. Deep Subterranean Aquifer / Cistern Pool (-22m Depth)
    const waterGeo = new THREE.CircleGeometry(5.0, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -21.8, -8);
    water.receiveShadow = true;
    structureGroup.add(water);
    waterMeshRef.current = water;

    // E. Entrance Torana Gateway at Surface
    const toranaArchGeo = new THREE.TorusGeometry(3.2, 0.3, 8, 24, Math.PI);
    const torana = new THREE.Mesh(toranaArchGeo, carvedMat);
    torana.position.set(0, 3.2, 16);
    torana.castShadow = true;
    structureGroup.add(torana);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.6);
    scene.add(ambientLight);

    // Real-Time Directional Sun
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Sun Visual Sphere
    const sunGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Subterranean Torch / Oil Lamp Point Lights
    const torch1 = new THREE.PointLight(0xf97316, 2.5, 12, 1.5);
    torch1.position.set(0, -16, -6);
    scene.add(torch1);

    const torch2 = new THREE.PointLight(0xf97316, 1.8, 10, 1.5);
    torch2.position.set(0, -9, 8);
    scene.add(torch2);

    // Mouse Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.9;
    let sphericalPhi = 0.9;
    let sphericalRadius = 40;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI / 2.1, sphericalPhi - deltaY * 0.008));

      camera.position.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = sphericalRadius * Math.cos(sphericalPhi) - 6;
      camera.position.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, -9, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      sphericalRadius = Math.max(16, Math.min(65, sphericalRadius + e.deltaY * 0.04));
      camera.position.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = sphericalRadius * Math.cos(sphericalPhi) - 6;
      camera.position.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, -9, 0);
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // Animation Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle water ripple reflection effect
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -21.8 + Math.sin(elapsedTime * 1.5) * 0.06;
      }

      // Torch flicker
      torch1.intensity = 2.4 + Math.sin(elapsedTime * 6) * 0.4;
      torch2.intensity = 1.8 + Math.cos(elapsedTime * 5.5) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
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
  }, []);

  // Update Sun Position Based on Time of Day Slider
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current) return;

    // Gujarat Sun Trajectory: 7 AM to 6 PM
    const normalizedHour = (timeHour - 7) / 11; // 0 (7 AM) to 1 (6 PM)
    const angle = normalizedHour * Math.PI; // 0 to PI

    const sunDist = 42;
    const sunX = Math.cos(angle) * sunDist * 0.9;
    const sunY = Math.sin(angle) * sunDist * 0.85 + 2;
    const sunZ = Math.sin(angle * 0.8) * 14 - 4; // Slight azimuth tilt

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.lookAt(0, -10, -4);
    sunMeshRef.current.position.set(sunX, sunY, sunZ);

    // Warm golden morning/evening light vs bright noon
    if (timeHour < 9 || timeHour > 16.5) {
      sunLightRef.current.color.setHex(0xfdba74); // Amber golden dawn/dusk
      sunLightRef.current.intensity = 1.9;
    } else {
      sunLightRef.current.color.setHex(0xfffbeb); // Pure high-noon radiance
      sunLightRef.current.intensity = 3.2;
    }
  }, [timeHour]);

  // Update Sandstone & Atmosphere on Epoch Change
  useEffect(() => {
    const selected = epochs[epochIndex];
    if (materialsRef.current.stone) {
      materialsRef.current.stone.color.setHex(selected.sandstoneHex);
    }
    if (materialsRef.current.carved) {
      materialsRef.current.carved.color.setHex(selected.sandstoneHex);
    }
    if (waterMeshRef.current && (waterMeshRef.current.material as THREE.MeshStandardMaterial)) {
      (waterMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(selected.waterColor);
    }
    if (onEpochChange) {
      onEpochChange(selected.id);
    }
  }, [epochIndex]);

  // Web Audio 3D Spatial Acoustic Synthesizer
  const playSpatialAcoustic = (type: "water" | "bell" | "wind") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Reverb duration scales with subterranean depth (deeper = longer cathedral echo)
      const depthReverbScale = Math.max(0.6, currentDepth / 6);

      if (type === "water") {
        // Synthesize single echoing water droplet
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
        // Synthesize ancient bronze temple bell with rich harmonics
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
      console.warn("Audio playback error:", e);
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
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      {/* Top HUD Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Adalaj Subterranean Stepwell 3D Twin
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                Solanki Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              5-Tier Subterranean Octagonal Shaft • 24.5m Depth
            </p>
          </div>
        </div>

        {/* Spatial Audio & Camera Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => playSpatialAcoustic("water")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 flex items-center gap-1.5 transition-all shadow-xs"
            title="Trigger Water Droplet Reverb"
          >
            <span>💧 Drop Echo</span>
          </button>
          <button
            onClick={() => playSpatialAcoustic("bell")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-all shadow-xs"
            title="Trigger Temple Bell Resonance"
          >
            <span>🔔 Bell Reverb</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[480px] cursor-grab active:cursor-grabbing block"
      />

      {/* Real-time Subterranean Depth & Shaft Raytracer Overlay */}
      <div className="absolute top-20 right-4 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 backdrop-blur space-y-2 max-w-[210px] pointer-events-none">
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
            <span className="font-mono text-sky-300">
              {32 - Math.round(currentDepth * 0.25)}°C (Cooling)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar: 4D Epoch Time Travel + Diurnal Sun Slider */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 space-y-4">
        {/* 4D Time-Travel Slider */}
        <div className="space-y-2">
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

          <div className="grid grid-cols-4 gap-2">
            {epochs.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => setEpochIndex(idx)}
                className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition-all ${
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

        {/* Diurnal Sun Slider */}
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

          {/* Depth Acoustic & Camera Elevation Slider */}
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
                if (cameraRef.current) {
                  cameraRef.current.position.y = 10 - d;
                  cameraRef.current.lookAt(0, -d, -4);
                }
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
