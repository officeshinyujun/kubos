import s from "./projectCard.module.scss"
import Image from "next/image"
import testImage from "@/assets/images/test-image.jpg"

interface IProps  {
    title: string;
    editTime: string;
}

export default function ProjectCard({title, editTime}: IProps) {
    return (
        <div className={s.container}>
            <Image src={testImage} alt="project" width={400} height={230}/>
            <div className={s.contents}>
                <h1>{title}</h1>
                <p>{editTime}</p>
            </div>
        </div>
    )
}

