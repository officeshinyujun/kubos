import Header from "@/components/header/indext";
import s from "./page.module.scss";
import SideBar from "@/components/Main/sideBar";

export default function Home() {
  return (
    <div className={s.container}>
      <Header/>
      <div className={s.contentsContainer}>
        <SideBar/>
      </div>
    </div>
  );
}
