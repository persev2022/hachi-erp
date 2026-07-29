"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Brain LATERAL PROFILE - precise anatomical shape
// Key: the brain seen from the side has a specific outline:
// - Large frontal dome (top-front)
// - Rounded parietal area (top)
// - Occipital lobe (back, slightly smaller)
// - Temporal lobe (bottom-front, smaller bulge)
// - Cerebellum (small, bottom-back)
// - Brain stem (thin, descending from cerebellum)

function brainOutlinePoint(t: number): [number, number] {
  // t: 0 to 1 around the outline
  const angle = t * Math.PI * 2;

  // Multi-harmonic shape that resembles brain profile
  let x = Math.cos(angle) * 1.2
    + Math.cos(angle * 2) * 0.25
    + Math.cos(angle * 3) * 0.08;

  let y = Math.sin(angle) * 1.0
    + Math.sin(angle * 2) * 0.15
    + Math.sin(angle * 3) * 0.05;

  // Make top dome bigger
  if (y > 0) { y *= 1.25; x *= 1.05; }

  // Temporal lobe bump (bottom-front)
  if (y < -0.2 && x > 0.3) { y -= 0.1; x += 0.05; }

  // Flatten very bottom
  if (y < -0.8) y = -0.8 - (y + 0.8) * 0.3;

  return [x, y];
}

function generateNodes(count: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const [ox, oy] = brainOutlinePoint(t);

    // Fill interior with bias toward surface
    const fillRadius = 0.6 + Math.random() * 0.4;
    const x = ox * fillRadius;
    const y = oy * fillRadius;
    const z = (Math.random() - 0.5) * 0.7 * fillRadius;

    nodes.push(new THREE.Vector3(x, y, z));
  }
  return nodes;
}

function buildConnections(nodes: THREE.Vector3[]): [number, number][] {
  const conns: [number, number][] = [];
  const maxDist = 0.45;
  const seen = new Set<string>();

  for (let i = 0; i < nodes.length; i++) {
    let count = 0;
    for (let j = i + 1; j < nodes.length && count < 5; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        const key = `${i}-${j}`;
        if (!seen.has(key)) {
          seen.add(key);
          conns.push([i, j]);
          count++;
        }
      }
    }
  }
  return conns;
}

function BrainNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, connections } = useMemo(() => {
    const n = generateNodes(250);
    const c = buildConnections(n);
    return { nodes: n, connections: c };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connections */}
      {connections.map(([a, b], i) => {
        const avg = (nodes[a].x + nodes[b].x) / 2;
        const t = (avg + 1.5) / 3;
        const c = new THREE.Color().lerpColors(new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t);
        return (
          <Line key={i} points={[nodes[a].toArray(), nodes[b].toArray()]} color={c} lineWidth={0.8} transparent opacity={0.5} />
        );
      })}

      {/* Nodes */}
      {nodes.map((p, i) => {
        const t = (p.x + 1.5) / 3;
        const c = new THREE.Color().lerpColors(new THREE.Color("#0d9488"), new THREE.Color("#22d3ee"), t);
        return (
          <mesh key={i} position={p.toArray() as [number, number, number]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
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
      ref.current.rotation.y += (pointer.x * 0.12 - ref.current.rotation.y) * 0.005;
      ref.current.rotation.x += (-pointer.y * 0.06 - ref.current.rotation.x) * 0.005;
    }
  });
  return (
    <group ref={ref} scale={1.6}>
      <BrainNetwork />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.8} />
        <pointLight position={[-3, -1, 2]} intensity={0.4} color="#22d3ee" />
        <Scene />
      </Canvas>

      {/* Module labels as CSS overlay - perfectly sized, no 3D scaling issues */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "700px", height: "100%", maxHeight: "500px" }}>
          {["Financeiro", "CRM", "Estoque", "Comercial", "Analytics", "Automação", "RH", "Tributário", "Produção", "Compras", "Gestão", "IA"].map((name, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const rx = 48; // % from center
            const ry = 45;
            const left = 50 + Math.cos(angle) * rx;
            const top = 50 + Math.sin(angle) * ry;
            return (
              <span key={name} style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%, -50%)",
                fontSize: "9px",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(13,148,136,0.9)",
                padding: "2px 7px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
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
