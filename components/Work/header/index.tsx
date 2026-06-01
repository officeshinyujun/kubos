'use client';

import s from "./style.module.scss";
import Image from "next/image";
import logo from "@/assets/images/kubos_logo.svg"
import { useSceneStore } from "@/stores/useSceneStore";
import { exportToGLTF } from "@/utils/export";
import { useRouter } from "next/navigation";
import { useRef, useCallback } from "react";
import ModeToggle from "./ModeToggle";
import SelectionModeBar from '@/components/Work/Toolbar/SelectionModeBar';

export default function WorkHeader() {
    const { objects, addGltf } = useSceneStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        exportToGLTF(objects);
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    addGltf(null, e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    }, [addGltf]);

    return (
        <header className={s.container}>
            <Image src={logo} alt="Logo" width={40} height={40} onClick={() => router.push('/')} />
            <ModeToggle />
            <SelectionModeBar />
            <p data-tutorial-id="import-button" onClick={handleImportClick}>불러오기</p>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".gltf,.glb"
                onChange={handleFileChange}
            />
            <p data-tutorial-id="export-button" onClick={handleExport}>내보내기</p>
            <p>저장하기</p>
            <p>삭제하기</p>
        </header>
    );
}
