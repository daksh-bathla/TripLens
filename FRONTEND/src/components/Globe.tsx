import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Sphere ref={earthRef} args={[2.5, 64, 64]}>
      <meshStandardMaterial 
        color="#0058be" 
        wireframe={true} 
        transparent={true} 
        opacity={0.15} 
      />
    </Sphere>
  );
};

export default function Globe() {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-100 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-transparent z-10 pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0058be" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0b1c30" />
        <Earth />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      <div className="absolute bottom-8 left-8 z-20">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Interactive Travel Map</h3>
        <p className="text-slate-500 text-sm font-medium">Explore your past and upcoming destinations.</p>
      </div>
    </div>
  );
}
