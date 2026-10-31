"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import StepwellDetailedModel from "./StepwellDetailedModel";

// Animated PBR Water Plane with Caustic Waves
function AnimatedCausticWater({ yPosition = -11.5, color = 0x0a4d68 }: { yPosition?: number; color?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(color) },
        shallowColor: { value: new THREE.Color(0x38bdf8) },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Dual-frequency Gerstner wave simulation
          float wave1 = sin(pos.x * 0.8 + time * 1.5) * cos(pos.y * 0.8 + time * 1.2) * 0.08;
          float wave2 = sin(pos.x * 2.2 - time * 2.0) * cos(pos.y * 1.8 + time * 1.8) * 0.03;
          pos.z += wave1 + wave2;
          vElevation = wave1 + wave2;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform vec3 shallowColor;
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Animated caustic ripple grid
          float caustic = sin(vUv.x * 40.0 + time * 3.0) * sin(vUv.y * 40.0 + time * 2.5);
          caustic = pow(max(0.0, caustic), 3.0) * 0.35;
          
          vec3 finalColor = mix(waterColor, shallowColor, vElevation * 3.0 + 0.3) + caustic;
          gl_FragColor = vec4(finalColor, 0.88);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.time.value = state.clock.elapsedTime;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, yPosition, -5]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[18, 48, 64, 64]} />
      <primitive object={waterMaterial} />
    </mesh>
  );
}

// Atmospheric Golden Dust Motes & Fireflies
function HeritageAtmosphere() {
  const dustRef = useRef<THREE.Points>(null);
  const fireflyRef = useRef<THREE.Points>(null);

  const dustCount = 450;
  const dustPositions = useMemo(() => {
    const arr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 22;
      arr[i + 1] = Math.random() * 16 - 12;
      arr[i + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, []);

  const fireflyCount = 40;
  const fireflyPositions = useMemo(() => {
    const arr = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 16;
      arr[i + 1] = Math.random() * 10 - 8;
      arr[i + 2] = (Math.random() - 0.5) * 36;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dustRef.current) {
      dustRef.current.rotation.y = t * 0.015;
    }
    if (fireflyRef.current) {
      const pos = fireflyRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < fireflyCount; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += Math.sin(t * 2 + i) * 0.012;
      }
      fireflyRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Golden Dust Motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={0xffd700}
          transparent
          opacity={0.45}
          sizeAttenuation
        />
      </points>

      {/* Bioluminescent Fireflies / Diya Embers */}
      <points ref={fireflyRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fireflyCount}
            array={fireflyPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color={0xff9900}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// Camera Preset Controller
function CameraRig({ viewPreset, archetype }: { viewPreset: string; archetype?: string }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 5.5, 27));
  const targetLook = useRef(new THREE.Vector3(0, 5.0, 0));

  useFrame(() => {
    if (archetype === "akshardham_mandir") {
      if (viewPreset === "overview") {
        targetPos.current.set(0, 8.5, 32);
        targetLook.current.set(0, 6.5, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, 4.5, 17);
        targetLook.current.set(0, 5.5, 0);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 14.0, 18);
        targetLook.current.set(0, 18.0, 0);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, 1.2, 24);
        targetLook.current.set(0, 6.0, 0);
      }
    } else if (archetype === "domed_mausoleum") {
      if (viewPreset === "overview") {
        targetPos.current.set(0, 5.5, 27);
        targetLook.current.set(0, 5.0, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, 3.8, 14);
        targetLook.current.set(0, 4.2, 0);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 8.5, 17);
        targetLook.current.set(0, 12.0, 0);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, 0.4, 20);
        targetLook.current.set(0, 4.5, 0);
      }
    } else if (archetype === "stupa") {
      if (viewPreset === "overview") {
        targetPos.current.set(16, 12, 22);
        targetLook.current.set(0, 4, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, 3, 17);
        targetLook.current.set(0, 4, 0);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 16, 10);
        targetLook.current.set(0, 14, 0);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, 1, 18);
        targetLook.current.set(0, 3, 0);
      }
    } else if (archetype === "tower") {
      if (viewPreset === "overview") {
        targetPos.current.set(0, 14, 34);
        targetLook.current.set(0, 15, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, 12, 14);
        targetLook.current.set(0, 13, 0);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 26, 16);
        targetLook.current.set(0, 28, 0);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, 2, 14);
        targetLook.current.set(0, 4, 0);
      }
    } else if (archetype === "nagara_shikhara") {
      if (viewPreset === "overview") {
        targetPos.current.set(18, 12, 22);
        targetLook.current.set(0, 6, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, 4, 15);
        targetLook.current.set(0, 5, 0);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 18, 12);
        targetLook.current.set(0, 16, 0);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, 1, 17);
        targetLook.current.set(0, 4, 0);
      }
    } else {
      if (viewPreset === "overview") {
        targetPos.current.set(18, 14, 26);
        targetLook.current.set(0, -6, 0);
      } else if (viewPreset === "gallery") {
        targetPos.current.set(0, -2, 14);
        targetLook.current.set(0, -5, -4);
      } else if (viewPreset === "shaft") {
        targetPos.current.set(0, 4, -14);
        targetLook.current.set(0, -10, -17);
      } else if (viewPreset === "water") {
        targetPos.current.set(0, -9.5, -6);
        targetLook.current.set(0, -8, -17);
      }
    }

    camera.position.lerp(targetPos.current, 0.05);
  });

  return null;
}

