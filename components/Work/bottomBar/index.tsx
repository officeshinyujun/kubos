'use client';

import BottomButton from "./button";
import Section from "./section";
import SectionButton from "./section/button";
import s from "./style.module.scss"
import { useState } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { ModelType } from "@/types/model/modelType";

export default function BottomBar() {
    const [activeButton, setActiveButton] = useState("메시");

    const handleClick = (type: string) => {
        setActiveButton(type);
    };
    
    const { addObject, addLight, addCamera } = useSceneStore();

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

    return (
        <div className={s.container}>
            <div className={s.top}>
                <BottomButton isActive={activeButton === "메시"} type="메시" onClick={() => handleClick("메시")}/>
                <BottomButton isActive={activeButton === "라이트"} type="라이트" onClick={() => handleClick("라이트")}/>
                <BottomButton isActive={activeButton === "카메라"} type="카메라" onClick={() => handleClick("카메라")}/>
            </div>
            <div className={s.bottom}>
                {activeButton === "메시" && 
                    <Section text="메시">
                        {meshList.map(name => (
                            <SectionButton key={name} type="메시" text={name} onClick={() => addMesh({
                                name: `${name}`, type: "mesh", locate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, shader: "standard", mesh: "box"
                            })} />
                        ))}
                    </Section>
                }
                {activeButton === "라이트" && 
                    <Section text="라이트">
                        {lightList.map(name => (
                            <SectionButton key={name} type="라이트" text={name} onClick={() => addLight(
                                null,
                                // @ts-ignore
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
                                    light : "ambient" 
                                }
                            )} />
                        ))}
                    </Section>
                }
                {activeButton === "카메라" && 
                    <Section text="카메라">
                        {cameraList.map(name => (
                            <SectionButton key={name} type="카메라" text={name} onClick={() => addCamera(null,
                                // @ts-ignore
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
                                    camera : "perspective" 
                                }
                            )} />
                        ))}
                    </Section>
                }
            </div>
        </div>
    );
}