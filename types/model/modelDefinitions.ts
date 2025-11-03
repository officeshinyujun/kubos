import { MaterialType } from "@/types/model/MaterialType"; // 기존 타입 임포트

// 📍 사용하려는 모든 지오메트리 타입을 정의합니다.
export type GeometryType =
  | "정육면체"
  | "구"
  | "원기둥"
  | "평면"
  | "원판"
  | "도넛"
  | "꼬인 도넛"
  | "12면체"
  | "8면체"
  | "20면체";
  // (기존 "@/types/model/GeometryType" 파일이 있다면 이 내용을 거기로 합치세요)

// 📍 ModelData 인터페이스를 이곳에서 정의하고 export 합니다.
export interface ModelData {
  id: string;
  geometryType: GeometryType;
  geometryArgs: any[];
  materialType: MaterialType;
  materialProps: any;
  position: [number, number, number];
  scale: [number, number, number];
}
