/**
 * Pharmacquest — Pill bottle 3D scene
 *
 * The dashboard hero 3D moment. A stylized pill bottle with capsules
 * orbiting around it. Pure primitives — no asset files needed.
 *
 * Marked "use client" because R3F needs browser APIs (WebGL).
 */

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

/**
 * The pill bottle: a short cylinder body with a darker cap on top.
 * Sits at the center of the scene.
 */
function PillBottle() {
  const bottleRef = useRef<Group>(null);

  // Gently rotate the bottle on its Y axis (vertical spin).
  useFrame((_, delta) => {
    if (bottleRef.current) {
      bottleRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={bottleRef}>
      {/* Bottle body — Pharmacquest amber/cream */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.4, 32]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Bottle cap — darker amber, slightly wider, on top */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.3, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Small label band on the bottle */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.61, 0.61, 0.5, 32]} />
        <meshStandardMaterial color="#2563eb" roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * A single capsule that orbits around the bottle.
 * `radius` controls how far from center, `speed` how fast, `phase` the start angle.
 */
function OrbitingCapsule({
  radius,
  speed,
  phase,
  height,
  color,
}: {
  radius: number;
  speed: number;
  phase: number;
  height: number;
  color: string;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed + phase;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = height + Math.sin(t * 2) * 0.1;
      // Capsule tilts as it orbits — small detail that makes it feel alive.
      meshRef.current.rotation.z = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <capsuleGeometry args={[0.12, 0.25, 4, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

/**
 * The full scene: bottle + orbiting capsules + lighting.
 */
export function PillBottleScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting setup — ambient for fill, directional for shadows + highlights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 5, 2]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, 2, -3]} intensity={0.3} color="#dbeafe" />

        {/* The bottle */}
        <PillBottle />

        {/* Four orbiting capsules at different radii, speeds, phases, heights */}
        <OrbitingCapsule
          radius={1.4}
          speed={0.6}
          phase={0}
          height={0.3}
          color="#dbeafe"
        />
        <OrbitingCapsule
          radius={1.6}
          speed={0.8}
          phase={Math.PI / 2}
          height={-0.2}
          color="#fde68a"
        />
        <OrbitingCapsule
          radius={1.3}
          speed={0.5}
          phase={Math.PI}
          height={0.5}
          color="#dbeafe"
        />
        <OrbitingCapsule
          radius={1.5}
          speed={0.7}
          phase={(3 * Math.PI) / 2}
          height={-0.1}
          color="#fde68a"
        />

        {/* Ground shadow plane — invisible but receives shadows for depth */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.2, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
      </Canvas>
    </div>
  );
}