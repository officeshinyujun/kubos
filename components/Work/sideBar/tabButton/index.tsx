import s from "./style.module.scss"

interface Props {
    label: string;
    onClick: () => void;
    isActive: boolean;
    dataTutorialId?: string;
}

export default function TabButton({label, onClick, isActive, dataTutorialId}: Props){
    const props = {
        "data-tutorial-id": dataTutorialId
    }
    return(
        <button onClick={onClick} className={[s.button, isActive ? s.active : ""].join(" ")} {...props}>{label}</button>
    )   
}