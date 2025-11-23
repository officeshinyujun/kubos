'use client';

import s from "./style.module.scss";
import Image from "next/image";
import logo from "@/assets/images/kubos_logo.svg"
import { useTutorialStore } from "@/stores/useTutorialStore";
import { useSceneStore } from "@/stores/useSceneStore";
import { exportToGLTF } from "@/utils/export";
import { useRouter } from "next/navigation";

export default function WorkHeader() {
    const { startTutorial } = useTutorialStore();
    const { objects } = useSceneStore();
    const router = useRouter();

    const handleExport = () => {
        exportToGLTF(objects);
    }

    return (
        <header className={s.container}>
            <Image src={logo} alt="Logo" width={40} height={40} onClick={() => router.push('/')} />
            <p data-tutorial-id="import-button">불러오기</p>
            <p data-tutorial-id="export-button" onClick={handleExport}>내보내기</p>
            <p>저장하기</p>
            <p>삭제하기</p>
            <p onClick={() => startTutorial('FIRST_STEP_START')}>튜토리얼</p>
        </header>
    );
}