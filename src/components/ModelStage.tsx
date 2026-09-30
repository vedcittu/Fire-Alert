"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

type ModelStageProps = {
  /** Public path to the exported model, e.g. "/models/hero.glb". */
  src?: string;
  /** Optional static render used as a fallback when WebGL is unavailable. */
  poster?: string;
  className?: string;
};

/**
 * Renders a glTF model in a lit, transparent canvas.
 *
 * The model is loaded lazily: the poster (if present) shows through until the
 * scene is ready, and stays visible if the canvas fails for any reason — no
 * WebGL support, a missing file, or a decode error.
 */
export function ModelStage({ src = "/models/hero.glb", poster, className = "" }: ModelStageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative ${className}`.trim()}>
      {poster ? (
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-contain bg-bottom bg-no-repeat transition-opacity duration-700 ${
            failed ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${poster})` }}
        />
      ) : null}

      {failed ? null : (
        <ModelErrorBoundary onError={() => setFailed(true)}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 1.05, 3.4], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: "100%", height: "100%" }}
          >
            <ambientLight intensity={0.65} />
            <directionalLight position={[3, 5, 3]} intensity={1.7} castShadow />
            <directionalLight position={[-4, 2, -3]} intensity={0.45} />

            <Suspense fallback={null}>
              <Model src={src} />
            </Suspense>

            <ContactShadows position={[0, -0.9, 0]} opacity={0.32} scale={6} blur={2.6} far={4} />
          </Canvas>
        </ModelErrorBoundary>
      )}
    </div>
  );
}

function Model({ src }: { src: string }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(src);
  const { actions, names } = useAnimations(animations, group);
  const spin = useRef(0);

  // If the export carries an animation clip, play it on loop. Otherwise the
  // model gets a slow turntable rotation instead.
  useEffect(() => {
    const first = names[0];
    if (!first) return;
    const action = actions[first];
    if (!action) return;

    action.reset().fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.3);
    };
  }, [actions, names]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    if (names.length === 0) spin.current += delta * 0.35;

    // Lean gently toward the pointer so the model feels alive.
    node.rotation.y = spin.current + state.pointer.x * 0.25;
    node.rotation.x = -state.pointer.y * 0.1;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

class ModelErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
