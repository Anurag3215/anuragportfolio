import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WarpLines() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 400; // Increased count for full screen
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 60, // wider spread
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 100,
        speed: 20 + Math.random() * 50
      });
    }
    return temp;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    particles.forEach((particle, i) => {
      particle.z += particle.speed * delta;
      
      if (particle.z > 20) {
        particle.z = -100;
        particle.x = (Math.random() - 0.5) * 60;
        particle.y = (Math.random() - 0.5) * 60;
      }
      
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.015, 0.015, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
    </instancedMesh>
  );
}

export default function StarfieldBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <WarpLines />
      </Canvas>
      {/* Soft gradient overlay so it fades slightly at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  );
}
