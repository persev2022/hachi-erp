"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Generate brain-shaped nodes - realistic brain silhouette with 2 hemispheres
function generateBrainPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // Base ellipsoid
    let x = Math.sin(phi) * Math.cos(theta);
    let y = Math.cos(phi);
    let z = Math.sin(phi) * Math.sin(theta);

    // Scale to brain proportions: wide, short, medium depth
    x *= 1.6;
    y *= 1.15;
    z *= 1.3;

    // Central longitudinal fissure — split into two hemispheres
    // Deep groove at x≈0 when viewed from top
    const fissureDepth = 0.2 * Math.exp(-x * x * 8) * (y > -0.3 ? 1 : 0);
    if (x > 0) x += fissureDepth;
    else x -= fissureDepth;

    // Temporal lobe bulge (lower sides)
    if (y < -0.2 && Math.abs(x) > 0.5) {
      const bulge = 0.15 * Math.exp(-Math.pow(y + 0.5, 2) * 5);
      x *= (1 + bulge);
    }

    // Frontal lobe (front is slightly bigger)
    if (z > 0.3) z *= 1.1;

    // Gyri (wrinkles) — high frequency displacement on surface
    const gyri = Math.sin(theta * 8 + phi * 6) * 0.04
               + Math.cos(theta * 5 - phi * 9) * 0.03
               + Math.sin(theta * 12 + phi * 3) * 0.02;
    const nr = 1 + gyri;
    x *= nr;
    y *= nr;
    z *= nr;

    // Keep nodes on surface (cortex)
    const surfaceFactor = 0.9 + Math.random() * 0.1;
    points.push(new THREE.Vector3(x * surfaceFactor, y * surfaceFactor, z * surfaceFactor));
  }
  return points;
}

// Connect nearby nodes - more connections for density
function generateSynapses(nodes: THREE.Vector3[], maxDist: number, maxCount: number): [number, number][] {
  const connections: [number, number][] = [];
  for (let i = 0; i < nodes.length && connections.length < maxCount; i++) {
    let connectionsForNode = 0;
    for (let j = i + 1; j < nodes.length && connections.length < maxCount; j++) {
      if (connectionsForNode >= 5) break; // max 5 connections per node
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        connections.push([i, j]);
        connectionsForNode++;
      }
    }
  }
  return connections;
}

// Brain with nodes + synapse lines
function BrainGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Group>(null);

  const { nodes, synapses } = useMemo(() => {
    const n = generateBrainPoints(400);
    const s = generateSynapses(n, 0.4, 800);
    return { nodes: n, synapses: s };
  }, []);

  // Create line objects once
  const lineObjects = useMemo(() => {
    return synapses.map(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([nodes[a], nodes[b]]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color("#5eead4"),
        transparent: true,
        opacity: 0.5,
      });
      return new THREE.Line(geo, mat);
    });
  }, [nodes, synapses]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
    // Pulse synapse opacity
    if (linesRef.current) {
      const t = clock.getElapsedTime();
      linesRef.current.children.forEach((line, i) => {
        const mat = (line as THREE.Line).material as THREE.LineBasicMaterial;
        mat.opacity = 0.3 + Math.sin(t * 2 + i * 0.5) * 0.25;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Synapse lines */}
      <group ref={linesRef}>
        {lineObjects.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </group>

      {/* Neural nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.02 + (i % 4) * 0.005, 8, 8]} />
          <meshStandardMaterial
            color="#0d9488"
            emissive="#14b8a6"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Module labels orbiting - smaller, closer orbit
const MODULES = [
  "Financeiro", "CRM", "Estoque", "Comercial",
  "Analytics", "Automação", "RH", "Tributário",
  "Produção", "Compras", "Gestão", "IA",
];

function OrbitingModules() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {MODULES.map((name, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2;
        const radius = 2.0 + (i % 2) * 0.3;
        const y = Math.sin(angle * 2) * 0.4;
        return (
          <group key={name} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#0d9488" emissive="#5eead4" emissiveIntensity={2} />
            </mesh>
            <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
              <span style={{
                fontSize: "7px",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(13,148,136,0.9)",
                padding: "1px 6px",
                borderRadius: "8px",
                whiteSpace: "nowrap",
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

// Mouse parallax
function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.3 - groupRef.current.rotation.y) * 0.01;
      groupRef.current.rotation.x += (-pointer.y * 0.15 - groupRef.current.rotation.x) * 0.01;
    }
  });

  return (
    <group ref={groupRef} scale={1.4}>
      <BrainGraph />
      <OrbitingModules />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#14b8a6" />
        <pointLight position={[0, -3, 3]} intensity={0.5} color="#5eead4" />
        <Scene />
      </Canvas>
    </div>
  );
}
