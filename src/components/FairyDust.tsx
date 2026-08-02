import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Fairies() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 70; // Enough for a magical atmosphere
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 30 - 5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        timeOffset: Math.random() * Math.PI * 100, // For randomized sine waves
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    particles.forEach((particle, i) => {
      // Gentle floating and roaming motion
      particle.x += particle.speedX * delta + Math.sin(time * 0.5 + particle.timeOffset) * 0.005;
      particle.y += particle.speedY * delta + Math.cos(time * 0.5 + particle.timeOffset) * 0.005;
      
      // Wrap around bounds so they keep roaming endlessly
      if (particle.x > 25) particle.x = -25;
      if (particle.x < -25) particle.x = 25;
      if (particle.y > 25) particle.y = -25;
      if (particle.y < -25) particle.y = 25;
      
      // Gentle bobbing in Z for 3D depth
      const currentZ = particle.z + Math.sin(time * 0.3 + particle.timeOffset) * 2;
      
      dummy.position.set(particle.x, particle.y, currentZ);
      
      // Scale them up and down slowly for a twinkling/pulsing fairy effect
      const scale = 0.5 + Math.max(0, Math.sin(time * 1.5 + particle.timeOffset)) * 1.5;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Small glowing spheres */}
      <sphereGeometry args={[0.04, 16, 16]} />
      {/* Magical pink/purple/gold glow */}
      <meshBasicMaterial 
        color={[2.0, 1.2, 3.0]} 
        toneMapped={false} 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
      />
    </instancedMesh>
  );
}

export default function FairyDust() {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Fairies />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={2.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
