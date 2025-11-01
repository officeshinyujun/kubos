import s from "./style.module.scss"

interface Props {
    label: string;
    onClick: () => void;
    isActive: boolean;
}

export default function TabButton({label, onClick, isActive}: Props){
    return(
        <button onClick={onClick} className={[s.button, isActive ? s.active : ""].join(" ")}>{label}</button>
    )   
}