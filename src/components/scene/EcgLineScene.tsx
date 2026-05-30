/**
 * Pharmacquest — ECG heartbeat line 3D scene
 *
 * A glowing line traces a heartbeat pattern through 3D space.
 * Two configuration presets:
 *   - "calm": gentle pulse, close camera, deep-water feel (login)
 *   - "energetic": wider pulse, farther camera, more motion (signup)
 *
 * Wave shape uses a proper PQRST approximation, not crude spikes.
 * Scroll speed is intentionally slow — meditative, not frantic.
 */

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface EcgLineSceneProps {
  variant?: "calm" | "energetic";
}

/**
 * Produces an authentic-looking ECG waveform Y value for a given X.
 * The cycle (one heartbeat) is `cycleLength` units wide.
 *   P wave: gentle bump (atrial depolarization)
 *   PR segment: flat
 *   QRS complex: small Q dip, big R peak, small S dip (ventricular contraction)
 *   ST segment: flat
 *   T wave: rounded bump (ventricular repolarization)
 *   Then long flat baseline before next cycle.
 */
function pqrstWave(x: number, cycleLength: number, amplitude: number): number {
  // Find position within current heartbeat cycle (0 to cycleLength)
  const t = ((x % cycleLength) + cycleLength) % cycleLength;

  // P wave: small bump from t=0.05 to t=0.15
  if (t > 0.05 && t < 0.15) {
    const p = (t - 0.05) / 0.10;
    return Math.sin(p * Math.PI) * amplitude * 0.18;
  }

  // PR segment: flat baseline t=0.15 to t=0.25 (return 0)

  // QRS complex: t=0.25 to t=0.35
  //   Q dip at t=0.25-0.27
  //   R peak at t=0.27-0.30
  //   S dip at t=0.30-0.34
  if (t >= 0.25 && t < 0.27) {
    const q = (t - 0.25) / 0.02;
    return -q * amplitude * 0.25;
  }
  if (t >= 0.27 && t < 0.30) {
    const r = (t - 0.27) / 0.03;
    // R wave: sharp upward spike — interpolate from -0.25 to peak then back
    return -amplitude * 0.25 + r * amplitude * 1.25;
  }
  if (t >= 0.30 && t < 0.34) {
    const s = (t - 0.30) / 0.04;
    return amplitude - s * amplitude * 1.4;
  }

  // ST segment: brief flat t=0.34 to t=0.42

  // T wave: rounded bump t=0.42 to t=0.58
  if (t >= 0.42 && t < 0.58) {
    const p = (t - 0.42) / 0.16;
    return Math.sin(p * Math.PI) * amplitude * 0.30;
  }

  // Long quiet baseline t=0.58 to cycleLength
  return 0;
}

function EcgLine({ variant = "calm" }: EcgLineSceneProps) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const config = useMemo(() => {
    if (variant === "energetic") {
      return {
        pointCount: 400,
        amplitude: 0.9,
        cycleLength: 1.4,
        scrollSpeed: 0.45,
        xSpan: 14,
      };
    }
    return {
      pointCount: 400,
      amplitude: 0.7,
      cycleLength: 1.8,
      scrollSpeed: 0.28,
      xSpan: 12,
    };
  }, [variant]);

  const { geometry, positions } = useMemo(() => {
    const positions = new Float32Array(config.pointCount * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, positions };
  }, [config.pointCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = time * config.scrollSpeed;

    for (let i = 0; i < config.pointCount; i++) {
      const xPos = (i / config.pointCount) * config.xSpan - config.xSpan / 2;
      // Add scroll offset to make wave move horizontally over time
      const waveX = xPos + scrollOffset;
      const y = pqrstWave(waveX, config.cycleLength, config.amplitude);
      positions[i * 3] = xPos;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }

    geometry.attributes.position.needsUpdate = true;

    // Gentle breathing on the glow
    if (glowRef.current) {
      const breathe = 1 + Math.sin(time * 1.2) * 0.04;
      glowRef.current.scale.set(breathe, breathe, 1);
    }
  });

  return (
    <group>
      {/* Soft horizontal glow behind the line */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <planeGeometry args={[config.xSpan, 1.2]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.15} />
      </mesh>

      <primitive
        object={
          new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: variant === "energetic" ? "#60a5fa" : "#93c5fd",
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
    for (let i = -3; i <= 3; i++) {
      arr.push(i);
    }
    return arr;
  }, []);

  return (
    <group>
      {lines.map((y) => (
        <mesh key={`h-${y}`} position={[0, y, -1]}>
          <planeGeometry args={[20, 0.005]} />
          <meshBasicMaterial color="#1e3a8a" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function AmbientParticles({ count = 30 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummies = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        baseX: (Math.random() - 0.5) * 14,
        baseY: (Math.random() - 0.5) * 5,
        z: -Math.random() * 4 - 1,
        speed: 0.04 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        scale: 0.025 + Math.random() * 0.04,
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

export function EcgLineScene({ variant = "calm" }: EcgLineSceneProps) {
  const cameraZ = variant === "energetic" ? 6 : 5;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <BackgroundGrid />
        <AmbientParticles count={variant === "energetic" ? 35 : 25} />
        <EcgLine variant={variant} />
      </Canvas>
    </div>
  );
}