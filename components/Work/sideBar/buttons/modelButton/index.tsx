'use client'

import s from "../style.module.scss"
import { Box, Pencil, Trash, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
interface Props {
    name: string;
    isChildren: boolean;
    isactive?: boolean;
    edit: (group: string | null, newName: string) => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function ModelButton({ name, isChildren, edit, onDelete, isactive, onClick }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingValue, setEditingValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus and select text when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            setEditingValue(name); // Start with current name when editing
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing, name]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const trimmedName = editingValue.trim();
        
        // 이름이 비어있으면 저장하지 않음
        if (trimmedName === '') {
            setIsEditing(false);
            return;
        }
        
        try {
            // 부모 컴포넌트의 edit 함수 호출하여 저장
            await edit(trimmedName, trimmedName);
            // 저장 성공 후 상태 초기화
            setEditingValue('');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save name:', error);
            // 저장 실패 시 기존 이름으로 복구
            setEditingValue(name);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave(e as any);
        } else if (e.key === 'Escape') {
            // ESC 키를 누르면 편집 모드만 종료 (변경사항 저장 안 함)
            setEditingValue('');
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
  
    return (
      <div 
          className={[s.container, isactive ? s.active : ""].join(" ")} 
          style={{ marginLeft: isChildren ? "50px" : "0px" }} 
          onClick={handleClick}
      >
        <div className={s.name}>
          <Box strokeWidth={1.25} color={"#FAFAFA"} />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className={s.nameInput}
            />
          ) : (
            <p>{name}</p>
          )}
        </div>
        <div className={s.button}>
          {isEditing ? (
            <Check 
              size={20} 
              strokeWidth={1.25} 
              color="#4CAF50" 
              onClick={handleSave}
            />
          ) : (
            <Pencil 
              size={20} 
              strokeWidth={1.25} 
              color="#FAFAFA" 
              onClick={handleEditClick} 
            />
          )}
          <Trash 
            size={20} 
            strokeWidth={1.25} 
            color="hsla(0, 100%, 56%, 1)" 
            onClick={onDelete} 
          />
        </div>
      </div>
    );
  }