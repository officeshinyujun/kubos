import Header from "@/components/header";
import s from "./page.module.scss";
import SideBar from "@/components/Main/sideBar";
import ProjectSection from "@/components/Main/projectSection";

export default function Home() {

  const user = "고윤"

  return (
    <div className={s.container}>
      <Header/>
      <div className={s.contentsContainer}>
        <SideBar/>
        <div className={s.contents}>
          <div>
            <p className={s.title}>안녕하세요 <span className={s.userName}>{user}</span>님</p>
            <p className={s.description}>오늘은 어떤 작품을 만드실건가요?</p>
          </div>
          <ProjectSection/>
        </div>
      </div>  
    </div>
  );
}
