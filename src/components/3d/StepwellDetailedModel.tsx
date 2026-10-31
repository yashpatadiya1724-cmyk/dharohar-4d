"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heritageMaterials } from "@/lib/heritageMaterials";

interface StepwellDetailedModelProps {
  epoch: number;
  archetype?: string;
  timeOfDay?: number;
}

export default function StepwellDetailedModel({
  epoch = 0,
  archetype = "stepwell_linear",
  timeOfDay = 12,
}: StepwellDetailedModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const torchesRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Group>(null);

  // Load procedural PBR textures
  const sandstoneTex = useMemo(() => {
    if (typeof window === "undefined") return null;
    return heritageMaterials.getSandstoneTexture(epoch);
  }, [epoch]);

  const friezeTex = useMemo(() => {
    if (typeof window === "undefined") return null;
    return heritageMaterials.getFriezeTexture();
  }, []);

  const jaliTex = useMemo(() => {
    if (typeof window === "undefined") return null;
    return heritageMaterials.getJaliTexture();
  }, []);

  // Epoch-based stone tint
  const stoneColor = useMemo(() => {
    if (epoch === 0) return new THREE.Color(0xdcb078); // Golden Solanki
    if (epoch === 1) return new THREE.Color(0xcfa068); // Sultanate / weathered
    if (epoch === 2) return new THREE.Color(0xa58e72); // Silted & mossy
    return new THREE.Color(0xe0b983); // 2026 ASI Preserved
  }, [epoch]);

  const roughness = epoch === 2 ? 0.95 : epoch === 0 ? 0.65 : 0.8;

  // Animate torches and laser scanning grid
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (torchesRef.current) {
      torchesRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.PointLight) {
          const noise = Math.sin(t * 8 + i * 1.5) * 0.15 + Math.cos(t * 12 + i * 2) * 0.1;
          child.intensity = 1.2 + noise;
        }
      });
    }

    if (laserRef.current && epoch === 3) {
      laserRef.current.position.y = Math.sin(t * 1.2) * 4 - 5;
    }
  });

  return (
    <group ref={rootRef}>
      {/* ================= 1. STEPWELL LINEAR (Rani Ki Vav & Adalaj) ================= */}
      {(archetype === "stepwell_linear" || archetype === "stepwell") && (
        <group>
          {/* Main Subterranean Retaining Side Walls (North & South) */}
          {[-7.5, 7.5].map((xSide, sideIdx) => (
            <mesh key={`wall-${sideIdx}`} position={[xSide, -6, 5]} receiveShadow castShadow>
              <boxGeometry args={[1.5, 14, 46]} />
              <meshStandardMaterial
                map={sandstoneTex || undefined}
                color={stoneColor}
                roughness={roughness}
                bumpMap={sandstoneTex || undefined}
                bumpScale={0.05}
              />
            </mesh>
          ))}

          {/* Wall Decorative Frieze Moldings */}
          {[-6.7, 6.7].map((xSide, sideIdx) => (
            <group key={`frieze-wall-${sideIdx}`}>
              {[-1, -3.5, -6, -8.5].map((yLvl, lIdx) => (
                <mesh
                  key={`frieze-${lIdx}`}
                  position={[xSide, yLvl, 5]}
                  rotation={[0, sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
                >
                  <boxGeometry args={[44, 0.4, 0.3]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.7} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Stepped Baori Ghats (Triangular Zig-Zag Staircases along side walls) */}
          {[-5.8, 5.8].map((xGhat, sideIdx) => (
            <group key={`ghat-side-${sideIdx}`}>
              {Array.from({ length: 9 }).map((_, stepBay) => {
                const zCenter = -12 + stepBay * 4;
                return (
                  <group key={`bay-${stepBay}`} position={[xGhat, 0, zCenter]}>
                    {Array.from({ length: 6 }).map((_, s) => (
                      <mesh
                        key={`s-${s}`}
                        position={[0, -1 - s * 1.5, sideIdx === 0 ? s * 0.4 : -s * 0.4]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[1.8, 0.4, 3.2 - s * 0.35]} />
                        <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                      </mesh>
                    ))}
                  </group>
                );
              })}
            </group>
          ))}

          {/* Central Ceremonial Stepped Descent */}
          {Array.from({ length: 18 }).map((_, stepIdx) => {
            const zPos = 20 - stepIdx * 1.8;
            const yPos = -0.5 - stepIdx * 0.6;
            return (
              <mesh key={`flight-${stepIdx}`} position={[0, yPos, zPos]} receiveShadow castShadow>
                <boxGeometry args={[8.5, 0.55, 1.8]} />
                <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
              </mesh>
            );
          })}

          {/* 5 Subterranean Kuta Pavilions */}
          {[16, 8, 0, -8].map((zPavilion, pIdx) => {
            const floorY = -2 - pIdx * 2.4;
            const roofY = floorY + 4.2;
            const tierWidth = 12;

            return (
              <group key={`pavilion-${pIdx}`}>
                <mesh position={[0, floorY, zPavilion]} receiveShadow castShadow>
                  <boxGeometry args={[tierWidth, 0.6, 5]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>

                <mesh position={[0, roofY, zPavilion]} receiveShadow castShadow>
                  <boxGeometry args={[tierWidth, 0.7, 5]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>

                <mesh position={[0, roofY + 0.5, zPavilion]}>
                  <boxGeometry args={[tierWidth + 0.2, 0.3, 5.2]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.65} />
                </mesh>

                {/* Solanki Pillars */}
                {[-4, -1.35, 1.35, 4].map((xCol, cIdx) => (
                  <group key={`col-${pIdx}-${cIdx}`} position={[xCol, floorY + 0.3, zPavilion]}>
                    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                      <boxGeometry args={[0.9, 0.4, 0.9]} />
                      <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                    </mesh>
                    <mesh position={[0, 0.55, 0]} castShadow>
                      <cylinderGeometry args={[0.38, 0.42, 0.3, 8]} />
                      <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                    </mesh>
                    <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
                      <cylinderGeometry args={[0.32, 0.36, 2.4, 16]} />
                      <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                    </mesh>
                    <mesh position={[0, 3.2, 0]} castShadow>
                      <cylinderGeometry args={[0.42, 0.3, 0.3, 12]} />
                      <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                    </mesh>
                    <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
                      <boxGeometry args={[1.1, 0.3, 1.1]} />
                      <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                    </mesh>
                  </group>
                ))}

                {/* Cusped Torana Arch */}
                <group position={[0, roofY - 0.7, zPavilion]}>
                  <mesh rotation={[0, 0, 0]} castShadow>
                    <torusGeometry args={[1.35, 0.12, 10, 24, Math.PI]} />
                    <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.6, 0]}>
                    <coneGeometry args={[0.1, 0.35, 8]} />
                    <meshStandardMaterial color={0xffd700} emissive={0xd4af37} emissiveIntensity={0.2} />
                  </mesh>
                </group>

                {/* Balcony Jali Screen */}
                <mesh position={[0, floorY + 0.6, zPavilion + 2.3]} castShadow>
                  <boxGeometry args={[7.8, 0.7, 0.12]} />
                  <meshStandardMaterial map={jaliTex || undefined} color={stoneColor} roughness={0.7} />
                </mesh>
              </group>
            );
          })}

          {/* Deep Subterranean Well Shaft at Far End */}
          <group position={[0, -5, -17]}>
            <mesh receiveShadow castShadow>
              <cylinderGeometry args={[5.2, 5.2, 16, 24, 8, true]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} side={THREE.DoubleSide} />
            </mesh>

            {[-2, -5, -8, -11].map((rY, rIdx) => (
              <group key={`shaft-ring-${rIdx}`} position={[0, rY, 0]}>
                <mesh receiveShadow>
                  <torusGeometry args={[4.8, 0.35, 8, 24]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.7} />
                </mesh>
              </group>
            ))}

            {/* Sacred Subterranean Water Surface */}
            <mesh position={[0, epoch === 0 ? -9 : epoch === 1 ? -10.5 : -11.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[4.9, 32]} />
              <meshStandardMaterial color={epoch === 2 ? 0x1f382a : 0x0a4d68} roughness={0.08} metalness={0.92} transparent opacity={0.88} />
            </mesh>
          </group>

          {/* Wall Niches with Sculpted Silhouettes */}
          {[-6.6, 6.6].map((xWall, wIdx) => (
            <group key={`niches-wall-${wIdx}`}>
              {[-10, -2, 6, 14].map((zNiche, nIdx) => (
                <group
                  key={`niche-${nIdx}`}
                  position={[xWall, -3.5 - (nIdx % 3) * 2, zNiche]}
                  rotation={[0, wIdx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
                >
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.4, 2.2, 0.5]} />
                    <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={0.7} />
                  </mesh>
                  <mesh position={[0, 1.4, 0]} castShadow>
                    <coneGeometry args={[0.7, 0.8, 4]} />
                    <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.65} />
                  </mesh>
                  <mesh position={[0, -0.1, 0.15]} castShadow>
                    <capsuleGeometry args={[0.22, 0.8, 8, 12]} />
                    <meshStandardMaterial color={0xc49a62} roughness={0.5} metalness={0.15} />
                  </mesh>
                </group>
              ))}
            </group>
          ))}

          {/* 1890 CE Silt Mound Layer */}
          {epoch === 2 && (
            <group position={[0, -10.5, -4]}>
              <mesh position={[0, 0, 0]} receiveShadow>
                <boxGeometry args={[11, 2.2, 22]} />
                <meshStandardMaterial color={0x524330} roughness={0.98} />
              </mesh>
            </group>
          )}

          {/* 2026 CE ASI Laser Scanning LiDAR Grid */}
          {epoch === 3 && (
            <group ref={laserRef} position={[0, -6, 5]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 6.8, 32]} />
                <meshBasicMaterial color={0x00ffcc} wireframe transparent opacity={0.35} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[13, 0.1]} />
                <meshBasicMaterial color={0x38bdf8} transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}

          {/* Flickering Torches & Oil Diyas */}
          <group ref={torchesRef}>
            {[-6.2, 6.2].map((xTorch, tIdx) => (
              <group key={`torch-group-${tIdx}`}>
                {[12, 4, -4, -12].map((zTorch, tzIdx) => (
                  <group key={`torch-${tzIdx}`} position={[xTorch, -3.2, zTorch]}>
                    <mesh position={[0, 0, 0]}>
                      <cylinderGeometry args={[0.15, 0.08, 0.2, 8]} />
                      <meshStandardMaterial color={0xb8860b} metalness={0.8} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 0.18, 0]}>
                      <sphereGeometry args={[0.09, 8, 8]} />
                      <meshBasicMaterial color={0xffaa22} />
                    </mesh>
                    <pointLight color={0xff7711} intensity={1.2} distance={7} decay={2} />
                  </group>
                ))}
              </group>
            ))}
          </group>

          {/* Volumetric Sunlight Shaft */}
          <group position={[0, 2, -5]} rotation={[0.2, 0, (timeOfDay - 12) * 0.04]}>
            <mesh>
              <cylinderGeometry args={[3.5, 6.5, 14, 16, 1, true]} />
              <meshBasicMaterial color={0xffecc4} transparent opacity={0.07} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        </group>
      )}

      {/* ================= 2. KUND STEPPED RESERVOIR (Surya Kund, Modhera) ================= */}
      {(archetype === "kund_stepped" || archetype === "octagonal_kund") && (
        <group>
          {Array.from({ length: 8 }).map((_, stepTier) => {
            const size = 32 - stepTier * 3.2;
            const y = -stepTier * 1.2;
            return (
              <mesh key={`kund-tier-${stepTier}`} position={[0, y, 0]} receiveShadow castShadow>
                <boxGeometry args={[size, 1.2, size]} />
                <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
              </mesh>
            );
          })}

          {/* 108 Miniature Shrines (Devakulikas) */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const rad = 11;
            return (
              <group key={`shrine-${i}`} position={[Math.cos(angle) * rad, -3, Math.sin(angle) * rad]} rotation={[0, -angle + Math.PI / 2, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.2, 1.4, 1.2]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.2, 0]} castShadow>
                  <coneGeometry args={[0.8, 1.2, 4]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.6} />
                </mesh>
              </group>
            );
          })}

          <mesh position={[0, -8.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color={0x0b6082} roughness={0.06} metalness={0.9} transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* ================= 3. MONOLITHIC ROCK-CUT (Kailasa Temple Ellora) ================= */}
      {archetype === "monolithic_rockcut" && (
        <group position={[0, -4, 0]}>
          {/* Surrounding Mountain Quarry Excavation Pit Walls */}
          {[-16, 16].map((xPit, idx) => (
            <mesh key={`pit-${idx}`} position={[xPit, 8, 0]}>
              <boxGeometry args={[4, 24, 40]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={new THREE.Color(0x8a7a68)} roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[0, 8, -20]}>
            <boxGeometry args={[36, 24, 4]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={new THREE.Color(0x8a7a68)} roughness={0.95} />
          </mesh>

          {/* Elevated Rock-cut Jagati Plinth */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[18, 2.5, 26]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          {/* Carved Monolithic Elephants Lining Plinth */}
          {[-7.5, 7.5].map((xEl, sideIdx) => (
            <group key={`el-side-${sideIdx}`}>
              {[-8, -3, 2, 7].map((zEl, elIdx) => (
                <mesh key={`el-${elIdx}`} position={[xEl, 0.5, zEl]} castShadow>
                  <capsuleGeometry args={[0.6, 1.0, 8, 12]} />
                  <meshStandardMaterial color={0x736357} roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Central Soaring Vimana Tower (Multi-tiered pyramidal shikhara) */}
          {Array.from({ length: 6 }).map((_, tier) => {
            const w = 10 - tier * 1.4;
            const h = 1.8;
            const y = 2.2 + tier * 1.8;
            return (
              <group key={`vimana-tier-${tier}`} position={[0, y, -4]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[w, h, w]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
                <mesh position={[0, h * 0.5, 0]}>
                  <boxGeometry args={[w + 0.3, 0.25, w + 0.3]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.7} />
                </mesh>
              </group>
            );
          })}

          {/* Octagonal Shikhara Dome & Kalasha Finial */}
          <group position={[0, 13.8, -4]}>
            <mesh castShadow>
              <cylinderGeometry args={[1.2, 1.8, 1.5, 8]} />
              <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <coneGeometry args={[0.4, 1.2, 8]} />
              <meshStandardMaterial color={0xffd700} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Front Mandapa with Torana */}
          <group position={[0, 2.5, 8]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[12, 3.2, 10]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
            </mesh>
          </group>

          {/* Twin Monolithic Victory Pillars (Dhvajastambhas) */}
          {[-9, 9].map((xStambha, sIdx) => (
            <group key={`stambha-${sIdx}`} position={[xStambha, 5, 10]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.5, 0.7, 10, 16]} />
                <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={0.7} />
              </mesh>
              <mesh position={[0, 5.5, 0]}>
                <sphereGeometry args={[0.6, 12, 12]} />
                <meshStandardMaterial color={0xffd700} metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ================= 4. NAGARA SHIKHARA (Somnath Temple) ================= */}
      {archetype === "nagara_shikhara" && (
        <group position={[0, -2, 0]}>
          {/* Jagati Plinth with Stepped Frieze */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[22, 2.5, 28]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          {/* Sabha Mandapa with Corbelled Pyramidal Samvarna Roof */}
          <group position={[0, 2.5, 6]}>
            {Array.from({ length: 6 }).map((_, sIdx) => {
              const sz = 14 - sIdx * 2.1;
              return (
                <mesh key={`samvarna-${sIdx}`} position={[0, 1.5 + sIdx * 0.9, 0]} castShadow>
                  <cylinderGeometry args={[sz - 1.2, sz, 0.85, 8]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
              );
            })}
          </group>

          {/* Soaring Curvilinear Rekha-Nagara Shikhara Tower (Height 20m) */}
          <group position={[0, 2.5, -6]}>
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[11, 4, 11]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
            </mesh>

            {/* Curvilinear Shikhara Body */}
            {Array.from({ length: 8 }).map((_, t) => {
              const rad = 5.2 * Math.cos((t / 8) * (Math.PI / 2.3));
              const radTop = 5.2 * Math.cos(((t + 1) / 8) * (Math.PI / 2.3));
              const yH = 4 + t * 1.8;
              return (
                <mesh key={`shikhara-tier-${t}`} position={[0, yH, 0]} castShadow>
                  <cylinderGeometry args={[Math.max(0.6, radTop), Math.max(1.0, rad), 1.8, 16]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
              );
            })}

            {/* Giant Ribbed Amalaka Stone & Kalasha Finial */}
            <group position={[0, 19, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[2.2, 2.0, 0.8, 24]} />
                <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.6} />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <coneGeometry args={[0.5, 1.8, 12]} />
                <meshStandardMaterial color={0xffaa00} metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Saffron Temple Dhvaja Flag */}
              <mesh position={[0.6, 2.0, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[1.4, 0.8, 0.05]} />
                <meshStandardMaterial color={0xff6600} roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* ================= 5. CHARIOT MANDAPA (Konark / Hampi Stone Chariot) ================= */}
      {archetype === "chariot_mandapa" && (
        <group position={[0, -2, 0]}>
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[16, 2.2, 20]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          {/* 4 Monumental Stone Chariot Wheels */}
          {[-8.5, 8.5].map((xW, sideIdx) => (
            <group key={`wheel-side-${sideIdx}`}>
              {[-5, 5].map((zW, wIdx) => (
                <group key={`w-${wIdx}`} position={[xW, 0.5, zW]} rotation={[0, 0, sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[2.4, 2.4, 0.6, 24]} />
                    <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.65} />
                  </mesh>
                  <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.8, 16]} />
                    <meshStandardMaterial color={0xffd700} metalness={0.7} roughness={0.3} />
                  </mesh>
                </group>
              ))}
            </group>
          ))}

          {/* Front Sculpted Elephants Pulling Chariot */}
          {[-3.5, 3.5].map((xEl, idx) => (
            <mesh key={`el-front-${idx}`} position={[xEl, 0.2, 12]} castShadow>
              <capsuleGeometry args={[0.9, 1.8, 8, 12]} />
              <meshStandardMaterial color={0x736357} roughness={0.9} />
            </mesh>
          ))}

          {/* Central Carved Mandapa Pavilion on Chariot */}
          <group position={[0, 2.5, 0]}>
            {[-5, 5].map((xCol, cx) =>
              [-6, 6].map((zCol, cz) => (
                <mesh key={`c-${cx}-${cz}`} position={[xCol, 2, zCol]} castShadow>
                  <cylinderGeometry args={[0.4, 0.45, 4, 12]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
              ))
            )}
            <mesh position={[0, 4.5, 0]} castShadow>
              <boxGeometry args={[14, 1.2, 16]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
            </mesh>
          </group>
        </group>
      )}

      {/* ================= 6. HIMALAYAN SHIKHARA (Kedarnath) ================= */}
      {archetype === "himalayan_shikhara" && (
        <group position={[0, -2, 0]}>
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[18, 2.0, 22]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={new THREE.Color(0x737373)} roughness={0.95} />
          </mesh>

          {/* Rugged Grey Ashlar Sanctum Walls */}
          <mesh position={[0, 4, -3]} castShadow receiveShadow>
            <boxGeometry args={[12, 6, 12]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={new THREE.Color(0x808080)} roughness={0.9} />
          </mesh>

          {/* Sloping Timber & Slate Pagoda Gables */}
          <mesh position={[0, 9, -3]} rotation={[0, 0, 0]} castShadow>
            <coneGeometry args={[9, 5, 4]} />
            <meshStandardMaterial color={0x3a3f44} roughness={0.8} />
          </mesh>

          {/* Brass Kalasha Finial */}
          <mesh position={[0, 12, -3]}>
            <coneGeometry args={[0.4, 1.5, 8]} />
            <meshStandardMaterial color={0xffaa00} metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Front Pillared Sabha Hall with Arched Porch */}
          <mesh position={[0, 3, 6]} castShadow receiveShadow>
            <boxGeometry args={[10, 4.5, 8]} />
            <meshStandardMaterial color={0x737373} roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ================= 7. STEPPED PYRAMID BAORI (Chand Baori) ================= */}
      {archetype === "stepped_pyramid_baori" && (
        <group position={[0, 0, 0]}>
          {Array.from({ length: 12 }).map((_, stepTier) => {
            const size = 36 - stepTier * 2.8;
            const y = -stepTier * 1.1;
            return (
              <mesh key={`cb-tier-${stepTier}`} position={[0, y, 0]} receiveShadow castShadow>
                <boxGeometry args={[size, 1.1, size]} />
                <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
              </mesh>
            );
          })}
          <mesh position={[0, -13.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color={0x0b6082} roughness={0.05} metalness={0.9} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* ================= 8. TEMPLE MANDAPA (Rudra Mahalaya) ================= */}
      {archetype === "temple_mandapa" && (
        <group>
          <mesh position={[0, -2, 0]} receiveShadow castShadow>
            <boxGeometry args={[22, 2.5, 22]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          <group position={[0, 4, 10]}>
            {[-3.5, 3.5].map((xP, idx) => (
              <mesh key={`tp-${idx}`} position={[xP, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.55, 0.65, 8, 16]} />
                <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={0.7} />
              </mesh>
            ))}
            <mesh position={[0, 3.5, 0]} castShadow>
              <torusGeometry args={[3.5, 0.35, 12, 32, Math.PI]} />
              <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.6} />
            </mesh>
          </group>

          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r = 7;
            return (
              <group key={`m-col-${i}`} position={[Math.cos(angle) * r, 2, Math.sin(angle) * r]}>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.42, 0.48, 6, 16]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
              </group>
            );
          })}

          {Array.from({ length: 5 }).map((_, d) => (
            <mesh key={`dome-${d}`} position={[0, 5.2 + d * 0.8, 0]} castShadow>
              <cylinderGeometry args={[7.5 - d * 1.3, 8 - d * 1.3, 0.7, 16]} />
              <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
            </mesh>
          ))}
        </group>
      )}

      {/* ================= 9. DOMED MAUSOLEUM / MUGHAL TOMB (Taj Mahal) ================= */}
      {(archetype === "domed_mausoleum" || archetype === "mughal_tomb") && (
        <group position={[0, 0, 0]}>
          {/* Lower Red Sandstone Platform (Charbagh Garden Terrace) */}
          <mesh position={[0, -1.8, 0]} receiveShadow>
            <boxGeometry args={[34, 1.4, 34]} />
            <meshStandardMaterial color={0x873926} roughness={0.85} />
          </mesh>

          {/* Monumental Pure White Makrana Marble Plinth (Chabutara) */}
          <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
            <boxGeometry args={[26, 1.5, 26]} />
            <meshStandardMaterial
              color={epoch === 2 ? 0xe2ded4 : 0xf8f9fa}
              roughness={epoch === 2 ? 0.35 : 0.16}
              metalness={0.06}
            />
          </mesh>

          {/* Main Central Tomb Building - Octagonal Chamfered Plan */}
          <group position={[0, 0.35, 0]}>
            {/* Main Central Cube */}
            <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[14, 8.5, 14]} />
              <meshStandardMaterial
                color={epoch === 2 ? 0xe5e1d7 : 0xfbfafe}
                roughness={epoch === 2 ? 0.32 : 0.14}
                metalness={0.08}
              />
            </mesh>

            {/* Chamfered Corners (Baghdadi Octagon) */}
            {[
              [-7, 4.5, -7],
              [7, 4.5, -7],
              [-7, 4.5, 7],
              [7, 4.5, 7],
            ].map((cPos, cIdx) => (
              <mesh key={`chamfer-${cIdx}`} position={cPos as [number, number, number]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.4, 8.52, 3.4]} />
                <meshStandardMaterial
                  color={epoch === 2 ? 0xe0dcd2 : 0xf7f8fa}
                  roughness={epoch === 2 ? 0.34 : 0.15}
                />
              </mesh>
            ))}

            {/* Monumental Recessed Vaulted Pishtaq Iwans on 4 Cardinal Facades */}
            {[
              [0, 4.2, 7.05, 0],
              [0, 4.2, -7.05, Math.PI],
              [-7.05, 4.2, 0, Math.PI / 2],
              [7.05, 4.2, 0, -Math.PI / 2],
            ].map(([x, y, z, rotY], iwanIdx) => (
              <group key={`iwan-${iwanIdx}`} position={[x, y, z]} rotation={[0, rotY, 0]}>
                {/* Outer Pishtaq Framing Border */}
                <mesh position={[0, 0.2, 0.05]} castShadow>
                  <boxGeometry args={[7.2, 7.6, 0.2]} />
                  <meshStandardMaterial color={0xf0f2f5} roughness={0.2} />
                </mesh>
                {/* Deep Vaulted Arch Recess */}
                <mesh position={[0, -0.2, -0.4]} receiveShadow>
                  <boxGeometry args={[4.6, 5.8, 1.2]} />
                  <meshStandardMaterial color={0x2a2829} roughness={0.8} />
                </mesh>
                {/* Arched Top Canopy */}
                <mesh position={[0, 2.7, -0.4]} rotation={[0, 0, 0]}>
                  <cylinderGeometry args={[2.3, 2.3, 1.2, 16, 1, false, 0, Math.PI]} />
                  <meshStandardMaterial color={0x1e1d1f} roughness={0.8} />
                </mesh>
                {/* Calligraphic Inlay Ribbon Border */}
                <mesh position={[0, 0.2, 0.16]}>
                  <boxGeometry args={[6.4, 7.0, 0.04]} />
                  <meshStandardMaterial color={0x1c1a1a} roughness={0.9} />
                </mesh>
              </group>
            ))}

            {/* High Cylindrical Drum beneath Dome */}
            <mesh position={[0, 9.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[4.3, 4.4, 2.4, 36]} />
              <meshStandardMaterial
                color={epoch === 2 ? 0xe2ded4 : 0xf9f9fc}
                roughness={epoch === 2 ? 0.3 : 0.14}
              />
            </mesh>

            {/* Monumental Swelling Bulbous Onion Dome (Amrud) */}
            <mesh position={[0, 12.2, 0]} castShadow>
              <sphereGeometry args={[4.6, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
              <meshStandardMaterial
                color={epoch === 2 ? 0xe5e1d7 : 0xffffff}
                roughness={epoch === 2 ? 0.28 : 0.12}
                metalness={0.1}
              />
            </mesh>

            {/* Tapered Lotus Inverted Dome Crest */}
            <mesh position={[0, 14.8, 0]} castShadow>
              <coneGeometry args={[3.2, 3.8, 36]} />
              <meshStandardMaterial
                color={epoch === 2 ? 0xe2ddd2 : 0xfbfcfe}
                roughness={epoch === 2 ? 0.28 : 0.12}
              />
            </mesh>

            {/* Golden Bronze Kalasha & Crescent Finial */}
            <group position={[0, 17.6, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.35, 3.2, 16]} />
                <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <torusGeometry args={[0.45, 0.08, 12, 24, Math.PI * 1.5]} />
                <meshStandardMaterial color={0xd4af37} metalness={0.9} roughness={0.2} />
              </mesh>
            </group>

            {/* Four Domed Corner Chattris (Pavilions around Main Dome) */}
            {[
              [-5.4, 9.5, -5.4],
              [5.4, 9.5, -5.4],
              [-5.4, 9.5, 5.4],
              [5.4, 9.5, 5.4],
            ].map(([cx, cy, cz], chIdx) => (
              <group key={`chattri-${chIdx}`} position={[cx, cy, cz]}>
                {/* 4 Pillared Kiosk */}
                {[
                  [-0.8, 0, -0.8],
                  [0.8, 0, -0.8],
                  [-0.8, 0, 0.8],
                  [0.8, 0, 0.8],
                ].map(([px, py, pz], pIdx) => (
                  <mesh key={`cp-${pIdx}`} position={[px, 1.2, pz]} castShadow>
                    <cylinderGeometry args={[0.16, 0.2, 2.4, 12]} />
                    <meshStandardMaterial color={0xf2f4f7} roughness={0.2} />
                  </mesh>
                ))}
                {/* Chattri Dome & Finial */}
                <mesh position={[0, 2.7, 0]} castShadow>
                  <sphereGeometry args={[1.35, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                  <meshStandardMaterial color={0xf8f9fa} roughness={0.16} />
                </mesh>
                <mesh position={[0, 3.7, 0]}>
                  <coneGeometry args={[0.15, 0.9, 12]} />
                  <meshStandardMaterial color={0xd4af37} metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Four Iconic Detached Corner Minarets */}
          {[
            [-11.5, -0.4, -11.5],
            [11.5, -0.4, -11.5],
            [-11.5, -0.4, 11.5],
            [11.5, -0.4, 11.5],
          ].map(([mx, my, mz], mIdx) => (
            <group key={`minar-${mIdx}`} position={[mx, my, mz]}>
              {/* Octagonal Plinth Base */}
              <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.35, 1.5, 1.8, 8]} />
                <meshStandardMaterial color={0xf2f4f7} roughness={0.2} />
              </mesh>

              {/* Tier 1 Shaft */}
              <mesh position={[0, 4.6, 0]} castShadow>
                <cylinderGeometry args={[1.05, 1.25, 5.8, 18]} />
                <meshStandardMaterial color={0xf6f7f9} roughness={0.18} />
              </mesh>
              {/* Balcony 1 */}
              <mesh position={[0, 7.6, 0]} castShadow>
                <cylinderGeometry args={[1.4, 1.1, 0.45, 18]} />
                <meshStandardMaterial color={0xeceef2} roughness={0.22} />
              </mesh>

              {/* Tier 2 Shaft */}
              <mesh position={[0, 10.3, 0]} castShadow>
                <cylinderGeometry args={[0.88, 1.02, 5.0, 18]} />
                <meshStandardMaterial color={0xf6f7f9} roughness={0.18} />
              </mesh>
              {/* Balcony 2 */}
              <mesh position={[0, 12.9, 0]} castShadow>
                <cylinderGeometry args={[1.22, 0.92, 0.4, 18]} />
                <meshStandardMaterial color={0xeceef2} roughness={0.22} />
              </mesh>

              {/* Tier 3 Shaft */}
              <mesh position={[0, 15.1, 0]} castShadow>
                <cylinderGeometry args={[0.74, 0.86, 4.0, 18]} />
                <meshStandardMaterial color={0xf6f7f9} roughness={0.18} />
              </mesh>
              {/* Balcony 3 */}
              <mesh position={[0, 17.2, 0]} castShadow>
                <cylinderGeometry args={[1.05, 0.78, 0.35, 18]} />
                <meshStandardMaterial color={0xeceef2} roughness={0.22} />
              </mesh>

              {/* Crown Chattri Pavilion */}
              <group position={[0, 17.8, 0]}>
                {Array.from({ length: 6 }).map((_, pi) => {
                  const ang = (pi / 6) * Math.PI * 2;
                  return (
                    <mesh key={`p-${pi}`} position={[Math.cos(ang) * 0.65, 0.8, Math.sin(ang) * 0.65]}>
                      <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
                      <meshStandardMaterial color={0xf2f4f7} roughness={0.2} />
                    </mesh>
                  );
                })}
                <mesh position={[0, 1.9, 0]} castShadow>
                  <sphereGeometry args={[0.92, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                  <meshStandardMaterial color={0xf8f9fa} roughness={0.16} />
                </mesh>
                <mesh position={[0, 2.7, 0]}>
                  <coneGeometry args={[0.12, 0.7, 10]} />
                  <meshStandardMaterial color={0xd4af37} metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            </group>
          ))}

          {/* Central Reflecting Lotus Pool & Charbagh Waterway */}
          <group position={[0, -0.6, 22]}>
            {/* Waterway Canal Basin */}
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[4.8, 0.4, 18]} />
              <meshStandardMaterial color={0xd53e2a} roughness={0.9} />
            </mesh>
            {/* Reflective Water Surface */}
            <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4.2, 17.6]} />
              <meshStandardMaterial color={0x0b6885} roughness={0.06} metalness={0.85} transparent opacity={0.92} />
            </mesh>
            {/* Fountain Spray Jets */}
            {[-6, -2, 2, 6].map((fz, fIdx) => (
              <mesh key={`fount-${fIdx}`} position={[0, 0.8, fz]}>
                <cylinderGeometry args={[0.08, 0.02, 1.2, 8]} />
                <meshStandardMaterial color={0x80d8ff} transparent opacity={0.65} />
              </mesh>
            ))}
            {/* Flanking Cypress Trees */}
            {[-3.4, 3.4].map((tx, side) =>
              [-6, -1, 4].map((tz, ti) => (
                <group key={`tree-${side}-${ti}`} position={[tx, 0.2, tz]}>
                  <mesh position={[0, 2.2, 0]} castShadow>
                    <coneGeometry args={[0.65, 4.4, 8]} />
                    <meshStandardMaterial color={0x1b4332} roughness={0.9} />
                  </mesh>
                </group>
              ))
            )}
          </group>
        </group>
      )}

      {/* ================= 10. BUDDHIST STUPA (Sanchi Stupa) ================= */}
      {archetype === "stupa" && (
        <group position={[0, -2, 0]}>
          {/* Circular Terrace (Medhi) Base */}
          <mesh position={[0, 0.8, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[14, 15, 1.8, 32]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          {/* Massive Hemispherical Dome (Anda) */}
          <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
            <sphereGeometry args={[12, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
          </mesh>

          {/* Square Balcony (Harmika) on Top of Dome */}
          <group position={[0, 13.8, 0]}>
            <mesh castShadow>
              <boxGeometry args={[3.2, 1.2, 3.2]} />
              <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.7} />
            </mesh>
            {/* Three-Tiered Umbrella (Chhatravali) */}
            {[0, 1.1, 2.2].map((chY, cIdx) => (
              <mesh key={`chhatra-${cIdx}`} position={[0, 1.0 + chY, 0]} castShadow>
                <cylinderGeometry args={[1.8 - cIdx * 0.45, 0.2, 0.25, 16]} />
                <meshStandardMaterial color={0xd4af37} metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* Four Elaborately Carved Torana Gateways (North, South, East, West) */}
          {[
            [0, 0, 16.5, 0],
            [0, 0, -16.5, Math.PI],
            [16.5, 0, 0, Math.PI / 2],
            [-16.5, 0, 0, -Math.PI / 2],
          ].map(([gx, gy, gz, rot], gIdx) => (
            <group key={`torana-${gIdx}`} position={[gx, gy, gz]} rotation={[0, rot, 0]}>
              {/* Two Vertical Pillars */}
              {[-2.2, 2.2].map((px, pIdx) => (
                <mesh key={`tp-${pIdx}`} position={[px, 4.5, 0]} castShadow>
                  <cylinderGeometry args={[0.42, 0.48, 9, 12]} />
                  <meshStandardMaterial map={sandstoneTex || undefined} color={stoneColor} roughness={roughness} />
                </mesh>
              ))}
              {/* Three Horizontal Architraves */}
              {[7.5, 8.5, 9.5].map((ay, aIdx) => (
                <mesh key={`architrave-${aIdx}`} position={[0, ay, 0]} castShadow>
                  <boxGeometry args={[6.2, 0.45, 0.4]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={stoneColor} roughness={0.65} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* ================= 11. VICTORY TOWER (Qutub Minar) ================= */}
      {archetype === "tower" && (
        <group position={[0, -2, 0]}>
          {/* Base Plinth */}
          <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[5.2, 5.6, 1.2, 24]} />
            <meshStandardMaterial color={0x9c4132} roughness={0.8} />
          </mesh>

          {/* 5 Tapering Storeys with Balconies */}
          {[
            { y: 5.5, h: 8.5, rB: 4.8, rT: 3.9, color: 0x9c4132 },
            { y: 13.5, h: 7.0, rB: 3.7, rT: 3.0, color: 0x9c4132 },
            { y: 20.0, h: 6.0, rB: 2.9, rT: 2.3, color: 0xa84c3d },
            { y: 25.5, h: 5.0, rB: 2.2, rT: 1.7, color: 0xf5f5f7 }, // White marble storey
            { y: 30.0, h: 4.0, rB: 1.6, rT: 1.2, color: 0xf5f5f7 }, // White marble storey
          ].map((storey, sIdx) => (
            <group key={`storey-${sIdx}`}>
              <mesh position={[0, storey.y, 0]} castShadow>
                <cylinderGeometry args={[storey.rT, storey.rB, storey.h, 24]} />
                <meshStandardMaterial color={storey.color} roughness={0.75} />
              </mesh>
              {/* Projecting Stalactite Corbelled Balcony */}
              <mesh position={[0, storey.y + storey.h / 2, 0]} castShadow>
                <cylinderGeometry args={[storey.rT + 0.65, storey.rT, 0.6, 24]} />
                <meshStandardMaterial color={0x822f22} roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ================= 12. SWAMINARAYAN AKSHARDHAM MANDIR (Gandhinagar) ================= */}
      {archetype === "akshardham_mandir" && (
        <group position={[0, 0, 0]}>
          {/* Expansive 3-Tiered Pink Bansipaharpur Sandstone Plinth (Jagati & Gajendra Pith) */}
          <mesh position={[0, -1.6, 0]} receiveShadow>
            <boxGeometry args={[36, 1.2, 34]} />
            <meshStandardMaterial color={0xc4735c} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
            <boxGeometry args={[30, 1.2, 28]} />
            <meshStandardMaterial color={0xd9826c} roughness={0.65} />
          </mesh>
          {/* Elephant Relief Lower Border (Gajendra Pith Frieze) */}
          <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
            <boxGeometry args={[27, 0.4, 25]} />
            <meshStandardMaterial map={friezeTex || undefined} color={0xd17862} roughness={0.7} />
          </mesh>

          {/* Surrounding Carved Colonnade Wings (Parikrama Colonnade) */}
          {[-14, 14].map((colX, sideIdx) => (
            <group key={`parikrama-${sideIdx}`} position={[colX, 0.2, 0]}>
              {[-10, -5, 0, 5, 10].map((pz, pi) => (
                <mesh key={`pcol-${pi}`} position={[0, 2.2, pz]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.35, 0.42, 4.4, 12]} />
                  <meshStandardMaterial color={0xd9826c} roughness={0.65} />
                </mesh>
              ))}
              {/* Colonnade Roof Entablature */}
              <mesh position={[0, 4.6, 0]} castShadow>
                <boxGeometry args={[2.0, 0.5, 23]} />
                <meshStandardMaterial color={0xc9735d} roughness={0.7} />
              </mesh>
            </group>
          ))}

          {/* Main Monument Complex Base */}
          <group position={[0, 0.2, 0]}>
            {/* Central Mandapa Hall (97 Pillars Interior Representation) */}
            <mesh position={[0, 2.8, 4]} castShadow receiveShadow>
              <boxGeometry args={[18, 5.2, 14]} />
              <meshStandardMaterial color={0xd9826c} roughness={0.65} />
            </mesh>

            {/* Front Porch (Mukhamandapa) with Carved Pillars & Torana Arches */}
            <group position={[0, 0, 12]}>
              {[-5, -1.8, 1.8, 5].map((px, pIdx) => (
                <mesh key={`front-col-${pIdx}`} position={[px, 2.6, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.38, 0.46, 5.2, 16]} />
                  <meshStandardMaterial color={0xe08c76} roughness={0.6} />
                </mesh>
              ))}
              {/* Carved Torana Pediment */}
              <mesh position={[0, 5.4, 0]} castShadow>
                <boxGeometry args={[13, 0.8, 1.2]} />
                <meshStandardMaterial map={friezeTex || undefined} color={0xd47f69} roughness={0.65} />
              </mesh>
            </group>

            {/* Central Main Sabha Mandapa Tiered Samvarna Roof */}
            <group position={[0, 5.4, 4]}>
              {Array.from({ length: 5 }).map((_, rIdx) => {
                const sz = 14 - rIdx * 2.2;
                return (
                  <mesh key={`samvarna-c-${rIdx}`} position={[0, 0.5 + rIdx * 0.75, 0]} castShadow>
                    <cylinderGeometry args={[sz - 1.2, sz, 0.75, 8]} />
                    <meshStandardMaterial color={0xd9826c} roughness={0.65} />
                  </mesh>
                );
              })}
              {/* Golden Finial on Central Mandapa */}
              <mesh position={[0, 4.8, 0]} castShadow>
                <coneGeometry args={[0.3, 1.8, 12]} />
                <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.25} />
              </mesh>
            </group>

            {/* 4 Subsidiary Corner Domes (Samvarna Kiosks) */}
            {[
              [-7, 5.4, -2],
              [7, 5.4, -2],
              [-7, 5.4, 8],
              [7, 5.4, 8],
            ].map(([dx, dy, dz], domeIdx) => (
              <group key={`sub-dome-${domeIdx}`} position={[dx, dy, dz]}>
                {Array.from({ length: 3 }).map((_, si) => (
                  <mesh key={`sd-${si}`} position={[0, 0.4 + si * 0.6, 0]} castShadow>
                    <cylinderGeometry args={[2.8 - si * 0.7, 3.2 - si * 0.7, 0.6, 8]} />
                    <meshStandardMaterial color={0xd17862} roughness={0.65} />
                  </mesh>
                ))}
                {/* Golden Kalash on Corner Domes */}
                <mesh position={[0, 2.6, 0]} castShadow>
                  <coneGeometry args={[0.2, 1.2, 10]} />
                  <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.25} />
                </mesh>
              </group>
            ))}

            {/* Monumental Soaring Central Rekha-Prasada Shikhara (Height 24m) */}
            <group position={[0, 5.2, -5]}>
              {/* Garbhagriha Sanctum Cubic Base */}
              <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[12, 5.0, 12]} />
                <meshStandardMaterial color={0xd9826c} roughness={0.65} />
              </mesh>

              {/* Soaring Curvilinear Rekha Body with Clustering Urushringas (Spirettes) */}
              {Array.from({ length: 9 }).map((_, t) => {
                const rad = 5.8 * Math.cos((t / 9) * (Math.PI / 2.3));
                const radTop = 5.8 * Math.cos(((t + 1) / 9) * (Math.PI / 2.3));
                const yH = 4.2 + t * 1.6;
                return (
                  <mesh key={`akshar-shikhara-${t}`} position={[0, yH, 0]} castShadow>
                    <cylinderGeometry args={[Math.max(0.6, radTop), Math.max(1.1, rad), 1.6, 16]} />
                    <meshStandardMaterial color={0xd9826c} roughness={0.65} />
                  </mesh>
                );
              })}

              {/* 4 Subsidiary Clustering Spirettes (Urushringas) around Main Shikhara */}
              {[
                [-3.6, 7.5, 0],
                [3.6, 7.5, 0],
                [0, 7.5, -3.6],
                [0, 7.5, 3.6],
              ].map(([ux, uy, uz], uIdx) => (
                <group key={`uru-${uIdx}`} position={[ux, uy, uz]}>
                  {Array.from({ length: 5 }).map((_, ui) => (
                    <mesh key={`ur-t-${ui}`} position={[0, ui * 1.2, 0]} castShadow>
                      <cylinderGeometry args={[1.2 - ui * 0.22, 1.5 - ui * 0.22, 1.2, 12]} />
                      <meshStandardMaterial color={0xd17862} roughness={0.68} />
                    </mesh>
                  ))}
                  <mesh position={[0, 6.4, 0]} castShadow>
                    <coneGeometry args={[0.22, 1.2, 10]} />
                    <meshStandardMaterial color={0xd4af37} metalness={0.85} roughness={0.25} />
                  </mesh>
                </group>
              ))}

              {/* Monumental Ribbed Amalaka Stone & Golden Kalash Finial */}
              <group position={[0, 19.2, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[2.5, 2.2, 0.9, 24]} />
                  <meshStandardMaterial map={friezeTex || undefined} color={0xc9735d} roughness={0.6} />
                </mesh>
                <mesh position={[0, 1.4, 0]} castShadow>
                  <coneGeometry args={[0.6, 2.2, 16]} />
                  <meshStandardMaterial color={0xd4af37} metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Saffron Sacred Swaminarayan Dhvaja (Temple Flag) */}
                <mesh position={[0.8, 2.4, 0]} rotation={[0, 0, -0.2]}>
                  <boxGeometry args={[1.8, 0.9, 0.05]} />
                  <meshStandardMaterial color={0xff5500} roughness={0.5} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Sahajanand Water Reservoir & Musical Fountain Pool in Front */}
          <group position={[0, -0.6, 18]}>
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[16, 0.4, 8]} />
              <meshStandardMaterial color={0xc9735d} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[15, 7.2]} />
              <meshStandardMaterial color={0x0b6885} roughness={0.08} metalness={0.85} transparent opacity={0.9} />
            </mesh>
            {/* Fountain Jets */}
            {[-5, -1.8, 1.8, 5].map((fx, fIdx) => (
              <mesh key={`akshar-f-${fIdx}`} position={[fx, 0.7, 0]}>
                <cylinderGeometry args={[0.07, 0.02, 1.4, 8]} />
                <meshStandardMaterial color={0x80d8ff} transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
}
