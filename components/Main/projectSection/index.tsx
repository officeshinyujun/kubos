import s from "./style.module.scss"
import ProjectCard from "./projectCard"

export default function ProjectSection() {

    const projects = [
        {
            title: "프로젝트 1",
            editTime: "2025-10-25"
        },
        {
            title: "프로젝트 2",
            editTime: "2025-10-25"
        },
        {
            title: "프로젝트 3",
            editTime: "2025-10-25"
        }
    ]

    return (
        <section className={s.container}>
            <h1>이전 프로젝트</h1>
            <div className={s.contents}>
                {projects.map((project, index) => (
                    <ProjectCard key={index} title={project.title} editTime={project.editTime}/>
                ))}
            </div>
        </section>
    )
}