'use client'

import s from "./style.module.scss"
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
export default function WorkWindow() {
    return (
        <div className={s.container}>
            <Canvas className={s.canvas}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#7aa7ff" />
                </mesh>

                <gridHelper args={[10, 10]} />
                <axesHelper args={[5]} />

                <OrbitControls />
            </Canvas>
        </div>
    )
}