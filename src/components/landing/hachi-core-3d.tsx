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
      cubeRef.current.rotation.y = clock.getElapsedTime() * 0.12;
      cubeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.15;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
      <group ref={cubeRef}>
        {/* Main glass cube */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhysicalMaterial
            color="#0d9488"
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
          />
          <Edges linewidth={1.5} threshold={15} color="#14b8a6" />
        </mesh>

        {/* Inner wireframe cube (smaller) */}
        <mesh scale={0.7}>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhysicalMaterial color="#22d3ee" transparent opacity={0.04} side={THREE.DoubleSide} />
          <Edges linewidth={1} color="#22d3ee" />
        </mesh>

        {/* Inner core cube (smallest, brighter) */}
        <mesh scale={0.35}>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhysicalMaterial
            color="#0d9488"
            emissive="#14b8a6"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
          <Edges linewidth={1} color="#5eead4" />
        </mesh>

        {/* Face panels with dashboard grids */}
        <FacePanel position={[0, 0, 1.01]} rotation={[0, 0, 0]} label="Financeiro" />
        <FacePanel position={[0, 0, -1.01]} rotation={[0, Math.PI, 0]} label="Analytics" />
        <FacePanel position={[1.01, 0, 0]} rotation={[0, Math.PI / 2, 0]} label="CRM" />
        <FacePanel position={[-1.01, 0, 0]} rotation={[0, -Math.PI / 2, 0]} label="Estoque" />
        <FacePanel position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} label="IA" />
        <FacePanel position={[0, -1.01, 0]} rotation={[Math.PI / 2, 0, 0]} label="Automação" />

        {/* Corner glow spheres */}
        <CornerSpheres />

        {/* Edge particles */}
        <EdgeParticles />
      </group>
    </Float>
  );
}

// Dashboard grid on each face
function FacePanel({ position, rotation, label }: { position: [number, number, number]; rotation: [number, number, number]; label: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Grid lines (horizontal) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = (i - 2) * 0.35;
        return (
          <mesh key={`h${i}`} position={[0, y, 0]}>
            <planeGeometry args={[1.6, 0.005]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Grid lines (vertical) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * 0.35;
        return (
          <mesh key={`v${i}`} position={[x, 0, 0]}>
            <planeGeometry args={[0.005, 1.6]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Data bars (simulating a chart) */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = (i - 1.5) * 0.3;
        const h = 0.2 + Math.random() * 0.5;
        return (
          <mesh key={`bar${i}`} position={[x, -0.5 + h / 2, 0.01]}>
            <planeGeometry args={[0.15, h]} />
            <meshBasicMaterial color="#0d9488" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {/* Module label */}
      <Html center position={[0, 0.65, 0.01]} distanceFactor={4} style={{ pointerEvents: "none" }}>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#0d9488", whiteSpace: "nowrap", textShadow: "0 0 10px rgba(13,148,136,0.5)" }}>
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
  const count = 120;
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
