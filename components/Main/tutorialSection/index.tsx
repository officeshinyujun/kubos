'use client'

import s from "./style.module.scss"
import TutorialCard from "./tutorialCard"
import { useRouter } from "next/navigation";
import { useTutorialStore } from "@/stores/useTutorialStore";

export default function TutorialSection() {
    const router = useRouter();
    const { completedTutorials } = useTutorialStore();

    return (
        <section className={s.container}>
            <h1>튜토리얼</h1>
            <div className={s.contents}>
                <TutorialCard 
                    title="기본 튜토리얼" 
                    isComplete={completedTutorials['firstStepTutorial']}
                    onClick={() => router.push("/work?tutorial=first_step")}
                />
                <TutorialCard
                    title="빛 튜토리얼"
                    isComplete={completedTutorials['lightTutorial']}
                    onClick={() => router.push("/work?tutorial=light")}
                />
                <TutorialCard
                    title="질감 튜토리얼"
                    onClick={() => router.push("/work?tutorial=texture")}
                />
                <TutorialCard
                    title="외부 모델 튜토리얼"
                    onClick={() => router.push("/work?tutorial=external_model")}
                />
                <TutorialCard
                    title="외부 추출 튜토리얼"
                    onClick={() => router.push("/work?tutorial=external_extract")}
                />
            </div>
        </section>
    )
}