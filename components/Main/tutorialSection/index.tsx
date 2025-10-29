import s from "./style.module.scss"
import TutorialCard from "./tutorialCard"

export default function TutorialSection() {
    return (
        <section className={s.container}>
            <h1>튜토리얼</h1>
            <div className={s.contents}>
                <TutorialCard title="튜토리얼 1" isComplete={true} />
                <TutorialCard title="튜토리얼 2" />
                <TutorialCard title="튜토리얼 3" />
                <TutorialCard title="튜토리얼 4" />
                <TutorialCard title="튜토리얼 5" />
                <TutorialCard title="튜토리얼 6" />
                <TutorialCard title="튜토리얼 7" />
                <TutorialCard title="튜토리얼 8" />
                <TutorialCard title="튜토리얼 9" />
            </div>
        </section>
    )
}