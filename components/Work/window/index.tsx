'use client'

import s from "./style.module.scss";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from "@/components/Work/model/index";
import ArrowMoveControl from "@/hooks/useArrowMoveControl";
import { useState } from "react";
import { MaterialType } from "@/types/model/MaterialType";

import { GeometryType } from "@/types/model/modelDefinitions";

import { useSceneStore } from "@/stores/useSceneStore";
import { ModelType } from "@/types/model/modelType";

export default function WorkWindow() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const { objects, updateObject } = useSceneStore();

  const handleHeightChange = (modelId: string, deltaY: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, y: model.scale.y + deltaY };
    updateObject(modelId, { scale: newScale });
  };

  const handleWidthChange = (modelId:string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, x: model.scale.x + deltaX };
    updateObject(modelId, { scale: newScale });
  };

  const handleDepthChange = (modelId: string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, z: model.scale.z + deltaX };
    updateObject(modelId, { scale: newScale });
  };

  return (
    <div className={s.container}>
      <Canvas className={s.canvas}>
        <ArrowMoveControl />
        {objects.map((obj) => {
          if (obj.type === 'mesh') {
            return (
              <Model
                key={obj.name}
                geometryType={obj.mesh as GeometryType}
                position={[obj.locate.x, obj.locate.y, obj.locate.z]}
                scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
                materialType={obj.shader as MaterialType}
                orbitControlSetter={setOrbitEnabled}
                onHeightChange={(deltaY) => handleHeightChange(obj.name, deltaY)}
                onWidthChange={(deltaX) => handleWidthChange(obj.name, deltaX)}
                onDepthChange={(deltaX) => handleDepthChange(obj.name, deltaX)}
              />
            )
          }
          if (obj.type === 'light') {
            const position = [obj.locate.x, obj.locate.y, obj.locate.z] as [number, number, number];
            if (obj.light === 'ambient') {
              return <ambientLight key={obj.name} intensity={0.5} />
            }
            if (obj.light === 'directional') {
              return <directionalLight key={obj.name} position={position} intensity={0.5} />
            }
            if (obj.light === 'point') {
              return <pointLight key={obj.name} position={position} intensity={0.5} />
            }
            if (obj.light === 'spot') {
              return <spotLight key={obj.name} position={position} intensity={0.5} />
            }
          }
          return null;
        })}

        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
        <OrbitControls enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}
