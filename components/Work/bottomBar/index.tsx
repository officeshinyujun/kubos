'use client';

import BottomButton from "./button";
import Section from "./section";
import SectionButton from "./section/button";
import s from "./style.module.scss"
import { useState } from "react";

export default function BottomBar() {
    const [activeButton, setActiveButton] = useState("메시");

    const handleClick = (type: string) => {
        setActiveButton(type);
    };

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
                        <SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/>
                        <SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/><SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/><SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/><SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/><SectionButton type="메시" text="메시"/>
                        <SectionButton type="메시" text="1"/>
                        <SectionButton type="메시" text="2"/>
                    </Section>
                }
                {activeButton === "라이트" && 
                    <Section text="라이트">
                        <SectionButton type="라이트" text="메시"/>
                        <SectionButton type="라이트" text="1"/>
                        <SectionButton type="라이트" text="2"/>
                    </Section>
                }
                {activeButton === "카메라" && 
                    <Section text="카메라">
                        <SectionButton type="카메라" text="메시"/>
                        <SectionButton type="카메라" text="1"/>
                        <SectionButton type="카메라" text="2"/>
                    </Section>
                }
            </div>
        </div>
    );
}