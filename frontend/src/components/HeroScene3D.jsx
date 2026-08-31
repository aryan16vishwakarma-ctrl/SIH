import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';

function ProduceCrate() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Crate Base Box */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.2, 0.1, 1.6]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.6} />
      </mesh>
      
      {/* Crate Side Slats */}
      <mesh position={[0, 0.3, 0.75]}>
        <boxGeometry args={[2.2, 0.8, 0.08]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, -0.75]}>
        <boxGeometry args={[2.2, 0.8, 0.08]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      <mesh position={[1.05, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.8, 1.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>
      <mesh position={[-1.05, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.8, 1.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>

      {/* Red Tomatoes */}
      <mesh position={[-0.5, 0.4, 0.2]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-0.1, 0.45, -0.2]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Golden Wheat Grains (Cones) */}
      <mesh position={[0.5, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.2, 1.0, 8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      <mesh position={[0.6, 0.5, 0.3]} rotation={[0.2, 0, -0.4]}>
        <coneGeometry args={[0.18, 0.9, 8]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.4} />
      </mesh>

      {/* Fresh Green Produce Sphere */}
      <mesh position={[0.2, 0.4, 0.3]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <div className="w-full h-full min-h-[380px] relative">
      <Canvas
        camera={{ position: [0, 2, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-5, 2, -3]} intensity={0.5} color="#10b981" />
        <pointLight position={[5, -2, 3]} intensity={0.5} color="#f59e0b" />

        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
          <ProduceCrate />
        </Float>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
        />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}
