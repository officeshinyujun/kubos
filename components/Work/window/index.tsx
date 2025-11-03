'use client'

import s from "./style.module.scss";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "@/components/Work/model/index";
import ArrowMoveControl from "@/hooks/useArrowMoveControl";
import { useState } from "react";
import { GeometryType } from "@/types/model/GeometryType";
import { MaterialType } from "@/types/model/MaterialType";

// 모델 데이터 타입을 정의
interface ModelData {
  id: string;
  geometryType: GeometryType;
  geometryArgs: any[];
  materialType: MaterialType;
  materialProps: any;
  position: [number, number, number];
  scale: [number, number, number]; // 📍 스케일 속성 추가
}

// 초기 모델 데이터
const initialModels: ModelData[] = [
  {
    id: "cylinder-1",
    geometryType: "원기둥",
    geometryArgs: [1, 1, 1], // [radiusTop, radiusBottom, height]
    materialType: "phong",
    materialProps: { color: "red", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1], // 📍 기본 스케일
  },
  {
    id: "sphere-1",
    geometryType: "구",
    geometryArgs: [1], // [radius]
    materialType: "phong",
    materialProps: { color: "blue", shininess: 100 },
    position: [-2, 0, 0],
    scale: [1, 1, 1], // 📍 기본 스케일
  },
];


export default function WorkWindow() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [models, setModels] = useState<ModelData[]>(initialModels);

  // 모델 높이 변경 핸들러
  const handleHeightChange = (modelId: string, deltaY: number) => {
    setModels(currentModels =>
      currentModels.map(model => {
        if (model.id !== modelId) return model;

        let newArgs = [...model.geometryArgs];
        let newScale: [number, number, number] = [...model.scale]; // 현재 스케일 복사

        // 📍 지오메트리 타입에 따라 분기
        if (model.geometryType === "원기둥") {
          // 원기둥은 지오메트리 자체의 높이를 변경
          const newHeight = Math.max(0.1, newArgs[2] + deltaY); // 최소 높이 0.1
          newArgs[2] = newHeight;
        } else if (model.geometryType === "구") {
          // 구는 Y축 스케일을 변경
          const newScaleY = Math.max(0.1, newScale[1] + deltaY); // 최소 스케일 0.1
          newScale[1] = newScaleY;
        }
        // TODO: BoxGeometry 등 다른 타입도 추가 가능

        return { ...model, geometryArgs: newArgs, scale: newScale };
      })
    );
  };

  return (
    <div className={s.container}>
      <Canvas className={s.canvas}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <ArrowMoveControl />

        {models.map((model) => (
          <Model
            key={model.id}
            geometryType={model.geometryType}
            geometryArgs={model.geometryArgs}
            materialType={model.materialType}
            materialProps={model.materialProps}
            position={model.position}
            scale={model.scale} // 📍 scale prop 전달
            orbitControlSetter={setOrbitEnabled}
            onHeightChange={(deltaY) => handleHeightChange(model.id, deltaY)}
          />
        ))}

        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
        <OrbitControls enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}