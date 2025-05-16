import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box } from '@react-three/drei';

export default function MedicineModel() {
  const pillRef = useRef<any>();
  
  useFrame((state) => {
    if (pillRef.current) {
      pillRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={pillRef}>
      {/* Pill body */}
      <Cylinder args={[0.3, 0.3, 1, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
      </Cylinder>
      
      {/* Pill ring */}
      <Cylinder args={[0.31, 0.31, 0.1, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4f46e5" metalness={0.7} roughness={0.2} />
      </Cylinder>
    </group>
  );
}
