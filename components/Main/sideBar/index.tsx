import s from "./style.module.scss";

export default function SideBar() {
    return (
        <div className={s.container}>
            <button className={s.button}>
                새 작품 만들기
            </button>
        </div>
    );
}