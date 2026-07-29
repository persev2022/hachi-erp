"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Generate brain-shaped nodes - DENSE, with hemispheres and sulci (wrinkles)
function generateBrainPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // Brain shape: wider than tall, with central fissure and gyri
    let r = 1.0;
    // Add gyri (bumps) - high frequency noise
    r += Math.sin(phi * 8 + theta * 6) * 0.06;
    r += Math.cos(phi * 5 - theta * 4) * 0.05;
    r += Math.sin(phi * 12) * 0.03;

    // Central fissure (dip at top center)
    const centralDip = Math.exp(-Math.pow(Math.abs(Math.sin(theta)) - 0.5, 2) * 20) * 0.1;
    r -= centralDip * (phi < Math.PI * 0.6 ? 1 : 0);

    // Ellipsoid: brain is ~1.4x wider than tall, slightly deep
    const x = r * 1.5 * Math.sin(phi) * Math.cos(theta);
    const y = r * 1.0 * Math.cos(phi);
    const z = r * 1.2 * Math.sin(phi) * Math.sin(theta);

    // Concentrate more nodes in the cortex (outer surface)
    const surfaceBias = 0.85 + Math.random() * 0.15;
    points.push(new THREE.Vector3(x * surfaceBias, y * surfaceBias, z * surfaceBias));
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
    const n = generateBrainPoints(300);
    const s = generateSynapses(n, 0.45, 600);
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
            <Html center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <span style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(13,148,136,0.85)",
                padding: "2px 8px",
                borderRadius: "10px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
