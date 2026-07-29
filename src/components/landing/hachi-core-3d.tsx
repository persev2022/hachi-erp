"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// HACHI CORE — Central AI nucleus with orbiting modules
// Performance: < 3s load, 60fps on mid-range devices
// ═══════════════════════════════════════════════════════════

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#4338ca"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.15}
          speed={2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function OrbitingModules() {
  const groupRef = useRef<THREE.Group>(null);
  const modules = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 3.5 + Math.random() * 0.5,
      speed: 0.2 + Math.random() * 0.1,
      size: 0.12 + Math.random() * 0.08,
      yOffset: (Math.random() - 0.5) * 1.5,
      color: ["#22d3ee", "#6366f1", "#a855f7", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#e879f9"][i],
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {modules.map((mod, i) => (
        <OrbitNode key={i} {...mod} index={i} />
      ))}
    </group>
  );
}

function OrbitNode({ angle, radius, speed, size, yOffset, color, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed + angle;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = yOffset + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
}

function ConnectionBeams() {
  return null; // Connection beams rendered via particles for performance
}

function Particles() {
  const count = 200;
  const particlesRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#6366f1" size={0.02} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function MouseReactive() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.3 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x += (-pointer.y * 0.2 - groupRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <CoreSphere />
      <OrbitingModules />
      <ConnectionBeams />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 5]} intensity={0.8} color="#6366f1" />
      <pointLight position={[-10, -5, 5]} intensity={0.4} color="#22d3ee" />
      <pointLight position={[0, -10, 0]} intensity={0.3} color="#a855f7" />

      <MouseReactive />
      <Particles />
    </Canvas>
  );
}
