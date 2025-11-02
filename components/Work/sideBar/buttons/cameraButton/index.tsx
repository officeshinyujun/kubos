'use client'

import s from "../style.module.scss"
import { Camera } from "lucide-react";
import { Pencil } from "lucide-react";
import { Trash } from "lucide-react";
interface Props {
    name: string;
    isChildren: boolean;
    isactive?: boolean;
    edit: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function CameraButton({ name, isChildren, edit, onDelete, isactive, onClick }: Props) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };
  
    return (
      <div 
          className={[s.container, isactive ? s.active : ""].join(" ")} 
          style={{ marginLeft: isChildren ? "50px" : "0px" }} 
          onClick={handleClick}
      >
        <div className={s.name}>
          <Camera strokeWidth={1.25} color={"#FAFAFA"} />
          <p>{name}</p>
        </div>
        <div className={s.button}>
          <Pencil size={20} strokeWidth={1.25} color="#FAFAFA" onClick={edit} />
          <Trash size={20} strokeWidth={1.25} color="hsla(0, 100%, 56%, 1)" onClick={onDelete} />
        </div>
      </div>
    );
  }