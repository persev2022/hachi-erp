"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// DNA DOUBLE HELIX — "O DNA do seu negócio"
// Two intertwined helices with connecting rungs (base pairs)
// Each rung represents a module of the HACHI platform
// Extremely detailed: metallic materials, volumetric glow,
// particles, depth lighting, shadows
// ═══════════════════════════════════════════════════════════

const MODULES = [
  "Financeiro", "CRM", "Estoque", "Comercial",
  "Analytics", "Automação", "RH", "Tributário",
  "Produção", "Compras", "Gestão", "IA",
];

// Generate helix backbone points
function generateHelix(turns: number, pointsPerTurn: number, radius: number, height: number, phaseOffset: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const totalPoints = turns * pointsPerTurn;
  for (let i = 0; i <= totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2 + phaseOffset;
    const y = (t - 0.5) * height;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

// DNA Backbone strand (one helix)
function HelixStrand({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const tubeRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, points.length * 2, 0.04, 12, false);
  }, [points]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        metalness={0.9}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Base pair rungs connecting the two helices
function BasePairRungs({ helix1, helix2, count }: { helix1: THREE.Vector3[]; helix2: THREE.Vector3[]; count: number }) {
  const rungs = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; midColor: string }[] = [];
    const step = Math.floor(helix1.length / count);
    for (let i = 0; i < count; i++) {
      const idx = Math.min(i * step + Math.floor(step / 2), helix1.length - 1);
      // Gradient: teal at top, cyan at bottom
      const t = i / count;
      const color = new THREE.Color().lerpColors(
        new THREE.Color("#0d9488"),
        new THREE.Color("#22d3ee"),
        t
      ).getStyle();
      result.push({ start: helix1[idx], end: helix2[idx], midColor: color });
    }
    return result;
  }, [helix1, helix2, count]);

  return (
    <group>
      {rungs.map((rung, i) => (
        <group key={i}>
          {/* Rung tube */}
          <RungTube start={rung.start} end={rung.end} color={rung.midColor} />
          {/* Glowing sphere at each connection point */}
          <mesh position={rung.start.toArray() as [number, number, number]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial color={rung.midColor} emissive={rung.midColor} emissiveIntensity={1.5} roughness={0.1} metalness={0.8} clearcoat={1} />
          </mesh>
          <mesh position={rung.end.toArray() as [number, number, number]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial color={rung.midColor} emissive={rung.midColor} emissiveIntensity={1.5} roughness={0.1} metalness={0.8} clearcoat={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RungTube({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.LineCurve3(start, end);
    return new THREE.TubeGeometry(curve, 1, 0.02, 8, false);
  }, [start, end]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} metalness={0.7} clearcoat={0.5} transparent opacity={0.85} />
    </mesh>
  );
}

// Floating particles along the helix path
function HelixParticles() {
  const count = 100;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = t * 4 * Math.PI * 2 + Math.random() * 0.5;
      const radius = 0.8 + Math.random() * 0.6;
      const y = (t - 0.5) * 5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.025} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Complete DNA scene
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);

  const { helix1Points, helix2Points } = useMemo(() => {
    const turns = 3.5;
    const ppt = 40; // points per turn
    const radius = 0.6;
    const height = 5;
    const h1 = generateHelix(turns, ppt, radius, height, 0);
    const h2 = generateHelix(turns, ppt, radius, height, Math.PI); // 180° offset
    return { helix1Points: h1, helix2Points: h2 };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Helix strand 1 - teal */}
        <HelixStrand points={helix1Points} color="#0d9488" />
        {/* Helix strand 2 - cyan */}
        <HelixStrand points={helix2Points} color="#22d3ee" />
        {/* Base pair rungs connecting strands */}
        <BasePairRungs helix1={helix1Points} helix2={helix2Points} count={24} />
        {/* Ambient particles */}
        <HelixParticles />
      </group>
    </Float>
  );
}

// Mouse reactive wrapper
function Scene() {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += (-pointer.y * 0.08 - ref.current.rotation.x) * 0.005;
      ref.current.rotation.z += (pointer.x * 0.05 - ref.current.rotation.z) * 0.005;
    }
  });

  return (
    <group ref={ref} rotation={[0.1, 0, 0.15]} scale={1.1}>
      <DNAHelix />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.4;
        }}
      >
        {/* Ambient */}
        <ambientLight intensity={0.25} color="#f0fdfa" />

        {/* Key light - warm white from top right */}
        <directionalLight position={[4, 6, 4]} intensity={2} castShadow color="#ffffff" shadow-mapSize={[1024, 1024]} />

        {/* Fill light - teal from left */}
        <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#14b8a6" />

        {/* Rim light - cyan backlight */}
        <directionalLight position={[0, -3, -5]} intensity={0.6} color="#22d3ee" />

        {/* Top spotlight for dramatic highlight */}
        <spotLight position={[0, 8, 3]} angle={0.4} penumbra={1} intensity={1.5} castShadow color="#ffffff" />

        {/* Bottom cool accent */}
        <pointLight position={[0, -4, 2]} intensity={0.4} color="#5eead4" />

        <Scene />
      </Canvas>

      {/* Module labels orbiting as CSS */}
      <style>{`@keyframes orbitReverse { from { transform: translate(-50%,-50%) rotate(0deg) translateX(0px) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg) translateX(0px) rotate(360deg); } }`}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 30s linear infinite reverse" }}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div style={{ position: "relative", width: "85%", maxWidth: "550px", height: "75%", maxHeight: "420px" }}>
          {MODULES.map((name, i) => {
            const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 47;
            const top = 50 + Math.sin(angle) * 44;
            return (
              <span key={name} style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%,-50%)",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(13,148,136,0.92)",
                padding: "4px 10px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(13,148,136,0.4)",
                animation: `orbitReverse 25s linear infinite`,
              }}>
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
