"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

// Brain lateral profile - parametric shape
function brainShape(t: number): [number, number] {
  // t goes from 0 to 2PI around the brain outline
  // This creates the classic lateral brain silhouette
  const cos = Math.cos;
  const sin = Math.sin;

  // Combine harmonics for brain shape
  let x = 1.3 * cos(t) + 0.3 * cos(2 * t) - 0.1 * cos(3 * t);
  let y = 1.0 * sin(t) + 0.2 * sin(2 * t) + 0.1 * sin(3 * t);

  // Make top bigger (cerebrum dome)
  if (y > 0) y *= 1.2;

  // Flatten bottom slightly
  if (y < -0.3) y *= 0.8;

  // Add frontal prominence
  if (x > 0.5 && y > 0) { x += 0.15; y += 0.1; }

  return [x, y];
}

// Generate nodes on brain surface
function generateBrainNodes(count: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const [bx, by] = brainShape(t);

    // Random radius from center to surface (fill the volume)
    const r = 0.5 + Math.random() * 0.5; // mostly on surface
    const x = bx * r;
    const y = by * r;
    const z = (Math.random() - 0.5) * 0.8 * r; // depth

    nodes.push(new THREE.Vector3(x, y, z));
  }
  return nodes;
}

// Connect nearest neighbors
function connectNodes(nodes: THREE.Vector3[]): [number, number][] {
  const conns: [number, number][] = [];
  const maxDist = 0.5;

  for (let i = 0; i < nodes.length; i++) {
    // Find nearest 6 nodes
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = nodes[i].distanceTo(nodes[j]);
      if (d < maxDist) dists.push({ j, d });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(6, dists.length); k++) {
      if (i < dists[k].j) conns.push([i, dists[k].j]);
    }
  }

  // Dedupe
  const set = new Set(conns.map(([a, b]) => `${a}-${b}`));
  return [...set].map(s => { const [a, b] = s.split("-"); return [+a, +b]; });
}

function BrainMesh() {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, connections } = useMemo(() => {
    const n = generateBrainNodes(200);
    const c = connectNodes(n);
    return { nodes: n, connections: c };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle oscillation
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* CONNECTIONS - using Line from drei for visible thick lines */}
      {connections.map(([a, b], i) => {
        const start = nodes[a];
        const end = nodes[b];
        // Color gradient based on position
        const avgX = (start.x + end.x) / 2;
        const t = (avgX + 1.5) / 3;
        const color = new THREE.Color().lerpColors(
          new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t
        );
        return (
          <Line
            key={i}
            points={[[start.x, start.y, start.z], [end.x, end.y, end.z]]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.6}
          />
        );
      })}

      {/* NODES - glowing spheres */}
      {nodes.map((pos, i) => {
        const t = (pos.x + 1.5) / 3;
        const color = new THREE.Color().lerpColors(
          new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t
        );
        return (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
}

const MODULES = [
  "Financeiro", "CRM", "Estoque", "Comercial",
  "Analytics", "Automação", "RH", "Tributário",
  "Produção", "Compras", "Gestão", "IA",
];

function OrbitingLabels() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <group ref={ref}>
      {MODULES.map((name, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2;
        const r = 2.3;
        const y = Math.sin(angle * 1.5) * 0.4;
        return (
          <group key={name} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}>
            <mesh>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#0d9488" emissive="#5eead4" emissiveIntensity={3} />
            </mesh>
            <Html center distanceFactor={25} style={{ pointerEvents: "none", userSelect: "none" }}>
              <div style={{ fontSize: "6px", fontWeight: 700, color: "#fff", background: "rgba(13,148,136,0.95)", padding: "1px 4px", borderRadius: "4px", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                {name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function Scene() {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += (pointer.x * 0.15 - ref.current.rotation.y) * 0.005;
      ref.current.rotation.x += (-pointer.y * 0.08 - ref.current.rotation.x) * 0.005;
    }
  });

  return (
    <group ref={ref} scale={1.6}>
      <BrainMesh />
      <OrbitingLabels />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-3, -1, 2]} intensity={0.4} color="#22d3ee" />
        <Scene />
      </Canvas>
    </div>
  );
}
