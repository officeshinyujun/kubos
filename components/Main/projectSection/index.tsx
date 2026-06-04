import s from "./style.module.scss"
import ProjectCard from "./projectCard"
import { VStack } from "@/components/general/VStack"
import { HStack } from "@/components/general/HStack"
import Typo from "@/components/general/Typo"

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
        <VStack as="section" className={s.container} fullWidth gap={16} align="start">
            <Typo.BD size={24} color="primary">이전 프로젝트</Typo.BD>
            <HStack className={s.contents} fullWidth gap={16} align="start">
                {projects.map((project, index) => (
                    <ProjectCard key={index} title={project.title} editTime={project.editTime}/>
                ))}
            </HStack>
        </VStack>
    )
}
