'use client'

import s from "./style.module.scss";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "@/components/Work/model/index";
import ArrowMoveControl from "@/hooks/useArrowMoveControl";
import { useState } from "react";

export default function WorkWindow() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div className={s.container}>
      <Canvas className={s.canvas}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <ArrowMoveControl />

        <Model
          geometryType="원기둥"
          geometryArgs={[1, 1, 1]}
          materialType="phong"
          materialProps={{ color: "red", shininess: 100 }}
          orbitControlSetter={setOrbitEnabled}
        />

        <Model
          geometryType="구"
          geometryArgs={[1]}
          materialType="phong"
          materialProps={{ color: "blue", shininess: 100 }}
          position={[-2, 0, 0]}
          orbitControlSetter={setOrbitEnabled}
        />

        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
        <OrbitControls enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}
