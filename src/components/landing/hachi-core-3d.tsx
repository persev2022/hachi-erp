"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// BRAIN - Using explicit control points for accurate profile
// The outline is traced manually to match a brain silhouette
// ═══════════════════════════════════════════════════════════

// Brain outline as explicit XY coordinates (normalized -1 to 1)
// Traced from lateral brain anatomy reference
const BRAIN_OUTLINE: [number, number][] = [
  // Start from front-bottom, go clockwise
  [0.6, -0.1],   // front bottom
  [0.85, 0.1],   // frontal lower
  [1.0, 0.3],    // frontal mid
  [1.05, 0.5],   // frontal upper
  [0.95, 0.75],  // frontal dome
  [0.7, 0.95],   // top front
  [0.4, 1.05],   // parietal peak
  [0.1, 1.0],    // parietal mid
  [-0.2, 0.95],  // parietal-occipital
  [-0.5, 0.85],  // occipital upper
  [-0.75, 0.65], // occipital mid
  [-0.85, 0.4],  // occipital lower
  [-0.8, 0.1],   // occipital bottom
  [-0.7, -0.15], // above cerebellum
  [-0.5, -0.3],  // cerebellum top
  [-0.65, -0.5], // cerebellum back
  [-0.55, -0.7], // cerebellum bottom
  [-0.35, -0.6], // cerebellum front
  [-0.2, -0.45], // brain stem top
  [-0.15, -0.7], // brain stem mid
  [-0.1, -0.9],  // brain stem bottom
  [0.0, -0.7],   // stem front
  [0.1, -0.5],   // temporal bottom
  [0.3, -0.35],  // temporal lower
  [0.5, -0.2],   // temporal front
];

// Check if point is inside the brain outline (ray casting)
function isInsideBrain(x: number, y: number): boolean {
  let inside = false;
  const pts = BRAIN_OUTLINE;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Generate nodes INSIDE the brain shape
function generateBrainNodes(count: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];
  let attempts = 0;
  while (nodes.length < count && attempts < count * 20) {
    attempts++;
    const x = (Math.random() - 0.3) * 2.2; // shifted right (brain is asymmetric)
    const y = (Math.random() - 0.0) * 2.2;
    if (isInsideBrain(x, y)) {
      const z = (Math.random() - 0.5) * 0.7;
      nodes.push(new THREE.Vector3(x, y, z));
    }
  }
  return nodes;
}

function buildConnections(nodes: THREE.Vector3[]): [number, number][] {
  const conns = new Set<string>();
  const maxDist = 0.4;
  for (let i = 0; i < nodes.length; i++) {
    let cnt = 0;
    for (let j = i + 1; j < nodes.length && cnt < 5; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        conns.add(`${i}-${j}`);
        cnt++;
      }
    }
  }
  return [...conns].map(s => s.split("-").map(Number) as [number, number]);
}

function BrainNetwork() {
  const ref = useRef<THREE.Group>(null);
  const { nodes, connections } = useMemo(() => {
    const n = generateBrainNodes(280);
    const c = buildConnections(n);
    return { nodes: n, connections: c };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      {connections.map(([a, b], i) => {
        const mx = (nodes[a].x + nodes[b].x) / 2;
        const t = (mx + 1) / 2.2;
        const color = new THREE.Color().lerpColors(new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t);
        return <Line key={i} points={[nodes[a].toArray(), nodes[b].toArray()]} color={color} lineWidth={0.7} transparent opacity={0.45} />;
      })}
      {nodes.map((p, i) => {
        const t = (p.x + 1) / 2.2;
        const color = new THREE.Color().lerpColors(new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t);
        return (
          <mesh key={i} position={p.toArray() as [number, number, number]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>
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
      ref.current.rotation.y += (pointer.x * 0.1 - ref.current.rotation.y) * 0.004;
      ref.current.rotation.x += (-pointer.y * 0.05 - ref.current.rotation.x) * 0.004;
    }
  });
  return <group ref={ref} scale={1.5}><BrainNetwork /></group>;
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0.2, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.8} />
        <pointLight position={[-2, -1, 2]} intensity={0.4} color="#22d3ee" />
        <Scene />
      </Canvas>
      {/* Module labels as fixed CSS */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "90%", maxWidth: "600px", height: "80%", maxHeight: "450px" }}>
          {["Financeiro","CRM","Estoque","Comercial","Analytics","Automação","RH","Tributário","Produção","Compras","Gestão","IA"].map((name, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 46;
            const top = 50 + Math.sin(angle) * 44;
            return <span key={name} style={{ position: "absolute", left: `${left}%`, top: `${top}%`, transform: "translate(-50%,-50%)", fontSize: "8px", fontWeight: 700, color: "#fff", background: "rgba(13,148,136,0.9)", padding: "2px 6px", borderRadius: "5px", whiteSpace: "nowrap" }}>{name}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
