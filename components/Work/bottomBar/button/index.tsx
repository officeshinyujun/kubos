import s from "./style.module.scss";
import {Box, Sun, Camera} from "lucide-react";

interface Props {
    isActive : boolean;
    type : '메시' | '라이트' | '카메라';
    onClick? : () => void
}
export default function BottomButton({isActive, type, onClick} : Props) {
    if (isActive) {
        return <div className={[s.container, s.active].join(" ")} onClick={onClick}>
            {(type === '메시' && <Box size={20} strokeWidth={2} color={"#111"}/>)}
            {(type === '라이트' && <Sun size={20} strokeWidth={2} color={"#111"}/>)}
            {(type === '카메라' && <Camera size={20} strokeWidth={2} color={"#111"}/>)}
            <p>{type}</p>
            </div>;
    } else {
        return <div className={[s.container, s.unactive].join(" ")} onClick={onClick}>
            {(type === '메시' && <Box size={20} strokeWidth={2} color={"#fafafa"}/>)}
            {(type === '라이트' && <Sun size={20} strokeWidth={2} color={"#fafafa"}/>)}
            {(type === '카메라' && <Camera size={20} strokeWidth={2} color={"#fafafa"}/>)}
            <p>{type}</p>
        </div>;
    }
}