// Main Scene Props
interface VFXEngineProps {
  epoch?: number;
  timeOfDay?: number; // 6 to 18 hours
  archetype?: "stepwell_linear" | "kund_stepped" | "temple_mandapa" | "nagara_shikhara" | "monolithic_rockcut" | "domed_mausoleum" | "stupa" | "tower" | string;
  viewPreset?: "overview" | "gallery" | "shaft" | "water";
}

export default function VFXEngine({
  epoch = 0,
  timeOfDay = 12,
  archetype = "stepwell_linear",
  viewPreset = "overview",
}: VFXEngineProps) {
  // Atmosphere and Sky based on solar time
  const envData = useMemo(() => {
    const isNight = timeOfDay < 6.5 || timeOfDay > 17.5;
    const isDawnDusk = (timeOfDay >= 6 && timeOfDay < 7.5) || (timeOfDay > 16.5 && timeOfDay <= 18);

    let skyColor = "#0a1120"; // Atmospheric deep twilight
    let fogColor = "#0f172a";

    if (isDawnDusk) {
      skyColor = "#2c151c"; // Warm dawn/dusk amber-rose glow
      fogColor = "#331b1e";
    } else if (!isNight) {
      skyColor = "#0f1b2b"; // Atmospheric daylight horizon azure
      fogColor = "#162338";
    }

    return { skyColor, fogColor, isNight };
  }, [timeOfDay]);

  // Solar calculation: calculate sun position and color based on time of day
  const sunData = useMemo(() => {
    // 6 AM (dawn) to 12 PM (noon) to 18 PM (dusk)
    const normalizedTime = (timeOfDay - 6) / 12; // 0.0 to 1.0
    const sunAngle = normalizedTime * Math.PI;
    const sunX = Math.cos(sunAngle) * 32;
    const sunY = Math.max(1, Math.sin(sunAngle) * 36);
    const sunZ = Math.sin(sunAngle * 0.5) * 12;

    // Color temperature
    let sunColor = 0xfff4e0; // Noon warm daylight
    let ambientIntensity = 0.55;
    let sunIntensity = 2.4;

    if (timeOfDay <= 7 || timeOfDay >= 17) {
      sunColor = 0xff7722; // Deep golden dawn / sunset
      ambientIntensity = 0.35;
      sunIntensity = 1.6;
    } else if (timeOfDay <= 9 || timeOfDay >= 15) {
      sunColor = 0xffba66; // Warm golden morning/afternoon
      ambientIntensity = 0.45;
      sunIntensity = 2.0;
    }

    return { pos: [sunX, sunY, sunZ] as [number, number, number], sunColor, sunIntensity, ambientIntensity };
  }, [timeOfDay]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={[envData.skyColor]} />
        <fog attach="fog" args={[envData.fogColor, 25, 95]} />

        {/* Dynamic Camera with Preset Lerping */}
        <PerspectiveCamera
          makeDefault
          position={
            archetype === "akshardham_mandir"
              ? [0, 8.5, 32]
              : archetype === "domed_mausoleum"
              ? [0, 5.5, 27]
              : [18, 12, 24]
          }
          fov={archetype === "akshardham_mandir" ? 48 : archetype === "domed_mausoleum" ? 46 : 52}
        />
        <CameraRig viewPreset={viewPreset} archetype={archetype} />

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={4}
          maxDistance={65}
          maxPolarAngle={Math.PI / 2.02}
          target={
            archetype === "akshardham_mandir"
              ? [0, 6.5, 0]
              : archetype === "domed_mausoleum"
              ? [0, 5.0, 0]
              : [0, -5, 0]
          }
        />

        {/* Vast Ground Terrace / Riverfront Horizon Plane */}
        <mesh position={[0, -2.52, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[220, 220]} />
          <meshStandardMaterial
            color={archetype === "domed_mausoleum" ? 0x161e24 : 0x11161d}
            roughness={0.92}
            metalness={0.05}
          />
        </mesh>

        {/* Lighting Rig */}
        <ambientLight intensity={sunData.ambientIntensity} color={0xddeeff} />
        
        {/* Dynamic Sun Directional Light */}
        <directionalLight
          position={sunData.pos}
          intensity={sunData.sunIntensity}
          color={sunData.sunColor}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Ground Bounce / Water Fill Light */}
        <pointLight
          position={[0, archetype === "domed_mausoleum" ? 1 : -10, -5]}
          intensity={0.65}
          color={0x38bdf8}
          distance={24}
        />

        {/* Sky Stars (Visible during night / twilight) */}
        {envData.isNight && (
          <Stars
            radius={120}
            depth={40}
            count={2600}
            factor={3}
            fade
            speed={0.6}
          />
        )}

        {/* 3D Monument Architecture */}
        <StepwellDetailedModel
          epoch={epoch}
          archetype={archetype}
          timeOfDay={timeOfDay}
        />

        {/* Animated Water Surface */}
        {archetype === "stepwell_linear" && (
          <AnimatedCausticWater
            yPosition={epoch === 0 ? -11.5 : epoch === 1 ? -12.2 : -12.8}
            color={epoch === 2 ? 0x1f382a : 0x0a4d68}
          />
        )}
        {archetype === "domed_mausoleum" && (
          <AnimatedCausticWater
            yPosition={-0.8}
            color={0x0b6682}
          />
        )}

        {/* Atmospheric Floating Particles */}
        <HeritageAtmosphere />

        {/* Cinematic VFX Post-Processing */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.45}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.3}
          />
          <Vignette
            offset={0.25}
            darkness={0.65}
            eskil={false}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
