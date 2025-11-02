'use client'

import s from "./style.module.scss"
import { useState } from "react";
import TabButton from "./tabButton";
import { ModelType, GroupType, LightType, CameraType } from "@/types/model/modelType";
import ModelButton from "./buttons/modelButton";
import GroupButton from "./buttons/groupButton";
import LightButton from "./buttons/lightButton";
import CameraButton from "./buttons/cameraButton";
import { useSceneStore } from "@/stores/useSceneStore";

type TabType = "구조" | "코드" | "쉐이더";



export default function WorkSideBar() {
    const testData = useSceneStore((state) => state.objects);
    const {removeObject, updateObject} = useSceneStore();

    const [tab, setTab] = useState<TabType>("구조");
    const [active, setActive] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const handleDelete = (name : string) => {
        removeObject(name);
    }

    // name: "cube1", type: "mesh", locate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, shader: "standard", mesh: "box"

    return (
        <div className={s.container}>
            <div className={s.buttons}>
                <TabButton label="구조" onClick={() => setTab("구조")} isActive={tab === "구조"} />
                <TabButton label="코드" onClick={() => setTab("코드")} isActive={tab === "코드"} />
                <TabButton label="쉐이더" onClick={() => setTab("쉐이더")} isActive={tab === "쉐이더"} />
            </div>
            <div className={s.contents}>
                {testData.map((item) => {
                    if (item.type === "group") {
                        const isExpanded = !!expandedGroups[item.name];
                        return (
                            <div key={item.name} className={s.group}>
                                <GroupButton
                                    name={item.name}
                                    //@ts-ignore
                                    isChildren={false}
                                    isactive={active === item.name}
                                    isExpanded={isExpanded}
                                    edit={() => console.log("edit")}
                                    onDelete={() => console.log("delete")}
                                    onClick={() => {
                                        setActive(item.name);
                                        toggleGroup(item.name);
                                    }}
                                />
                                {/* @ts-ignore */}
                                {isExpanded && item.children.map(child => (
                                    <div key={child.name} className={s.child}>
                                        <ModelButton
                                            key={child.name}
                                            name={child.name}
                                            isChildren={false}
                                            isactive={active === child.name}
                                            //@ts-ignore
                                            edit={(newName) => updateObject(child.name, {name: newName})}
                                            onDelete={() => handleDelete(child.name)}
                                            onClick={() => setActive(child.name)}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    } else if (item.type === "light") {
                        return (
                            <LightButton
                                key={item.name}
                                name={item.name}
                                isChildren={false}
                                isactive={active === item.name}
                                edit={() => console.log("edit")}
                                onDelete={() => handleDelete(item.name)}
                                onClick={() => setActive(item.name)}
                            />
                        );
                    } else if (item.type === "camera") {
                        return (
                            <CameraButton
                                key={item.name}
                                name={item.name}
                                isChildren={false}
                                isactive={active === item.name}
                                edit={() => console.log("edit")}
                                onDelete={() => handleDelete(item.name)}
                                onClick={() => setActive(item.name)}
                            />
                        );
                    } else {
                        return (
                            <ModelButton
                                key={item.name}
                                name={item.name}
                                isChildren={false}
                                isactive={active === item.name}
                                //@ts-ignore
                                edit={(newName) => updateObject(item.name, {name: newName})}
                                onDelete={() => handleDelete(item.name)}
                                onClick={() => setActive(item.name)}
                            />
                        );
                    }
                })}
            </div>
        </div>
    );
}