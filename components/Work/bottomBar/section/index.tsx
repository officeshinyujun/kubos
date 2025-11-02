import s from "./style.module.scss";

interface Props {
    text : "메시" | "라이트" | "카메라";
    children : React.ReactNode
}
export default function Section( { text, children } : Props) {
    return (
        <div className={s.container}>
            <p>{text}</p>
            <div className={[s.contents, (text === "메시" ? s.mesh : s.other)].join(" ")}>
                {children}
            </div>
        </div>
    )
}