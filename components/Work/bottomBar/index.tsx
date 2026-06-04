'use client';

import BottomButton from "./button";
import Section from "./section";
import SectionButton from "./section/button";
import s from "./style.module.scss"
import { useState } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { useEditorStore } from "@/stores/useEditStore";
import { ModelType } from "@/types/model/modelType";

export default function BottomBar() {
    const [activeButton, setActiveButton] = useState("메시");

    const handleClick = (type: string) => {
        setActiveButton(type);
    };
    
    const { objects, addObject, addLight, addCamera } = useSceneStore();
    const { selectedObjectId, activeTool, setActiveTool } = useEditorStore();

    const selectedObject = objects.find(o => o.name === selectedObjectId);
    const isEditableMesh = selectedObject?.type === 'editableMesh';

    const addMesh = (mesh: ModelType) => {
        addObject(null, mesh);
    }

    const meshList = [
        "정육면체",
        "구",
        "평면",
        "원판",
        "원기둥",
        "도넛",
        "꼬인 도넛",
        "12면체",
        "8면체",
        "20면체",
    ];      

    const lightList = [
        "앰비언트",
        "디렉셔널",
        "스팟",
        "헤미스피어",
        "렉트",
        "포인트"
    ]

    const cameraList = [
        "원근",
        "직교",
        "큐브"
    ]

    const lightTypeMapping: { [key: string]: "ambient" | "directional" | "point" | "spot" } = {
        "앰비언트": "ambient",
        "디렉셔널": "directional",
        "스팟": "spot",
        "포인트": "point"
    };

    const cameraTypeMapping: { [key: string]: "perspective" | "orthographic" } = {
        "원근": "perspective",
        "직교": "orthographic"
    };

    const transformTools = [
        { key: 'select' as const, label: '선택' },
        { key: 'move' as const, label: '이동' },
        { key: 'rotate' as const, label: '회전' },
        { key: 'scale' as const, label: '스케일' },
    ];

    const editTools = [
        { key: 'extrude' as const, label: '돌출' },
        { key: 'inset' as const, label: '인셋' },
        { key: 'bevel' as const, label: '베벨' },
        { key: 'loopCut' as const, label: '루프컷' },
    ];

    return (
        <div className={s.container}>
            <div className={s.toolPalette}>
                {transformTools.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTool(key)}
                        className={`${s.toolButton} ${activeTool === key ? s.toolButtonActive : ''}`}
                    >
                        {label}
                    </button>
                ))}
                {isEditableMesh && editTools.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTool(key)}
                        className={`${s.toolButton} ${activeTool === key ? s.toolButtonActive : ''}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className={s.top}>
                <BottomButton isActive={activeButton === "메시"} type="메시" onClick={() => handleClick("메시")} dataTutorialId="model-button"/>
                <BottomButton isActive={activeButton === "라이트"} type="라이트" onClick={() => handleClick("라이트")} dataTutorialId="light-button"/>
                <BottomButton isActive={activeButton === "카메라"} type="카메라" onClick={() => handleClick("카메라")}/>
            </div>
            <div className={s.bottom}>
                {activeButton === "메시" && 
                    <Section text="메시">
                        {meshList.map(name => (
                            <SectionButton 
                            key={name} 
                            type="메시" 
                            text={name} 
                            onClick={() => addMesh({
                                name: `${name}`, type: "mesh", locate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, shader: "standard", mesh: name
                            })} 
                            dataTutorialId={name === '정육면체' ? 'cube-card' : name === '구' ? 'sphere-card' : undefined}
                            />
                        ))}
                    </Section>
                }
                {activeButton === "라이트" && 
                    <Section text="라이트">
                        {lightList.filter(name => lightTypeMapping[name]).map(name => (
                            <SectionButton key={name} type="라이트" text={name} onClick={() => addLight(
                                null,
                                // @ts-expect-error light object shape is handled by the scene store
                                {name: `${name}`,
                                    type: "light",
                                    locate: {
                                        x: 1,
                                        y: 0,
                                        z: 1,
                                    },
                                    rotate: {
                                        x: 1,
                                        y: 3,
                                        z: 4,
                                    },
                                    scale: {
                                        x: 1,
                                        y: 1,
                                        z: 1,
                                    },
                                    light : lightTypeMapping[name]
                                }
                            )}
                            dataTutorialId={`light-button-${name}`}
                             />
                        ))}
                    </Section>
                }
                {activeButton === "카메라" && 
                    <Section text="카메라">
                        {cameraList.filter(name => cameraTypeMapping[name]).map(name => (
                            <SectionButton key={name} type="카메라" text={name} onClick={() => addCamera(null,
                                // @ts-ignore camera object shape is handled by the scene store
                                {name: `${name}`,
                                    type: "camera",
                                    locate: {
                                        x: 1,
                                        y: 1,
                                        z: 1,
                                    },
                                    rotate: {
                                        x: 1,
                                        y: 1,
                                        z: 1,
                                    },
                                    scale: {
                                        x: 1,
                                        y: 1,
                                        z: 1,
                                    },
                                    camera : cameraTypeMapping[name]
                                }
                            )} />
                        ))}
                    </Section>
                }
            </div>
        </div>
    );
}
