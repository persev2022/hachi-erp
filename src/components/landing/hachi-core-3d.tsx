"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Edges, Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════
// HOLOGRAPHIC CUBE — Clean, modern, tech. Style: Linear/Vercel
// Glass cube with floating data grids on faces
// Edge particles representing data flow
// ═══════════════════════════════════════════════════════════

function HoloCube() {
  const cubeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      cubeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.06) * 0.12;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.03} floatIntensity={0.2}>
      <group ref={cubeRef}>
        {/* Outer cube - glass with thick glowing edges */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <meshPhysicalMaterial color="#0d9488" roughness={0.05} metalness={0.1} transparent opacity={0.05} side={THREE.DoubleSide} />
          <Edges linewidth={2} color="#14b8a6" />
        </mesh>

        {/* Second cube - rotated 45deg for complexity */}
        <mesh rotation={[0, Math.PI / 4, 0]} scale={0.85}>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <meshPhysicalMaterial color="#22d3ee" transparent opacity={0.03} side={THREE.DoubleSide} />
          <Edges linewidth={1} color="#22d3ee" />
        </mesh>

        {/* Third cube - smaller, tilted */}
        <mesh rotation={[Math.PI / 6, 0, Math.PI / 6]} scale={0.6}>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <meshPhysicalMaterial color="#5eead4" transparent opacity={0.04} side={THREE.DoubleSide} />
          <Edges linewidth={1} color="#5eead4" />
        </mesh>

        {/* Inner core - solid glowing icosahedron */}
        <mesh scale={0.25}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color="#0d9488" emissive="#14b8a6" emissiveIntensity={2} roughness={0.1} metalness={0.9} clearcoat={1} />
          <Edges linewidth={0.5} color="#99f6e4" />
        </mesh>

        {/* Scanning plane (horizontal sweep) */}
        <ScanPlane />

        {/* Dense face panels */}
        <FacePanel position={[0, 0, 1.11]} rotation={[0, 0, 0]} label="Financeiro" />
        <FacePanel position={[0, 0, -1.11]} rotation={[0, Math.PI, 0]} label="Analytics" />
        <FacePanel position={[1.11, 0, 0]} rotation={[0, Math.PI / 2, 0]} label="CRM" />
        <FacePanel position={[-1.11, 0, 0]} rotation={[0, -Math.PI / 2, 0]} label="Estoque" />
        <FacePanel position={[0, 1.11, 0]} rotation={[-Math.PI / 2, 0, 0]} label="IA" />
        <FacePanel position={[0, -1.11, 0]} rotation={[Math.PI / 2, 0, 0]} label="Automação" />

        {/* Corner glow spheres */}
        <CornerSpheres />

        {/* Edge particles - more dense */}
        <EdgeParticles />

        {/* Orbiting rings */}
        <OrbitRing radius={1.6} speed={0.2} color="#14b8a6" />
        <OrbitRing radius={1.8} speed={-0.15} color="#22d3ee" />
      </group>
    </Float>
  );
}

// Horizontal scanning plane that sweeps up and down
function ScanPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 1.0;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshBasicMaterial color="#5eead4" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Orbiting thin ring
function OrbitRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed;
      ref.current.rotation.z = clock.getElapsedTime() * speed * 0.7;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 8, 80]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={1.5} roughness={0.1} metalness={0.9} />
    </mesh>
  );
}

