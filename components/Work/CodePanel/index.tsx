import CodeViewer from "@/components/general/CodeViewer";
import s from "./style.module.scss"

interface CodePanelProps {
    reactCode: string;
    vanillaCode: string;
}

export default function CodePanel({ reactCode, vanillaCode }: CodePanelProps) {
    return (
        <div className={s.container}>
            <CodeViewer reactCode={reactCode} vanillaCode={vanillaCode} />
        </div>
    )
}