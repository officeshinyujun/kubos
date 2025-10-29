import s from "./style.module.scss";
import Image from "next/image";
import logo from "@/assets/images/kubos_logo.svg"

export default function WorkHeader() {
    return (
        <header className={s.container}>
            <Image src={logo} alt="Logo" width={40} height={40} />
            <p>새 파일</p>
            <p>내보내기</p>
            <p>저장하기</p>
            <p>삭제하기</p>
        </header>
    );
}