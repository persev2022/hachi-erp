"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * Central torus knot with advanced physical material (glass-like).
 */
function GlassCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} castShadow>
        <torusKnotGeometry args={[1, 0.35, 128, 32]} />
        <meshPhysicalMaterial
          color="#0d9488"
          roughness={0.05}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1}
          transparent
          opacity={0.85}
          sheen={1}
          sheenColor="#5eead4"
        />
      </mesh>
    </Float>
  );
}

function OrbitingSpheres() {
  const groupRef = useRef<THREE.Group>(null);
  const spheres = useMemo(() => [
    { radius: 2.8, size: 0.2, speed: 0.3, phase: 0, y: 0.5, color: "#0d9488", roughness: 0.1, metalness: 1 },
    { radius: 3.2, size: 0.15, speed: 0.25, phase: 1.2, y: -0.3, color: "#14b8a6", roughness: 0.3, metalness: 0.9 },
    { radius: 2.5, size: 0.25, speed: 0.35, phase: 2.4, y: 0.8, color: "#99f6e4", roughness: 0.0, metalness: 1 },
    { radius: 3.5, size: 0.12, speed: 0.2, phase: 3.6, y: -0.6, color: "#5eead4", roughness: 0.2, metalness: 0.8 },
    { radius: 2.2, size: 0.18, speed: 0.4, phase: 4.8, y: 0.2, color: "#2dd4bf", roughness: 0.05, metalness: 1 },
    { radius: 3.8, size: 0.1, speed: 0.15, phase: 5.5, y: -0.9, color: "#0f766e", roughness: 0.4, metalness: 0.7 },
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {spheres.map((s, i) => (
        <OrbitSphere key={i} {...s} />
      ))}
    </group>
  );
}

function OrbitSphere({ radius, size, speed, phase, y, color, roughness, metalness }: {
  radius: number; size: number; speed: number; phase: number; y: number;
  color: string; roughness: number; metalness: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed + phase;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = y + Math.sin(t * 1.5) * 0.4;
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function GlassRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.08;
      ring1Ref.current.rotation.z = t * 0.05;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.06;
      ring2Ref.current.rotation.x = Math.PI / 3 + t * 0.04;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} castShadow>
        <torusGeometry args={[2.2, 0.04, 16, 100]} />
        <meshPhysicalMaterial color="#0d9488" roughness={0.1} metalness={0.9} clearcoat={1} envMapIntensity={3} />
      </mesh>
      <mesh ref={ring2Ref} castShadow>
        <torusGeometry args={[2.6, 0.03, 16, 100]} />
        <meshPhysicalMaterial color="#5eead4" roughness={0.0} metalness={1} clearcoat={1} envMapIntensity={3} transparent opacity={0.7} />
      </mesh>
    </>
  );
}

function AmbientParticles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
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
      <pointsMaterial color="#0d9488" size={0.03} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.4 - groupRef.current.rotation.y) * 0.015;
      groupRef.current.rotation.x += (-pointer.y * 0.2 - groupRef.current.rotation.x) * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <GlassCore />
      <GlassRings />
      <OrbitingSpheres />
      <AmbientParticles />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <ErrorBoundary3D>
      <HachiCanvas />
    </ErrorBoundary3D>
  );
}

function ErrorBoundary3D({ children }: { children: React.ReactNode }) {
  // Simple error boundary using React state
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50" />;
  }

  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
}

function HachiCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.5]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
    >
      {/* Rich lighting instead of environment map for reliability */}

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow color="#ffffff" />
      <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#0d9488" />
      <pointLight position={[0, -5, -5]} intensity={0.4} color="#5eead4" />
      <spotLight position={[3, 5, 3]} angle={0.4} penumbra={1} intensity={0.8} castShadow color="#ffffff" />

      <Scene />

      <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={10} blur={2} far={4} color="#0d9488" />
    </Canvas>
  );
}
