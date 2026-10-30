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
  RotateCcw,
  Play,
  Pause,
  MapPin,
  ChevronRight
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

  // Simulation Controls
  const [timeHour, setTimeHour] = useState<number>(11.5); // 11:30 AM
  const [epochIndex, setEpochIndex] = useState<number>(0); // 0: 1063 AD, 1: 1498 AD, 2: 1890 AD, 3: 2026 AD
  const [currentDepth, setCurrentDepth] = useState<number>(12); // -12m depth view
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  // Cinematic Tour State
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const tourProgressRef = useRef<number>(0);

  // Ambient Audio State
  const [ambientAudioActive, setAmbientAudioActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunShaftConeRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const structureGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial }>({});
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(22, 16, 26));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -9, 0));

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

  const pois: POI[] = [
    {
      id: "poi-torana",
      name: "Torana Entrance Mandapa",
      tier: "Surface Level",
      elevation: "0.0m",
      description: "Triple-entrance gateway framed with lotus rosettes and ornamental bracket capitals greeting descending travelers.",
      camPos: [14, 8, 22],
      lookAt: [0, 2, 14],
    },
    {
      id: "poi-edict",
      name: "Queen Rudabai Sanskrit Edict",
      tier: "Tier 1 Gallery",
      elevation: "-4.5m",
      description: "Marble niche stele in Vikram Samvat 1555 recording the tragic love and diplomatic foundation of the stepwell.",
      camPos: [-5, -2, 14],
      lookAt: [-2.8, -4.5, 9],
    },
    {
      id: "poi-shaft",
      name: "Octagonal Breathing Oculus",
      tier: "Tier 3 Intermediate",
      elevation: "-14.0m",
      description: "Octagonal sky-well shaft functioning as a thermal chimney and solar clock, illuminating sculpted niches.",
      camPos: [0, -6, -4],
      lookAt: [0, -14, -8],
    },
    {
      id: "poi-cistern",
      name: "Deep Aquifer Sump",
      tier: "Tier 5 Cistern",
      elevation: "-22.5m",
      description: "Ancient subterranean groundwater reservoir maintaining 6°C cooler microclimate through deep earth thermal mass.",
      camPos: [0, -18, 0],
      lookAt: [0, -22, -8],
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
    camera.lookAt(0, -9, 0);
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

    // Master Group
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);
    structureGroupRef.current = structureGroup;

    // Materials
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

    // Subterranean Excavation Walls (-24m Depth)
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

    // Ground Surface
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

    // 5 Tiers of Pavilions & Stepped Corridors
    const tierDepths = [0, -5, -10, -15, -20];
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.42, 4.6, 12);
    const capitalGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const lintelGeo = new THREE.BoxGeometry(7, 0.5, 0.8);

    tierDepths.forEach((yDepth, tierIdx) => {
      const zPos = 16 - tierIdx * 7.5;

      // Floor Corridor
      const floorGeo = new THREE.BoxGeometry(8, 0.6, 6);
      const floor = new THREE.Mesh(floorGeo, stoneMat);
      floor.position.set(0, yDepth, zPos);
      floor.receiveShadow = true;
      floor.castShadow = true;
      structureGroup.add(floor);

      // Flights of Stairs
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

      // Pillars per Tier
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

        const capital = new THREE.Mesh(capitalGeo, carvedMat);
        capital.position.set(px, yDepth + 4.6, zPos + pz);
        capital.castShadow = true;
        structureGroup.add(capital);
      });

      const lintel1 = new THREE.Mesh(lintelGeo, stoneMat);
      lintel1.position.set(0, yDepth + 4.9, zPos - 1.8);
      lintel1.castShadow = true;
      structureGroup.add(lintel1);

      const lintel2 = new THREE.Mesh(lintelGeo, stoneMat);
      lintel2.position.set(0, yDepth + 4.9, zPos + 1.8);
      lintel2.castShadow = true;
      structureGroup.add(lintel2);
    });

    // Octagonal Subterranean Shaft
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

    // Sculptural Niches inside Shaft
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

    // Volumetric Sun Shaft Cone
    const coneGeo = new THREE.CylinderGeometry(2.5, 4.8, 22, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const sunShaftCone = new THREE.Mesh(coneGeo, coneMat);
    sunShaftCone.position.set(0, -11, -8);
    structureGroup.add(sunShaftCone);
    sunShaftConeRef.current = sunShaftCone;

    // Subterranean Aquifer Water Surface
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

    // Entrance Torana Arch
    const toranaArchGeo = new THREE.TorusGeometry(3.2, 0.3, 8, 24, Math.PI);
    const torana = new THREE.Mesh(toranaArchGeo, carvedMat);
    torana.position.set(0, 3.2, 16);
    torana.castShadow = true;
    structureGroup.add(torana);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.6);
    scene.add(ambientLight);

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

    const sunGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Subterranean Torches
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

      targetCamPosRef.current.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      targetCamPosRef.current.y = sphericalRadius * Math.cos(sphericalPhi) - 6;
      targetCamPosRef.current.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      sphericalRadius = Math.max(16, Math.min(65, sphericalRadius + e.deltaY * 0.04));
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

    // Animation Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    // Waypoints for Cinematic Tour
    const tourWaypoints = [
      { pos: new THREE.Vector3(20, 12, 26), look: new THREE.Vector3(0, 0, 10) },
      { pos: new THREE.Vector3(8, 4, 18), look: new THREE.Vector3(0, -2, 12) },
      { pos: new THREE.Vector3(-4, -2, 12), look: new THREE.Vector3(-2.8, -4.5, 9) },
      { pos: new THREE.Vector3(0, -8, 2), look: new THREE.Vector3(0, -12, -8) },
      { pos: new THREE.Vector3(3, -15, -4), look: new THREE.Vector3(0, -20, -8) },
      { pos: new THREE.Vector3(0, -19, -4), look: new THREE.Vector3(0, -22, -8) },
    ];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Water ripple oscillation
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -21.8 + Math.sin(elapsedTime * 1.5) * 0.06;
      }

      // Torch flame flicker
      torch1.intensity = 2.4 + Math.sin(elapsedTime * 6) * 0.4;
      torch2.intensity = 1.8 + Math.cos(elapsedTime * 5.5) * 0.3;

      // Cinematic Tour Walkthrough Camera Interpolation
      if (isTourPlaying) {
        tourProgressRef.current += 0.0025;
        if (tourProgressRef.current >= tourWaypoints.length - 1) {
          tourProgressRef.current = 0; // loop or stop
        }

        const currIdx = Math.floor(tourProgressRef.current);
        const nextIdx = (currIdx + 1) % tourWaypoints.length;
        const segmentProgress = tourProgressRef.current - currIdx;

        camera.position.lerpVectors(
          tourWaypoints[currIdx].pos,
          tourWaypoints[nextIdx].pos,
          segmentProgress
        );
        const currentLookAt = new THREE.Vector3().lerpVectors(
          tourWaypoints[currIdx].look,
          tourWaypoints[nextIdx].look,
          segmentProgress
        );
        camera.lookAt(currentLookAt);
      } else {
        // Smooth camera damping towards target position & lookAt
        camera.position.lerp(targetCamPosRef.current, 0.08);
        camera.lookAt(targetLookAtRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

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
  }, [isTourPlaying]);

  // Update Sun Position Based on Time of Day Slider
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current) return;

    const normalizedHour = (timeHour - 7) / 11;
    const angle = normalizedHour * Math.PI;

    const sunDist = 42;
    const sunX = Math.cos(angle) * sunDist * 0.9;
    const sunY = Math.sin(angle) * sunDist * 0.85 + 2;
    const sunZ = Math.sin(angle * 0.8) * 14 - 4;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.lookAt(0, -10, -4);
    sunMeshRef.current.position.set(sunX, sunY, sunZ);

    // Dynamic light color & intensity
    if (timeHour < 9 || timeHour > 16.5) {
      sunLightRef.current.color.setHex(0xfdba74);
      sunLightRef.current.intensity = 1.9;
      if (sunShaftConeRef.current) {
        (sunShaftConeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04;
      }
    } else {
      sunLightRef.current.color.setHex(0xfffbeb);
      sunLightRef.current.intensity = 3.2;
      if (sunShaftConeRef.current) {
        (sunShaftConeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.16;
      }
    }
  }, [timeHour]);

  // Update Epoch Styles
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

  // Handle Hotspot (POI) Flyto
  const handleSelectPoi = (poi: POI) => {
    setSelectedPoi(poi);
    setIsTourPlaying(false);
    targetCamPosRef.current.set(...poi.camPos);
    targetLookAtRef.current.set(...poi.lookAt);
  };

  // Web Audio 3D Spatial Acoustic Synthesizer
  const playSpatialAcoustic = (type: "water" | "bell" | "ambient_toggle") => {
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
      const depthReverbScale = Math.max(0.6, currentDepth / 6);

      if (type === "ambient_toggle") {
        if (ambientAudioActive && droneNodesRef.current) {
          // Stop drone
          droneNodesRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          setTimeout(() => {
            droneNodesRef.current?.osc1.stop();
            droneNodesRef.current?.osc2.stop();
            droneNodesRef.current = null;
          }, 500);
          setAmbientAudioActive(false);
        } else {
          // Start low subterranean drone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(55, now); // A1 note
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(55.8, now); // subtle binaural detune

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
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      {/* Top HUD Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-md shadow-amber-950/30">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-extrabold text-white tracking-wide">
                Adalaj Subterranean Stepwell 3D Digital Twin
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Solanki Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              5-Tier Subterranean Octagonal Shaft • 24.5m Depth • Solanki-Indo-Islamic Synthesis
            </p>
          </div>
        </div>

        {/* Tour & Spatial Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Cinematic Flythrough Tour Button */}
          <button
            onClick={() => {
              setIsTourPlaying(!isTourPlaying);
              setSelectedPoi(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              isTourPlaying
                ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400/50"
                : "bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200"
            }`}
          >
            {isTourPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Cinematic Walkthrough</span>
              </>
            )}
          </button>

          {/* Continuous Ambient Drone */}
          <button
            onClick={() => playSpatialAcoustic("ambient_toggle")}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ambientAudioActive
                ? "bg-purple-950 border-purple-500 text-purple-200"
                : "bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
            title="Toggle Subterranean Ambient Atmosphere"
          >
            <Volume2 className={`w-3.5 h-3.5 ${ambientAudioActive ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{ambientAudioActive ? "Cavern Sound On" : "Ambient Sound"}</span>
          </button>

          {/* Sound FX Buttons */}
          <button
            onClick={() => playSpatialAcoustic("water")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 flex items-center gap-1 transition-all"
            title="Trigger Water Droplet Reverb"
          >
            <span>💧 Echo</span>
          </button>
          <button
            onClick={() => playSpatialAcoustic("bell")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1 transition-all"
            title="Trigger Temple Bell Resonance"
          >
            <span>🔔 Bell</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[500px] cursor-grab active:cursor-grabbing block"
      />

      {/* Interactive 3D Hotspots Bar */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur w-fit">
          Key 3D Architectural Hotspots
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

      {/* Selected Hotspot Detail Card */}
      {selectedPoi && (
        <div className="absolute bottom-36 left-4 right-4 md:right-auto md:max-w-md z-20 bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {selectedPoi.tier} • {selectedPoi.elevation}
            </span>
            <button
              onClick={() => setSelectedPoi(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <h4 className="font-extrabold text-sm text-white">{selectedPoi.name}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedPoi.description}</p>
        </div>
      )}

      {/* Real-time Subterranean Depth & Shaft Raytracer Overlay */}
      <div className="absolute top-20 right-4 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 backdrop-blur space-y-2 max-w-[210px] pointer-events-none hidden sm:block">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {epochs.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => setEpochIndex(idx)}
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
