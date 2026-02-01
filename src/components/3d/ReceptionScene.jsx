import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Center, useProgress, Html } from '@react-three/drei';

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-1 bg-primary-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-700 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[10px] font-black text-primary-900 uppercase tracking-widest leading-none">
                    {progress.toFixed(0)}% Synchronized
                </span>
            </div>
        </Html>
    );
}

const DeskModel = () => {
    // Hard path for the model
    const { scene } = useGLTF('/models/desk.glb');

    // Explicitly cloning or prepping the scene to ensure it stays reactive
    const copiedScene = useMemo(() => scene.clone(), [scene]);

    return (
        <Center top>
            <primitive
                object={copiedScene}
                scale={10}
                rotation={[0, Math.PI / 1.1, 0]}
            />
        </Center>
    );
};

// Error Boundary style component for Three.js
class ThreeErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() {
        if (this.state.hasError) return (
            <div className="flex items-center justify-center h-full bg-primary-50/20 rounded-3xl border border-primary-100">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary-950/40">3D Hub: Rendering Pause</span>
            </div>
        );
        return this.props.children;
    }
}

const ReceptionScene = () => {
    return (
        <ThreeErrorBoundary>
            <div className="w-full h-[500px] lg:h-[700px] relative bg-transparent">
                {/* Ambient Background Glow */}
                <div className="absolute inset-0 bg-primary-600/5 rounded-full blur-[120px] transform scale-75 opacity-50 pointer-events-none" />

                <Canvas
                    shadows
                    dpr={[1, 1.5]} // Lowering max DPR slightly for stability
                    camera={{ position: [10, 8, 10], fov: 30 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: true
                    }}
                >
                    <ambientLight intensity={1.5} />
                    <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={2.5} castShadow />
                    <pointLight position={[-10, 10, -10]} intensity={1} color="#dcfce7" />

                    <Suspense fallback={<Loader />}>
                        <group position={[0, -1.5, 0]}>
                            <DeskModel />
                            <ContactShadows
                                position={[0, -0.01, 0]}
                                opacity={0.6}
                                scale={20}
                                blur={3}
                                far={5}
                            />
                        </group>
                        <Environment preset="hospital" />
                    </Suspense>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2.2}
                        autoRotate
                        autoRotateSpeed={0.3}
                    />
                </Canvas>

                {/* Refined Branding Overlay */}
                <div className="absolute bottom-10 left-10 flex flex-col gap-1 border-l-2 border-primary-700 pl-4 py-1 pointer-events-none">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] leading-none">Virtual Front-Desk</span>
                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest leading-none opacity-60">Status: Online // Active Lobby</span>
                </div>
            </div>
        </ThreeErrorBoundary>
    );
};

export default ReceptionScene;
