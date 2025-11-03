import { ModelData } from "@/types/model/modelDefinitions";

/**
 * 모델 데이터와 Y축 변경량을 받아,
 * 변경된 geometryArgs 또는 scale이 포함된 객체를 반환합니다.
 * @param model - 수정할 현재 모델 데이터
 * @param deltaY - 높이 변경량
 * @returns Partial<ModelData> - 변경된 속성 (geometryArgs 또는 scale)
 */
export const updateModelHeight = (
  model: ModelData,
  deltaY: number
): Partial<ModelData> => {
  const newArgs = [...model.geometryArgs];
  const newScale: [number, number, number] = [...model.scale];
  const MIN_VALUE = 0.1; // 최소 높이/스케일

  switch (model.geometryType) {
    // --- 1. Geometry Args (파라미터) 변경 ---

    case "원기둥": // CylinderGeometry(radiusTop, radiusBottom, height)
      // geometryArgs[2] (height)
      newArgs[2] = Math.max(MIN_VALUE, (newArgs[2] || 1) + deltaY);
      return { geometryArgs: newArgs };

    case "정육면체": // BoxGeometry(width, height, depth)
      // geometryArgs[1] (height)
      newArgs[1] = Math.max(MIN_VALUE, (newArgs[1] || 1) + deltaY);
      return { geometryArgs: newArgs };

    case "평면": // PlaneGeometry(width, height)
      // geometryArgs[1] (height)
      newArgs[1] = Math.max(MIN_VALUE, (newArgs[1] || 1) + deltaY);
      return { geometryArgs: newArgs };

    // --- 2. Y-Axis Scale (스케일) 변경 ---

    case "구": // SphereGeometry(radius)
    case "원판": // CircleGeometry(radius)
    case "도넛": // TorusGeometry(radius, tube)
    case "꼬인 도넛": // TorusKnotGeometry(radius, tube)
    case "12면체": // DodecahedronGeometry(radius)
    case "8면체": // OctahedronGeometry(radius)
    case "20면체": // IcosahedronGeometry(radius)
      // Y축 스케일 (scale[1])
      newScale[1] = Math.max(MIN_VALUE, newScale[1] + deltaY);
      return { scale: newScale };

    // 변경 로직이 없는 경우
    default:
      return {};
  }
};
