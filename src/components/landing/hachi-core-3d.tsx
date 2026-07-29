"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// BRAIN GRAPH — Neural network shape made of nodes + synapses
// Orbiting module labels around it
// ═══════════════════════════════════════════════════════════

// Generate brain-shaped point cloud (ellipsoid with wrinkles)
function generateBrainPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // Spherical distribution with brain-like deformation
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.2 + Math.sin(phi * 5) * 0.15 + Math.sin(theta * 3) * 0.1;

    // Ellipsoid shape (wider than tall, like a brain)
    const x = r * 1.3 * Math.sin(phi) * Math.cos(theta);
    const y = r * 0.9 * Math.cos(phi);
    const z = r * 1.1 * Math.sin(phi) * Math.sin(theta);

    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

// Find connections between nearby nodes (synapses)
function generateSynapses(nodes: THREE.Vector3[], maxDist: number): [number, number][] {
  const connections: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].distanceTo(nodes[j]);
      if (dist < maxDist && connections.length < 200) {
        connections.push([i, j]);
      }
    }
  }
  return connections;
}

/**
 * Brain made of glowing nodes connected by synapse lines.
 */
function BrainGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesCount = 60;

  const { nodes, synapses } = useMemo(() => {
    const n = generateBrainPoints(nodesCount);
    const s = generateSynapses(n, 0.7);
    return { nodes: n, synapses: s };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Synapse connections (lines between nodes) */}
      {synapses.map(([a, b], i) => (
        <SynapseLine key={i} start={nodes[a]} end={nodes[b]} />
      ))}

      {/* Neural nodes (glowing spheres) */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.04 + Math.random() * 0.02, 10, 10]} />
          <meshPhysicalMaterial
            color="#0d9488"
            emissive="#14b8a6"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function SynapseLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const ref = useRef<THREE.Line>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [start, end]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#5eead4", transparent: true, opacity: 0.35 }))} />
  );
}

/**
 * Module labels orbiting around the brain.
 */
const MODULES = [
  "Financeiro", "CRM", "Estoque", "Comercial",
  "Analytics", "Automação", "RH", "Tributário",
  "Produção", "Compras", "Gestão", "IA",
];

function OrbitingModules() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {MODULES.map((name, i) => {
        const angle = (i / MODULES.length) * Math.PI * 2;
        const radius = 2.5 + (i % 2) * 0.4;
        const y = (Math.sin(angle * 2) * 0.6);

        return (
          <group key={name} position={[
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius,
          ]}>
            {/* Glowing sphere */}
            <mesh castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshPhysicalMaterial
                color="#0d9488"
                emissive="#5eead4"
                emissiveIntensity={1.5}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            {/* HTML label */}
            <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
              <span className="text-[10px] font-semibold text-white bg-teal-700/80 px-2 py-0.5 rounded-full whitespace-nowrap backdrop-blur-sm">
                {name}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Ambient particles for depth.
 */
function Particles() {
  const count = 50;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01;
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

/**
 * Mouse-reactive scene wrapper.
 */
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
    <group ref={groupRef} scale={1.3}>
      <BrainGraph />
      <OrbitingModules />
      <Particles />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} color="#f0fdfa" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#14b8a6" />
        <pointLight position={[0, -3, 3]} intensity={0.5} color="#5eead4" />
        <pointLight position={[3, 3, -3]} intensity={0.4} color="#99f6e4" />
        <spotLight position={[0, 6, 4]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" />

        <Scene />
      </Canvas>
    </div>
  );
}
