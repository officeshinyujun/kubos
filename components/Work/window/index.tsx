'use client'

import s from "./style.module.scss";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "@/components/Work/model/index";
import ArrowMoveControl from "@/hooks/useArrowMoveControl";
import { useState } from "react";
import { MaterialType } from "@/types/model/MaterialType"; // 📍 MaterialType만 임포트

// 📍 새로 만든 타입 파일에서 ModelData와 GeometryType을 임포트합니다.
import { ModelData, GeometryType } from "@/types/model/modelDefinitions";
// 📍 새로 만든 유틸리티 파일을 임포트합니다.
import { updateModelHeight } from "@/utils/geometryHeightUpdater";
import { updateModelWidth, updateModelDepth } from "@/utils/geometryAxisUpdater";

// 📍 ModelData 인터페이스 정의 제거 (파일로 분리됨)

// 초기 모델 데이터 (다양한 모델 추가)
const initialModels: ModelData[] = [
  // --- 기존 모델 ---
  {
    id: "box-1",
    geometryType: "정육면체",
    geometryArgs: [1, 1, 1], // width, height, depth
    materialType: "phong",
    materialProps: { color: "green", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: "sphere-1",
    geometryType: "구",
    geometryArgs: [0.8], // radius
    materialType: "phong",
    materialProps: { color: "blue", shininess: 100 },
    position: [-2, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: "cylinder-1",
    geometryType: "원기둥",
    geometryArgs: [0.5, 0.5, 1], // radiusTop, radiusBottom, height
    materialType: "phong",
    materialProps: { color: "red", shininess: 100 },
    position: [2, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: "torus-1",
    geometryType: "도넛",
    geometryArgs: [0.8, 0.2], // radius, tube
    materialType: "phong",
    materialProps: { color: "purple", shininess: 100 },
    position: [0, 0, 2],
    scale: [1, 1, 1],
  },
  {
    id: "plane-1",
    geometryType: "평면",
    geometryArgs: [1, 1], // width, height
    materialType: "standard",
    materialProps: { color: "gray", side: 2 }, // 양면 렌더링
    position: [0, 0, -2],
    scale: [1, 1, 1],
  },

  // --- 📍 새로 추가된 모델 ---
  {
    id: "circle-1",
    geometryType: "원판",
    geometryArgs: [1], // radius
    materialType: "standard",
    materialProps: { color: "yellow", side: 2 },
    position: [-2, 0, 2],
    scale: [1, 1, 1],
  },
  {
    id: "torusknot-1",
    geometryType: "꼬인 도넛",
    geometryArgs: [0.8, 0.1, 100, 16], // radius, tube, tubularSegments, radialSegments
    materialType: "phong",
    materialProps: { color: "orange", shininess: 100 },
    position: [2, 0, 2],
    scale: [1, 1, 1],
  },
  {
    id: "dodecahedron-1",
    geometryType: "12면체",
    geometryArgs: [1], // radius
    materialType: "phong",
    materialProps: { color: "cyan", shininess: 100 },
    position: [-2, 0, -2],
    scale: [1, 1, 1],
  },
  {
    id: "octahedron-1",
    geometryType: "8면체",
    geometryArgs: [1], // radius
    materialType: "phong",
    materialProps: { color: "magenta", shininess: 100 },
    position: [2, 0, -2],
    scale: [1, 1, 1],
  },
  {
    id: "icosahedron-1",
    geometryType: "20면체",
    geometryArgs: [1], // radius
    materialType: "phong",
    materialProps: { color: "lime", shininess: 100 },
    position: [0, 0, 4],
    scale: [1, 1, 1],
  },
];

export default function WorkWindow() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [models, setModels] = useState<ModelData[]>(initialModels);

  // 📍 모델 높이 변경 핸들러가 매우 단순해짐
  const handleHeightChange = (modelId: string, deltaY: number) => {
    setModels((currentModels) =>
      currentModels.map((model) => {
        if (model.id !== modelId) return model;

        // 📍 분리된 유틸리티 함수 호출
        const updatedProps = updateModelHeight(model, deltaY);

        // 📍 반환된 변경점만 모델에 적용
        return { ...model, ...updatedProps };
      })
    );
  };

  const handleWidthChange = (modelId: string, deltaX: number) => {
    setModels((currentModels) =>
      currentModels.map((model) => {
        if (model.id !== modelId) return model;
        const updatedProps = updateModelWidth(model, deltaX);
        return { ...model, ...updatedProps };
      })
    );
  };

  const handleDepthChange = (modelId: string, deltaX: number) => {
    setModels((currentModels) =>
      currentModels.map((model) => {
        if (model.id !== modelId) return model;
        const updatedProps = updateModelDepth(model, deltaX);
        return { ...model, ...updatedProps };
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
            scale={model.scale}
            orbitControlSetter={setOrbitEnabled}
            onHeightChange={(deltaY) => handleHeightChange(model.id, deltaY)}
            onWidthChange={(deltaX) => handleWidthChange(model.id, deltaX)}
            onDepthChange={(deltaX) => handleDepthChange(model.id, deltaX)}
          />
        ))}

        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
        <OrbitControls enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}

