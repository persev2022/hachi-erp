"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, Html } from "@react-three/drei";
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
    return new THREE.TubeGeometry(curve, points.length * 2, 0.055, 16, false);
  }, [points]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.08}
        metalness={0.95}
        clearcoat={1}
        clearcoatRoughness={0.02}
        emissive={color}
        emissiveIntensity={0.2}
        sheen={1}
        sheenRoughness={0.2}
        sheenColor="#99f6e4"
        iridescence={0.8}
        iridescenceIOR={1.3}
        reflectivity={1}
        envMapIntensity={1.5}
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
            <sphereGeometry args={[0.065, 20, 20]} />
            <meshPhysicalMaterial color={rung.midColor} emissive={rung.midColor} emissiveIntensity={1.2} roughness={0.05} metalness={0.9} clearcoat={1} clearcoatRoughness={0.01} iridescence={0.5} iridescenceIOR={1.5} />
          </mesh>
          <mesh position={rung.end.toArray() as [number, number, number]} castShadow>
            <sphereGeometry args={[0.065, 20, 20]} />
            <meshPhysicalMaterial color={rung.midColor} emissive={rung.midColor} emissiveIntensity={1.2} roughness={0.05} metalness={0.9} clearcoat={1} clearcoatRoughness={0.01} iridescence={0.5} iridescenceIOR={1.5} />
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
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.85} clearcoat={1} clearcoatRoughness={0.03} sheen={0.5} sheenColor="#5eead4" transparent opacity={0.9} />
    </mesh>
  );
}

// Floating particles along the helix path
function HelixParticles() {
  const count = 180;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = t * 5 * Math.PI * 2 + Math.random() * 0.8;
      const radius = 0.7 + Math.random() * 0.8;
      const y = (t - 0.5) * 6;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = -clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.02} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// Complete DNA scene
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);

  const { helix1Points, helix2Points } = useMemo(() => {
    const turns = 4.5;
    const ppt = 50;
    const radius = 0.55;
    const height = 5.5;
    const h1 = generateHelix(turns, ppt, radius, height, 0);
    const h2 = generateHelix(turns, ppt, radius, height, Math.PI);
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
        <HelixStrand points={helix1Points} color="#0d9488" />
        <HelixStrand points={helix2Points} color="#22d3ee" />
        <BasePairRungs helix1={helix1Points} helix2={helix2Points} count={30} />
        <HelixParticles />
        {/* Module labels orbiting INSIDE 3D, reverse direction */}
        <OrbitingLabels3D />
      </group>
    </Float>
  );
}

// Labels as 3D Html elements orbiting in reverse direction around the DNA
function OrbitingLabels3D() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Rotate in REVERSE direction
      ref.current.rotation.y = -clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={ref}>
      {MODULES.map((name, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2;
        const radius = 1.2;
        // Distribute vertically along the helix
        const y = ((i / MODULES.length) - 0.5) * 4.0;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={name} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.04, 10, 10]} />
              <meshStandardMaterial color="#0d9488" emissive="#5eead4" emissiveIntensity={3} />
            </mesh>
            <Html center distanceFactor={5} style={{ pointerEvents: "none" }} zIndexRange={[100, 0]}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(13,148,136,0.95)",
                padding: "4px 10px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 12px rgba(13,148,136,0.5)",
                border: "1px solid rgba(94,234,212,0.3)",
              }}>
                {name}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
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
          gl.toneMappingExposure = 1.5;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Studio lighting setup — cinema quality */}
        {/* Key light — bright white, creates main highlights */}
        <directionalLight position={[4, 6, 4]} intensity={2.5} castShadow color="#ffffff" shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />

        {/* Fill light — softer, teal tinted, from opposite side */}
        <directionalLight position={[-5, 3, -3]} intensity={1} color="#14b8a6" />

        {/* Rim/back light — creates edge definition (cinema technique) */}
        <directionalLight position={[0, -2, -6]} intensity={1.2} color="#22d3ee" />

        {/* Top hair light — highlights the top edges */}
        <spotLight position={[0, 10, 2]} angle={0.3} penumbra={0.8} intensity={2} castShadow color="#ffffff" distance={20} />

        {/* Bottom bounce — simulates floor reflection */}
        <pointLight position={[0, -5, 3]} intensity={0.6} color="#99f6e4" />

        {/* Side kicker — adds depth on left side */}
        <pointLight position={[-4, 0, 2]} intensity={0.5} color="#5eead4" />

        {/* Ambient — very low, keeps shadows not pitch black */}
        <ambientLight intensity={0.15} color="#f0fdfa" />

        <Scene />
      </Canvas>

      {/* Labels now inside 3D scene - no CSS overlay needed */}
    </div>
  );
}
