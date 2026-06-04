import s from "./style.module.scss";
import { VStack } from "@/components/general/VStack";

export default function SideBar() {
    return (
        <VStack className={s.container} fullHeight align="center">
            <button className={s.button}>
                새 작품 만들기
            </button>
        </VStack>
    );
}
