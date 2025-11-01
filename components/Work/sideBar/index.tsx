'use client'

import s from "./style.module.scss"
import { useState } from "react";
import TabButton from "./tabButton";
import { ModelType, GroupType } from "@/types/model/modelType";

type TabType = "구조" | "코드" | "쉐이더";


export default function WorkSideBar() {

    const testData: (ModelType | GroupType)[] = [
        {
            name: "cube1",
            type: "cube",
            locate: { x: 0, y: 0, z: 0 },
            rotate: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            shader: ""
        },
        {
            name: "mesh1",
            type: "mesh",
            locate: { x: 0, y: 0, z: 0 },
            rotate: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            shader: "standard",
            mesh: "box"
        },
        {
            name: "group1",
            type: "group",
            children: [
                {
                    name: "cube2",
                    type: "cube",
                    locate: { x: 0, y: 0, z: 0 },
                    rotate: { x: 0, y: 0, z: 0 },
                    scale: { x: 1, y: 1, z: 1 }
                }
            ]
        }
    ];

    const [tab, setTab] = useState<TabType>("구조");
    return (
        <div className={s.container}>
            <div className={s.buttons}>
                <TabButton label="구조" onClick={() => setTab("구조")} isActive={tab === "구조"} />
                <TabButton label="코드" onClick={() => setTab("코드")} isActive={tab === "코드"} />
                <TabButton label="쉐이더" onClick={() => setTab("쉐이더")} isActive={tab === "쉐이더"} />
            </div>
        </div>
    );
}