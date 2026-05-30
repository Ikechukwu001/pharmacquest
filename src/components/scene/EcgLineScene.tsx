/**
 * Pharmacquest — ECG heartbeat line 3D scene
 *
 * A glowing line traces a heartbeat pattern through 3D space.
 * Two configuration presets:
 *   - "calm": gentle pulse, close camera, deep-water feel (login)
 *   - "energetic": wider pulse, farther camera, more motion (signup)
 *
 * Built entirely from procedural geometry — no asset files.
 * Lazy-loaded and gated by WebGL detection upstream.
 */

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface EcgLineSceneProps {
  variant?: "calm" | "energetic";
}

/**
 * The actual ECG line — a series of 3D points connected as a line,
 * scrolling smoothly to simulate a heartbeat traveling across the screen.
 */
function EcgLine({ variant = "calm" }: EcgLineSceneProps) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Density and amplitude differ between variants for the "calm vs energetic" feel
  const config = useMemo(() => {
    if (variant === "energetic") {
      return {
        pointCount: 240,
        baseAmplitude: 0.35,
        spikeAmplitude: 1.6,
        scrollSpeed: 0.45,
        spikeInterval: 28,
      };
    }
    return {
      pointCount: 200,
      baseAmplitude: 0.15,
      spikeAmplitude: 1.1,
      scrollSpeed: 0.28,
      spikeInterval: 34,
    };
  }, [variant]);

  // Pre-compute the geometry once. We'll mutate points each frame for the scroll.
  const { geometry, positions } = useMemo(() => {
    const positions = new Float32Array(config.pointCount * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, positions };
  }, [config.pointCount]);

  // Generate ECG-like Y values for a given index along the scrolling line
  function ecgWave(index: number, time: number): number {
    const scrolled = index + time * config.scrollSpeed * 10;
    const cyclePosition = scrolled % config.spikeInterval;

    // Most of the line is a low, gentle wave (baseline)
    const baseline = Math.sin(scrolled * 0.18) * config.baseAmplitude;

    // Every `spikeInterval` points, generate the QRS spike (the iconic heartbeat shape)
    if (cyclePosition >= 0 && cyclePosition < 6) {
      const spikeProgress = cyclePosition / 6;
      // Q dip → R peak → S dip in a compressed window
      const spike =
        spikeProgress < 0.25
          ? -spikeProgress * 4 * config.spikeAmplitude * 0.3
          : spikeProgress < 0.5
          ? (spikeProgress - 0.25) * 4 * config.spikeAmplitude
          : spikeProgress < 0.75
          ? (0.75 - spikeProgress) * 4 * config.spikeAmplitude * 0.6
          : -(spikeProgress - 0.75) * 4 * config.spikeAmplitude * 0.2;
      return baseline + spike;
    }

    return baseline;
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const xSpan = 14; // total horizontal width of the line in world units

    for (let i = 0; i < config.pointCount; i++) {
      const x = (i / config.pointCount) * xSpan - xSpan / 2;
      const y = ecgWave(i, time);
      const z = 0;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.attributes.position.needsUpdate = true;

    // Subtle pulse on the glow
    if (glowRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      glowRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group>
      {/* Soft horizontal glow behind the line */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <planeGeometry args={[14, 0.6]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* The line itself */}
      <primitive
        object={
          new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: variant === "energetic" ? "#60a5fa" : "#93c5fd",
              linewidth: 2,
              transparent: true,
              opacity: 0.95,
            })
          )
        }
        ref={lineRef}
      />
    </group>
  );
}

/**
 * Background grid: subtle horizontal lines like an oscilloscope screen.
 */
function BackgroundGrid() {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = -5; i <= 5; i++) {
      arr.push(i);
    }
    return arr;
  }, []);

  return (
    <group>
      {lines.map((y) => (
        <mesh key={`h-${y}`} position={[0, y, -1]}>
          <planeGeometry args={[20, 0.005]} />
          <meshBasicMaterial color="#1e3a8a" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Drifting particles in the background for depth.
 */
function AmbientParticles({ count = 40 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummies = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        baseX: (Math.random() - 0.5) * 16,
        baseY: (Math.random() - 0.5) * 8,
        z: -Math.random() * 4 - 1,
        speed: 0.05 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        scale: 0.02 + Math.random() * 0.04,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const matrix = new THREE.Matrix4();
    dummies.forEach((d, i) => {
      const y = d.baseY + Math.sin(time * d.speed + d.phase) * 0.3;
      matrix.makeScale(d.scale, d.scale, d.scale);
      matrix.setPosition(d.baseX, y, d.z);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} />
    </instancedMesh>
  );
}

/**
 * The full scene.
 */
export function EcgLineScene({ variant = "calm" }: EcgLineSceneProps) {
  const cameraZ = variant === "energetic" ? 7 : 5.5;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Minimal lighting — line materials are mostly self-lit */}
        <ambientLight intensity={0.5} />

        <BackgroundGrid />
        <AmbientParticles count={variant === "energetic" ? 50 : 30} />
        <EcgLine variant={variant} />
      </Canvas>
    </div>
  );
}