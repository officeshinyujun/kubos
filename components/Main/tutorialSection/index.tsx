'use client'

import s from "./style.module.scss"
import TutorialCard from "./tutorialCard"
import { useRouter } from "next/navigation";

export default function TutorialSection() {
    const router = useRouter();
    return (
        <section className={s.container}>
            <h1>튜토리얼</h1>
            <div className={s.contents}>
                <TutorialCard 
                    title="기본 튜토리얼 (FSM)" 
                    onClick={() => router.push("/work?tutorial=first_step")}
                />
                <TutorialCard
                    title="빛 튜토리얼 (FSM)"
                    onClick={() => router.push("/work?tutorial=light")}
                />
            </div>
        </section>
    )
}