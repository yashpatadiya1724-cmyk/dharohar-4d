"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Sun,
  Clock,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  Info,
  Zap,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface Solar3DRaytracerProps {
  onYieldCalculated?: (data: {
    capacityKw: number;
    unshadedPct: number;
    currentKw: number;
    annualKwh: number;
  }) => void;
}

export const Solar3DRaytracer: React.FC<Solar3DRaytracerProps> = ({
  onYieldCalculated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeHour, setTimeHour] = useState<number>(12.5); // 12:30 PM (Solar Noon in Ahmedabad)
  const [season, setSeason] = useState<"summer" | "winter" | "monsoon">("summer");
  const [panelsInstalled, setPanelsInstalled] = useState<boolean>(true);
  const [panelsCount, setPanelsCount] = useState<number>(12); // ~3 kW (12 panels x 250W)
  const [roofTiltDeg, setRoofTiltDeg] = useState<number>(23); // Optimal tilt for Ahmedabad
  const [unshadedPercentage, setUnshadedPercentage] = useState<number>(94);
  const [liveRadiationFlux, setLiveRadiationFlux] = useState<number>(885); // W/m²
  const [livePowerKw, setLivePowerKw] = useState<number>(2.75);

  // Three.js object references for dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunSphereRef = useRef<THREE.Mesh | null>(null);
  const panelsGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900 sky
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 14, 20);
    camera.lookAt(0, 3, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Ambient & Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.45);
    scene.add(hemiLight);

    // 5. Directional Sun Light (Casts real raytraced shadows)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    const shadowDist = 18;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Visual Sun Orb
    const sunGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunSphere = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunSphere);
    sunSphereRef.current = sunSphere;

    // 6. Ground & Environment Plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle Grid lines
    const gridHelper = new THREE.GridHelper(50, 25, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 7. Building Geometry (Contemporary Ahmedabad Villa)
    const buildingGroup = new THREE.Group();

    // Main 2-storey house body
    const mainBodyGeo = new THREE.BoxGeometry(9, 6, 8);
    const mainBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Crisp white plaster
      roughness: 0.6,
    });
    const mainBody = new THREE.Mesh(mainBodyGeo, mainBodyMat);
    mainBody.position.set(0, 3, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    buildingGroup.add(mainBody);

    // Parapet roof border wall
    const parapetGeo = new THREE.BoxGeometry(9.4, 0.5, 8.4);
    const parapetMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
    const parapet = new THREE.Mesh(parapetGeo, parapetMat);
    parapet.position.set(0, 6.25, 0);
    parapet.castShadow = true;
    parapet.receiveShadow = true;
    buildingGroup.add(parapet);

    // Rooftop Surface (Usable terrace)
    const roofTerraceGeo = new THREE.BoxGeometry(8.8, 0.1, 7.8);
    const roofTerraceMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Terracotta Gujarat roof tile
      roughness: 0.9,
    });
    const roofTerrace = new THREE.Mesh(roofTerraceGeo, roofTerraceMat);
    roofTerrace.position.set(0, 6.1, 0);
    roofTerrace.receiveShadow = true;
    buildingGroup.add(roofTerrace);

    // Rooftop Water Tank & Lift Machine Room (Casts critical shadow!)
    const overheadRoomGeo = new THREE.BoxGeometry(2.4, 2.2, 2.2);
    const overheadRoomMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const overheadRoom = new THREE.Mesh(overheadRoomGeo, overheadRoomMat);
    overheadRoom.position.set(-2.8, 7.2, -2.4);
    overheadRoom.castShadow = true;
    overheadRoom.receiveShadow = true;
    buildingGroup.add(overheadRoom);

    // PVC Overhead Water Tank (Black Sintex style)
    const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.2, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-2.8, 8.8, -2.4);
    tank.castShadow = true;
    buildingGroup.add(tank);

    // Windows & Modern Architectural Slits
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
    });
    // Front window 1
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.1), windowMat);
    win1.position.set(1.5, 4, 4.05);
    buildingGroup.add(win1);
    // Front window 2
    const win2 = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.1), windowMat);
    win2.position.set(-1.5, 4, 4.05);
    buildingGroup.add(win2);

    scene.add(buildingGroup);

    // 8. Neighboring Structure: Tall Tree & Adjacent Wall (Casts shadow onto roof at 4 PM)
    const treeGroup = new THREE.Group();
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 7, 10);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(7.5, 3.5, -3);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage Canopy (Neem tree style)
    const foliageGeo = new THREE.DodecahedronGeometry(2.8, 1);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush Indian green
      roughness: 0.8,
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(7.5, 7.5, -3);
    foliage.castShadow = true;
    treeGroup.add(foliage);

    scene.add(treeGroup);

    // 9. Solar Panels Group (placed on unshaded roof portion)
    const panelsGroup = new THREE.Group();
    panelsGroupRef.current = panelsGroup;
    scene.add(panelsGroup);

    // Mouse drag orbital rotation controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraAngle = Math.PI / 4;
    let cameraElevation = Math.PI / 6;
    const cameraRadius = 26;

    const updateCameraPos = () => {
      camera.position.x = cameraRadius * Math.sin(cameraAngle) * Math.cos(cameraElevation);
      camera.position.z = cameraRadius * Math.cos(cameraAngle) * Math.cos(cameraElevation);
      camera.position.y = Math.max(2, cameraRadius * Math.sin(cameraElevation));
      camera.lookAt(0, 4, 0);
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      cameraAngle -= deltaX * 0.008;
      cameraElevation = Math.max(0.1, Math.min(Math.PI / 2.3, cameraElevation + deltaY * 0.008));
      prevMousePos = { x: e.clientX, y: e.clientY };
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      domElem.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Sun Position based on Hour of Day & Ahmedabad Solstice
  useEffect(() => {
    if (!sunLightRef.current || !sunSphereRef.current || !sceneRef.current) return;

    // Convert timeHour (6.0 to 18.5) to Sun azimuth & elevation
    // Solar Noon in Ahmedabad is around 12:30 PM (elevation ~85° summer, ~50° winter)
    const normTime = (timeHour - 6.0) / 12.0; // 0 at 6 AM, 0.5 at 12 PM, 1.0 at 6 PM
    const sunAngle = normTime * Math.PI; // 0 to PI

    const maxElevation = season === "summer" ? 1.45 : season === "winter" ? 0.85 : 1.2;
    const elevation = Math.sin(sunAngle) * maxElevation;
    const azimuth = Math.cos(sunAngle);

    const sunDistance = 32;
    const sunX = azimuth * sunDistance;
    const sunY = Math.max(0.5, Math.sin(sunAngle) * maxElevation * sunDistance);
    const sunZ = (season === "winter" ? -8 : season === "summer" ? 4 : 0) - (azimuth * 6);

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunSphereRef.current.position.set(sunX * 0.9, sunY * 0.9, sunZ * 0.9);

    // Sky Background color transitions based on sun elevation
    const isDay = sunY > 2;
    if (sunY < 4) {
      // Golden Hour sunrise/sunset
      sceneRef.current.background = new THREE.Color(0x381e05);
      sunLightRef.current.color = new THREE.Color(0xfdba74);
      sunLightRef.current.intensity = 0.9;
    } else {
      // Crisp daylight
      sceneRef.current.background = new THREE.Color(0x0f172a);
      sunLightRef.current.color = new THREE.Color(0xfff7ed);
      sunLightRef.current.intensity = 1.8;
    }

    // Calculate real-time unshaded percentage & radiation flux
    // Shadows from the lift room cover parts of roof at early morning (6-8 AM) and late evening (4-6 PM)
    let shadowLoss = 0.04;
    if (timeHour < 8.5) {
      shadowLoss = 0.28 - (timeHour - 6) * 0.08;
    } else if (timeHour > 15.5) {
      shadowLoss = 0.08 + (timeHour - 15.5) * 0.12;
    }
    const unshaded = Math.max(45, Math.min(98, Math.round((1 - shadowLoss) * 100)));
    setUnshadedPercentage(unshaded);

    // Solar Radiation Flux (W/m²) in Gujarat
    const peakFlux = season === "summer" ? 980 : 820;
    const currentFlux = Math.max(0, Math.round(peakFlux * Math.sin(sunAngle) * (unshaded / 100)));
    setLiveRadiationFlux(currentFlux);

    // Live power generation from panels (kW)
    const capacityKw = panelsCount * 0.25; // e.g. 12 * 0.25 = 3.0 kW
    const currentPower = panelsInstalled
      ? Math.max(0, (capacityKw * (currentFlux / 1000) * 0.82))
      : 0;
    setLivePowerKw(roundDec(currentPower, 2));

    onYieldCalculated?.({
      capacityKw,
      unshadedPct: unshaded,
      currentKw: roundDec(currentPower, 2),
      annualKwh: Math.round(capacityKw * 4.6 * 365 * 0.82 * (unshaded / 100)),
    });
  }, [timeHour, season, panelsInstalled, panelsCount, onYieldCalculated]);

  // Re-generate Solar Panels on the 3D Rooftop
  useEffect(() => {
    if (!panelsGroupRef.current) return;
    const group = panelsGroupRef.current;
    group.clear();

    if (!panelsInstalled) return;

    // Silicon Solar Panel Geometry (Deep Blue Monocrystalline Photovoltaic)
    const panelWidth = 1.2;
    const panelHeight = 0.8;
    const panelGeo = new THREE.BoxGeometry(panelWidth, 0.05, panelHeight);

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // High-efficiency Photovoltaic Blue
      roughness: 0.15,
      metalness: 0.7,
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Silver Aluminium mounting frame
      roughness: 0.4,
      metalness: 0.9,
    });

    // Place panels in an unshaded grid on the East/Center of the terrace
    const cols = 4;
    const rows = Math.ceil(panelsCount / cols);
    const startX = 0.5;
    const startZ = -0.5;

    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= panelsCount) break;

        const singlePanel = new THREE.Group();

        // Photovoltaic cell
        const cellMesh = new THREE.Mesh(panelGeo, panelMat);
        cellMesh.castShadow = true;
        cellMesh.receiveShadow = true;
        singlePanel.add(cellMesh);

        // Mounting stand
        const standGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const stand1 = new THREE.Mesh(standGeo, frameMat);
        stand1.position.set(-0.5, -0.15, -0.3);
        singlePanel.add(stand1);

        const stand2 = new THREE.Mesh(standGeo, frameMat);
        stand2.position.set(0.5, -0.15, -0.3);
        singlePanel.add(stand2);

        // Position on roof
        const posX = startX + (c * (panelWidth + 0.15));
        const posZ = startZ + (r * (panelHeight + 0.3));

        singlePanel.position.set(posX - 1.8, 6.35, posZ);

        // 23° South-Facing optimal Gujarat tilt
        singlePanel.rotation.x = THREE.MathUtils.degToRad(-roofTiltDeg);

        group.add(singlePanel);
        placed++;
      }
    }
  }, [panelsInstalled, panelsCount, roofTiltDeg]);

  const roundDec = (val: number, dec: number) => Number(val.toFixed(dec));

  const formatTimeLabel = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    const period = whole >= 12 ? "PM" : "AM";
    const displayH = whole > 12 ? whole - 12 : whole;
    return `${displayH}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4">
      {/* 3D Viewport Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>UrjaTwin 3D — WebGL Solar Raytracer</span>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                Ahmedabad 23.02°N
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shadow casting from parapets, water tanks & trees with Gujarat irradiance physics
          </p>
        </div>

        {/* Live Energy Ticker */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-1.5 rounded-2xl border border-slate-700/70 text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Solar Flux</span>
            <div className="text-sm font-black text-amber-300">{liveRadiationFlux} W/m²</div>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Live Power</span>
            <div className="text-sm font-black text-emerald-400">{livePowerKw} kW</div>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Unshaded Area</span>
            <div className="text-sm font-black text-cyan-300">{unshadedPercentage}%</div>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-[380px] cursor-grab active:cursor-grabbing select-none"
        />

        {/* Canvas HUD Overlay Pill */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 pointer-events-none flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Drag to orbit 3D model • Scroll to zoom</span>
        </div>

        {/* Status Chip Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2">
          <span className="text-slate-400">Array Capacity:</span>
          <span className="font-black text-white">{(panelsCount * 0.25).toFixed(1)} kW</span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {panelsCount} Monocrystalline Panels
          </span>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="p-5 bg-slate-950/90 border-t border-slate-800 space-y-4">
        {/* Time of Day Sun Trajectory Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Sun Raytracing Position (Time of Day):</span>
              <span className="text-amber-300 font-black text-sm bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                {formatTimeLabel(timeHour)}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {timeHour >= 11 && timeHour <= 14 ? "☀️ Solar Peak Window" : "🌅 Angled Shadow Window"}
            </span>
          </div>

          <input
            type="range"
            min="6.5"
            max="18.5"
            step="0.25"
            value={timeHour}
            onChange={(e) => setTimeHour(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>6:30 AM (Sunrise)</span>
            <span>10:00 AM</span>
            <span>12:30 PM (Solar Noon)</span>
            <span>4:00 PM</span>
            <span>6:30 PM (Sunset)</span>
          </div>
        </div>

        {/* Season & Solar Panel Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Season Selector */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">
              Seasonal Solar Azimuth
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "summer", label: "Summer" },
                { id: "monsoon", label: "Monsoon" },
                { id: "winter", label: "Winter" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeason(s.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    season === s.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Array Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
              <span>Panels Count</span>
              <span className="text-white font-bold">{panelsCount} Panels ({(panelsCount * 0.25).toFixed(1)} kW)</span>
            </div>
            <input
              type="range"
              min="4"
              max="24"
              step="4"
              value={panelsCount}
              onChange={(e) => setPanelsCount(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg mt-1"
            />
          </div>

          {/* Snap Optimal Placement Toggle */}
          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={() => {
                setPanelsInstalled(!panelsInstalled);
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                panelsInstalled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{panelsInstalled ? "Panels Deployed (Snap Active)" : "Deploy Solar Panels"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solar3DRaytracer;
