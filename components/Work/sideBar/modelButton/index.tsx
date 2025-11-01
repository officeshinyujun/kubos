'use client'

import s from "./style.module.scss"

interface Props {
    name: string;
    type: string;
    edit: () => void;
    onDelete: () => void;
}

export default function ModelButton({ name, type, edit, onDelete }: Props) {
    return(
        <div className={s.container}>   
            
        </div>
    )
}