"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// BRAIN - lateral profile silhouette with dense network
// Reference: neuroscience brain graph visualization
// Colors: teal (#0d9488) to cyan (#22d3ee)
// ═══════════════════════════════════════════════════════════

// Brain profile: generate points that follow a brain silhouette (side view)
function generateBrainProfile(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    // Use parametric approach: angle around brain profile
    const t = Math.random() * Math.PI * 2;
    const depthRand = (Math.random() - 0.5) * 0.6; // Z depth (thickness)

    // Brain profile shape (side view) using superellipse + modifications
    // Frontal lobe: large, rounded top-front
    // Occipital lobe: rounded back
    // Temporal lobe: lower bulge
    // Cerebellum: small bulge bottom-back
    // Brain stem: thin extension downward

    let x = 0, y = 0;

    if (Math.random() < 0.85) {
      // Main cerebrum (85% of nodes)
      // Modified ellipse for brain profile
      const angle = t;
      // Base ellipse
      let rx = 1.4; // wider
      let ry = 1.1; // tall

      // Flatten the bottom
      if (Math.sin(angle) < 0) ry *= 0.7;

      // Frontal prominence (front-top is bigger)
      if (Math.cos(angle) > 0 && Math.sin(angle) > 0) {
        rx *= 1.15;
        ry *= 1.1;
      }

      x = rx * Math.cos(angle);
      y = ry * Math.sin(angle);

      // Push top-front up more (frontal lobe)
      if (y > 0 && x > 0) y += 0.2;

      // Indent bottom-center (sylvian fissure area)
      if (y < -0.3 && Math.abs(x) < 0.5) y += 0.15;

    } else if (Math.random() < 0.7) {
      // Cerebellum (10% of nodes) - small round below back
      const angle = Math.random() * Math.PI - Math.PI / 2;
      x = -0.8 + Math.cos(angle) * 0.45;
      y = -0.9 + Math.sin(angle) * 0.35;

    } else {
      // Brain stem (5% of nodes) - thin downward
      x = -0.3 + (Math.random() - 0.5) * 0.2;
      y = -1.1 - Math.random() * 0.5;
    }

    // Add surface noise for organic look
    x += (Math.random() - 0.5) * 0.15;
    y += (Math.random() - 0.5) * 0.12;

    // Distribute within volume (not just surface)
    const volumeFactor = 0.7 + Math.random() * 0.3;
    points.push(new THREE.Vector3(
      x * volumeFactor,
      y * volumeFactor,
      depthRand * volumeFactor
    ));
  }
  return points;
}

// Dense connections - each node connects to many nearby nodes
function generateConnections(nodes: THREE.Vector3[], maxDist: number): [number, number][] {
  const connections: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    // Each node connects to up to 8 nearest neighbors
    const distances: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = nodes[i].distanceTo(nodes[j]);
      if (d < maxDist) distances.push({ j, d });
    }
    distances.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(8, distances.length); k++) {
      const j = distances[k].j;
      if (i < j) connections.push([i, j]); // avoid duplicates
    }
  }
  // Deduplicate
  const seen = new Set<string>();
  return connections.filter(([a, b]) => {
    const key = `${a}-${b}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function BrainNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Group>(null);

  const { nodes, connections, lineObjects } = useMemo(() => {
    const n = generateBrainProfile(250);
    const c = generateConnections(n, 0.55);

    const lines = c.map(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([n[a], n[b]]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color("#5eead4"),
        transparent: true,
        opacity: 0.4,
      });
      return new THREE.Line(geo, mat);
    });

    return { nodes: n, connections: c, lineObjects: lines };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    }
    // Pulse synapses
    if (linesRef.current) {
      const t = clock.getElapsedTime();
      linesRef.current.children.forEach((line, i) => {
        const mat = (line as THREE.Line).material as THREE.LineBasicMaterial;
        mat.opacity = 0.25 + Math.sin(t * 1.5 + i * 0.3) * 0.2;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connections (synapses) */}
      <group ref={linesRef}>
        {lineObjects.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </group>

      {/* Nodes (neurons) - gradient from teal to cyan based on position */}
      {nodes.map((pos, i) => {
        // Color gradient: left=teal, right=cyan (like the reference image)
        const normalizedX = (pos.x + 1.5) / 3; // 0 to 1
        const color = new THREE.Color().lerpColors(
          new THREE.Color("#0d9488"),
          new THREE.Color("#22d3ee"),
          normalizedX
        );
        return (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Orbiting module labels
const MODULES = [
  "Financeiro", "CRM", "Estoque", "Comercial",
  "Analytics", "Automação", "RH", "Tributário",
  "Produção", "Compras", "Gestão", "IA",
];

function OrbitingModules() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {MODULES.map((name, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2;
        const radius = 2.2;
        const y = Math.sin(angle * 1.5) * 0.5;
        return (
          <group key={name} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            <mesh>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color="#0d9488" emissive="#5eead4" emissiveIntensity={2} />
            </mesh>
            <Html center distanceFactor={18} style={{ pointerEvents: "none" }}>
              <span style={{ fontSize: "8px", fontWeight: 600, color: "#fff", background: "rgba(13,148,136,0.9)", padding: "2px 6px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                {name}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.2 - groupRef.current.rotation.y) * 0.008;
      groupRef.current.rotation.x += (-pointer.y * 0.1 - groupRef.current.rotation.x) * 0.008;
    }
  });

  return (
    <group ref={groupRef} scale={1.5}>
      <BrainNetwork />
      <OrbitingModules />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#14b8a6" />
        <pointLight position={[0, -2, 3]} intensity={0.4} color="#22d3ee" />
        <Scene />
      </Canvas>
    </div>
  );
}
