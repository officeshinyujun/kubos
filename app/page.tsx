import Header from "@/components/general/header";
import s from "./page.module.scss";
import SideBar from "@/components/Main/sideBar";
import ProjectSection from "@/components/Main/projectSection";
import TutorialSection from "@/components/Main/tutorialSection";
import { VStack } from "@/components/general/VStack";
import { HStack } from "@/components/general/HStack";
import Typo from "@/components/general/Typo";

export default function Home() {
  const user = "유준";

  return (
    <VStack className={s.container}>
      <Header/>
      <HStack className={s.contentsContainer} fullWidth fullHeight align="start">
        <SideBar/>
        <VStack className={s.contents} fullWidth fullHeight gap={16} align="start">
          <VStack>
            <Typo.MD size={24} color="primary" style={{lineHeight: '150%'}}>
              안녕하세요 <Typo.SM as="span" size={24} color="brand">{user}</Typo.SM>님
            </Typo.MD>
            <Typo.MD size={16} color="secondary" style={{lineHeight: '150%'}}>오늘은 어떤 작품을 만드실건가요?</Typo.MD>
          </VStack>
          <ProjectSection/>
          <TutorialSection/>
        </VStack>
      </HStack>
    </VStack>
  );
}
