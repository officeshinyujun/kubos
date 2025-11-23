'use client';

import s from "./style.module.scss";
import Image from "next/image";
import logo from "@/assets/images/kubos_logo.svg"
import { useTutorialStore } from "@/stores/useTutorialStore";

export default function WorkHeader() {
    const { startTutorial } = useTutorialStore();
    return (
        <header className={s.container}>
            <Image src={logo} alt="Logo" width={40} height={40} />
            <p data-tutorial-id="import-button">불러오기</p>
            <p data-tutorial-id="export-button">내보내기</p>
            <p>저장하기</p>
            <p>삭제하기</p>
            <p onClick={startTutorial}>튜토리얼</p>
        </header>
    );
}