// Dashboard grid on each face
function FacePanel({ position, rotation, label }: { position: [number, number, number]; rotation: [number, number, number]; label: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dense grid (8x8) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = (i - 3.5) * 0.22;
        return (
          <mesh key={`h${i}`} position={[0, y, 0]}>
            <planeGeometry args={[1.8, 0.003]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (i - 3.5) * 0.22;
        return (
          <mesh key={`v${i}`} position={[x, 0, 0]}>
            <planeGeometry args={[0.003, 1.8]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Multiple data bars */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = (i - 2.5) * 0.22;
        const h = 0.15 + Math.random() * 0.6;
        return (
          <mesh key={`bar${i}`} position={[x, -0.55 + h / 2, 0.005]}>
            <planeGeometry args={[0.12, h]} />
            <meshBasicMaterial color="#0d9488" transparent opacity={0.4 + Math.random() * 0.2} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Simulated line chart */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * 0.3;
        const y = 0.3 + Math.sin(i * 1.2) * 0.2;
        return (
          <mesh key={`dot${i}`} position={[x, y, 0.005]}>
            <circleGeometry args={[0.025, 12]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Module label */}
      <Html center position={[0, 0.75, 0.01]} distanceFactor={4} style={{ pointerEvents: "none" }}>
        <span style={{ fontSize: "8px", fontWeight: 700, color: "#0d9488", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(13,148,136,0.4)" }}>
          {label}
        </span>
      </Html>
    </group>
  );
}

// Glowing spheres at corners
function CornerSpheres() {
  const corners = useMemo(() => {
    const c: [number, number, number][] = [];
    for (let x = -1; x <= 1; x += 2)
      for (let y = -1; y <= 1; y += 2)
        for (let z = -1; z <= 1; z += 2)
          c.push([x, y, z]);
    return c;
  }, []);

  return (
    <>
      {corners.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshPhysicalMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={3}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      ))}
    </>
  );
}

// Particles flowing along edges
function EdgeParticles() {
  const count = 200;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random position along cube edges
      const edge = Math.floor(Math.random() * 12);
      const t = Math.random();
      let x = 0, y = 0, z = 0;

      // 12 edges of a cube
      switch (edge) {
        case 0: x = -1 + t * 2; y = 1; z = 1; break;
        case 1: x = -1 + t * 2; y = 1; z = -1; break;
        case 2: x = -1 + t * 2; y = -1; z = 1; break;
        case 3: x = -1 + t * 2; y = -1; z = -1; break;
        case 4: y = -1 + t * 2; x = 1; z = 1; break;
        case 5: y = -1 + t * 2; x = 1; z = -1; break;
        case 6: y = -1 + t * 2; x = -1; z = 1; break;
        case 7: y = -1 + t * 2; x = -1; z = -1; break;
        case 8: z = -1 + t * 2; x = 1; y = 1; break;
        case 9: z = -1 + t * 2; x = 1; y = -1; break;
        case 10: z = -1 + t * 2; x = -1; y = 1; break;
        case 11: z = -1 + t * 2; x = -1; y = -1; break;
      }

      // Add slight offset for volume
      x += (Math.random() - 0.5) * 0.1;
      y += (Math.random() - 0.5) * 0.1;
      z += (Math.random() - 0.5) * 0.1;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Gentle breathing effect
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.03} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// Orbiting module labels in 3D space
function OrbitingModules() {
  const ref = useRef<THREE.Group>(null);
  const modules = ["Financeiro", "CRM", "Estoque", "Comercial", "Analytics", "Automação", "RH", "Tributário", "Produção", "Compras", "Gestão", "IA"];

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -clock.getElapsedTime() * 0.15;
  });

  return (
    <group ref={ref}>
      {modules.map((name, i) => {
        const angle = (i / modules.length) * Math.PI * 2;
        const r = 2.2;
        const y = ((i / modules.length) - 0.5) * 2.5;
        return (
          <group key={name} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}>
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#0d9488" emissive="#5eead4" emissiveIntensity={3} />
            </mesh>
            <Html center distanceFactor={7} style={{ pointerEvents: "none" }} zIndexRange={[100, 0]}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "rgba(13,148,136,0.92)", padding: "2px 7px", borderRadius: "5px", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(13,148,136,0.4)" }}>
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
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += (pointer.x * 0.1 - ref.current.rotation.y) * 0.003;
      ref.current.rotation.x += (-pointer.y * 0.05 - ref.current.rotation.x) * 0.003;
    }
  });

  return (
    <group ref={ref} scale={1.3}>
      <HoloCube />
      <OrbitingModules />
    </group>
  );
}

export default function HachiCore3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
        }}
      >
        <ambientLight intensity={0.2} color="#f0fdfa" />
        <directionalLight position={[5, 6, 5]} intensity={1.5} castShadow color="#ffffff" />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#14b8a6" />
        <pointLight position={[0, -3, 4]} intensity={0.5} color="#22d3ee" />
        <spotLight position={[0, 8, 3]} angle={0.4} penumbra={1} intensity={1.2} castShadow color="#ffffff" />
        <Scene />
      </Canvas>
    </div>
  );
}
