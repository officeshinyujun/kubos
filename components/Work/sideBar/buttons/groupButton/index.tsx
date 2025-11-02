'use client'

import s from "../style.module.scss"
import { Pencil } from "lucide-react";
import { Trash } from "lucide-react";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";

interface Props {
    name: string;
    isChildren: boolean;
    isactive?: boolean;
    isExpanded?: boolean;
    edit: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function GroupButton({ 
    name, 
    isChildren, 
    isactive, 
    isExpanded = false, 
    edit, 
    onDelete, 
    onClick 
}: Props) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        edit();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };
  
    return (
        <div 
            className={[s.container, isactive ? s.active : ""].join(" ")} 
            style={{ marginLeft: isChildren ? "20px" : "0px" }} 
            onClick={handleClick}
        >
            <div className={s.name}>
                {isExpanded ? (
                    <ChevronDown size={24} strokeWidth={2} className={s.arrow} color="#fafafa" />
                ) : (
                    <ChevronRight size={24} strokeWidth={2} className={s.arrow} color="#fafafa" />
                )}
                <p>{name}</p>
            </div>
            <div className={s.button}>
                <Pencil size={20} strokeWidth={1.25} onClick={handleEditClick} color="#FAFAFA"/>
                <Trash size={20} strokeWidth={1.25} color="hsla(0, 100%, 56%, 1)" onClick={handleDeleteClick} />
            </div>
        </div>
    );
}