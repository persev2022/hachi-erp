"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  Environment,
  ContactShadows,
  MeshDistortMaterial,
} from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// HACHI CORE 3D — Advanced scene with glass, refraction,
// realistic lighting, shadows and depth.
// White/light background with teal (#0d9488) brand color.
// ═══════════════════════════════════════════════════════════

/**
 * Central glass torus knot — represents the AI core.
 * Uses transmission material for realistic glass refraction.
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
        <torusKnotGeometry args={[1, 0.35, 200, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.5}
          chromaticAberration={0.3}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#0d9488"
          roughness={0.05}
          ior={1.5}
          transmission={0.95}
        />
      </mesh>
    </Float>
  );
}

/**
 * Floating metallic spheres orbiting the core.
 * Each has unique material: brushed metal, mirror, matte.
 */
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

/**
 * Floating glass rings — adds depth and layered composition.
 */
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
        <meshPhysicalMaterial
          color="#0d9488"
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          envMapIntensity={3}
        />
      </mesh>
      <mesh ref={ring2Ref} castShadow>
        <torusGeometry args={[2.6, 0.03, 16, 100]} />
        <meshPhysicalMaterial
          color="#5eead4"
          roughness={0.0}
          metalness={1}
          clearcoat={1}
          envMapIntensity={3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

/**
 * Subtle floating particles for ambient depth.
 */
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
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
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

/**
 * Mouse-reactive group — smooth parallax following cursor.
 */
function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Smooth lerp to follow mouse
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

/**
 * Main export — Canvas with advanced lighting, environment map,
 * shadows, and white/light background.
 */
export default function HachiCore3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: "transparent" }}
    >
      {/* Environment for realistic reflections */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* Lighting setup for depth and drama */}
      <ambientLight intensity={0.4} />

      {/* Key light — warm directional */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        color="#ffffff"
      />

      {/* Fill light — cool teal from the left */}
      <directionalLight
        position={[-5, 3, -3]}
        intensity={0.6}
        color="#0d9488"
      />

      {/* Rim light — subtle backlight */}
      <pointLight position={[0, -5, -5]} intensity={0.4} color="#5eead4" />

      {/* Spot for dramatic highlight */}
      <spotLight
        position={[3, 5, 3]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        castShadow
        color="#ffffff"
      />

      {/* Scene */}
      <Scene />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
        far={4}
        color="#0d9488"
      />
    </Canvas>
  );
}
