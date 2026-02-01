import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, PerspectiveCamera, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import emeraldMatcap from '../../assets/emerald_matcap.png';

const PodMesh = ({ activeIndex }) => {
    const meshRef = useRef();
    const texture = useTexture(emeraldMatcap);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Automatic rotation
            meshRef.current.rotation.y = time * 0.3;
            meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.2;

            // Reaction to active index (simulating "Opening/Rotating")
            const targetRotationX = activeIndex !== null ? (activeIndex * Math.PI) / 2 : 0;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.05);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} castShadow>
                <octahedronGeometry args={[2, 2]} />
                <meshMatcapMaterial matcap={texture} flatShading={false} />

                {/* Internal Core Glow */}
                <mesh scale={0.6}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshDistortMaterial
                        color="#dcfce7"
                        speed={3}
                        distort={0.4}
                        radius={1}
                        emissive="#16a34a"
                        emissiveIntensity={2}
                    />
                </mesh>
            </mesh>

            {/* Pulsing Outer Rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3, 0.02, 16, 100]} />
                <meshStandardMaterial color="#bbf7d0" emissive="#16a34a" emissiveIntensity={5} transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[3.2, 0.015, 16, 100]} />
                <meshStandardMaterial color="#fffbeb" emissive="#d97706" emissiveIntensity={3} transparent opacity={0.2} />
            </mesh>
        </Float>
    );
};

const HealthPod = ({ activeIndex }) => {
    return (
        <div className="w-full h-[500px] mt-12 relative cursor-grab active:cursor-grabbing">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary-600/5 rounded-full blur-[100px] transform scale-75" />

            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

                <PodMesh activeIndex={activeIndex} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>

            {/* Overlay instruction */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary-950/30 text-[10px] uppercase font-black tracking-[0.2em] pointer-events-none">
                Interactive Wellness Core // Drag to Rotate
            </div>
        </div>
    );
};

export default HealthPod;
