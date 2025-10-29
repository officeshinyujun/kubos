import s from "./tutorialCard.module.scss"
import testImage from "@/assets/images/test-image.jpg"
import { CircleCheck } from "lucide-react"

interface Props {
    title: string;
    isComplete?: boolean;
}

export default function TutorialCard({title, isComplete}: Props) {
    if (isComplete) {
        return (
            <div className={s.container} style={{backgroundImage: `url(${testImage.src})`}}>
                <div className={s.content + " " + s.complete}>
                    <CircleCheck size={36} color={"#33FF33"} />
                    <h1>{title}</h1>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className={s.container} style={{backgroundImage: `url(${testImage.src})`}}>
                <div className={s.content + " " + s.incomplete}>
                    <h1>{title}</h1>
                </div>
            </div>
        )
    }
}