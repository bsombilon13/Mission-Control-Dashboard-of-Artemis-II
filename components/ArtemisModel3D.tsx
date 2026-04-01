
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Stars, Sparkles, Trail } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  elapsedSeconds: number;
  pitchAngle: number;
  isBoosterSeparated: boolean;
  isLASJettisoned: boolean;
  isCoreSeparated: boolean;
  isOrionSeparated: boolean;
  isSolarArrayDeployed: boolean;
  isAscent: boolean;
  isICPSActive: boolean;
  isReturn: boolean;
  shakeX: number;
  shakeY: number;
}

const SLSModel: React.FC<ModelProps> = ({
  elapsedSeconds,
  pitchAngle,
  isBoosterSeparated,
  isLASJettisoned,
  isCoreSeparated,
  isOrionSeparated,
  isSolarArrayDeployed,
  isAscent,
  isICPSActive,
  isReturn,
  shakeX,
  shakeY,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const icpsRef = useRef<THREE.Group>(null);
  const orionRef = useRef<THREE.Group>(null);
  const srbLRef = useRef<THREE.Group>(null);
  const srbRRef = useRef<THREE.Group>(null);
  const lasRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Apply pitch
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(pitchAngle);

    // Apply shake (scaled down for 3D space)
    groupRef.current.position.x = shakeX * 0.01;
    groupRef.current.position.y = shakeY * 0.01;

    // Separation animations
    if (isBoosterSeparated && srbLRef.current && srbRRef.current) {
      const t = Math.min(1, (elapsedSeconds - 128) / 10);
      srbLRef.current.position.x = -2.5 - t * 20;
      srbLRef.current.position.y = -t * 30;
      srbLRef.current.rotation.z = t * Math.PI;
      srbLRef.current.scale.setScalar(1 - t);

      srbRRef.current.position.x = 2.5 - t * -20;
      srbRRef.current.position.y = -t * 30;
      srbRRef.current.rotation.z = -t * Math.PI;
      srbRRef.current.scale.setScalar(1 - t);
    }

    if (isLASJettisoned && lasRef.current) {
      const t = Math.min(1, (elapsedSeconds - 198) / 5);
      lasRef.current.position.y = 8 + t * 50;
      lasRef.current.scale.setScalar(1 - t);
    }

    if (isCoreSeparated && coreRef.current) {
      const t = Math.min(1, (elapsedSeconds - 498) / 15);
      coreRef.current.position.y = -t * 50;
      coreRef.current.rotation.x = -t * Math.PI * 0.5;
      coreRef.current.scale.setScalar(1 - t);
    }

    if (isOrionSeparated && icpsRef.current) {
      const t = Math.min(1, (elapsedSeconds - 12255) / 20);
      icpsRef.current.position.y = -t * 30;
      icpsRef.current.rotation.x = t * Math.PI * 0.25;
      icpsRef.current.scale.setScalar(1 - t);
    }
  });

  return (
    <group ref={groupRef}>
      {/* ORION ASSEMBLY */}
      <group ref={orionRef} position={[0, 6, 0]}>
        {/* Orion Capsule */}
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[1, 1.2, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.2} />
        </mesh>
        
        {/* Service Module */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[1, 1, 0.8, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* LAS */}
        {!isLASJettisoned && (
          <group ref={lasRef} position={[0, 1.5, 0]}>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[0.8, 0.6, 32]} />
              <meshStandardMaterial color="#f1f5f9" />
            </mesh>
          </group>
        )}

        {/* Solar Arrays */}
        {isSolarArrayDeployed && (
          <group>
            {[0, 90, 180, 270].map((angle) => (
              <mesh key={angle} position={[0, -0.4, 0]} rotation={[0, THREE.MathUtils.degToRad(angle), 0]}>
                <boxGeometry args={[4, 0.05, 0.8]} />
                <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.5} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* ICPS */}
      <group ref={icpsRef} position={[0, 4, 0]}>
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 3, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.5} />
        </mesh>
        {isICPSActive && !isOrionSeparated && (
          <Sparkles count={50} scale={2} size={2} speed={0.5} color="#60a5fa" position={[0, -2, 0]} />
        )}
      </group>

      {/* CORE STAGE */}
      <group ref={coreRef} position={[0, -2, 0]}>
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 10, 32]} />
          <meshStandardMaterial color="#ea580c" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* SRBs */}
        {!isBoosterSeparated && (
          <>
            <group ref={srbLRef} position={[-2.5, -1, 0]}>
              <mesh>
                <cylinderGeometry args={[0.8, 0.8, 8, 32]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 4.5, 0]}>
                <coneGeometry args={[0.8, 1, 32]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              {isAscent && (
                <Sparkles count={100} scale={3} size={4} speed={2} color="#fb923c" position={[0, -5, 0]} />
              )}
            </group>
            <group ref={srbRRef} position={[2.5, -1, 0]}>
              <mesh>
                <cylinderGeometry args={[0.8, 0.8, 8, 32]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 4.5, 0]}>
                <coneGeometry args={[0.8, 1, 32]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              {isAscent && (
                <Sparkles count={100} scale={3} size={4} speed={2} color="#fb923c" position={[0, -5, 0]} />
              )}
            </group>
          </>
        )}

        {/* Core Engines Glow */}
        {isAscent && !isCoreSeparated && (
          <group position={[0, -5.5, 0]}>
            <Trail
              width={5}
              length={10}
              color={new THREE.Color("#f97316")}
              attenuation={(t) => t * t}
            >
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
            </Trail>
            <Sparkles count={150} scale={4} size={6} speed={3} color="#f97316" />
            <pointLight intensity={2} distance={10} color="#f97316" />
          </group>
        )}
      </group>
    </group>
  );
};

const ArtemisModel3D: React.FC<ModelProps> = (props) => {
  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={35} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#3b82f6" />
        
        {/* Engine Thrust Light */}
        {(props.isAscent || props.isICPSActive) && (
          <pointLight 
            position={[0, -5, 0]} 
            intensity={props.isAscent ? 5 : 2} 
            color={props.isAscent ? "#f97316" : "#60a5fa"} 
            distance={15}
            decay={2}
          />
        )}

        {/* Orion Capsule Internal Glow */}
        {!props.isOrionSeparated && (
          <pointLight 
            position={[0, 4.2, 0]} 
            intensity={0.8} 
            color="#4ade80" 
            distance={2}
            decay={2}
          />
        )}

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <SLSModel {...props} />
        </Float>

        {/* Space Environment */}
        {props.elapsedSeconds > 100 && (
          <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={100} scale={50} size={1} speed={0.2} opacity={0.2} />
          </>
        )}

        {/* Atmospheric Glow for Re-entry */}
        {props.isReturn && (
          <Sparkles count={200} scale={10} size={10} speed={5} color="#ef4444" />
        )}
      </Canvas>
    </div>
  );
};

export default ArtemisModel3D;
