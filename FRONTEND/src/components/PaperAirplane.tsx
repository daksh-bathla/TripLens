import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PaperAirplane({ step }: { step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create a paper airplane shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 2);
  shape.lineTo(1, -1);
  shape.lineTo(0.2, -0.5);
  shape.lineTo(0, 0); // center fold bottom
  shape.lineTo(-0.2, -0.5);
  shape.lineTo(-1, -1);
  shape.lineTo(0, 2);

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false,
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Add a gentle floating animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y += Math.sin(time * 2) * 0.002;
    
    // Target position and rotation based on the step
    let targetX = 0;
    let targetZ = 0;
    let targetRotZ = 0;
    let targetRotY = 0;
    let targetRotX = Math.PI / 2; // Flat

    if (step === 0) {
      targetX = -2;
      targetRotZ = -Math.PI / 6;
      targetRotY = Math.PI / 4;
    } else if (step === 1) {
      targetX = 0;
      targetRotZ = 0;
      targetRotY = 0;
    } else if (step === 2) {
      targetX = 2;
      targetRotZ = Math.PI / 6;
      targetRotY = -Math.PI / 4;
    }

    // Smoothly interpolate to target position
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#0058be" 
          roughness={0.2} 
          metalness={0.1}
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Subtle trail or engine glow could go here */}
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
