import s from "./style.module.scss"
import {Box, Sun, Camera} from "lucide-react";
interface Props {
    type : "메시" | "라이트" | "카메라";
    text : string;
    onClick? : () => void;
    dataTutorialId?: string;
}
export default function SectionButton( { type, text, onClick, dataTutorialId } : Props) {
    const props = {
        "data-tutorial-id": dataTutorialId
    }
    return(
        <div className={s.container} onClick={onClick} {...props}>
            {(type === '메시' && <Box size={24} strokeWidth={2} color={"#fafafa"}/>)}
            {(type === '라이트' && <Sun size={24} strokeWidth={2} color={"#fafafa"}/>)}
            {(type === '카메라' && <Camera size={24} strokeWidth={2} color={"#fafafa"}/>)}
            <p>{text}</p>
        </div>
    )
}