import { ModelData } from "@/types/model/modelDefinitions";

const MIN_VALUE = 0.1;

export const updateModelWidth = (
  model: ModelData,
  deltaX: number
): Partial<ModelData> => {
  const newArgs = [...model.geometryArgs];
  const newScale: [number, number, number] = [...model.scale];

  switch (model.geometryType) {
    case "정육면체": // BoxGeometry(width, height, depth)
      newArgs[0] = Math.max(MIN_VALUE, (newArgs[0] || 1) + deltaX);
      return { geometryArgs: newArgs };
    case "평면": // PlaneGeometry(width, height)
      newArgs[0] = Math.max(MIN_VALUE, (newArgs[0] || 1) + deltaX);
      return { geometryArgs: newArgs };
    default:
      newScale[0] = Math.max(MIN_VALUE, newScale[0] + deltaX);
      return { scale: newScale };
  }
};

export const updateModelDepth = (
  model: ModelData,
  deltaX: number
): Partial<ModelData> => {
  const newArgs = [...model.geometryArgs];
  const newScale: [number, number, number] = [...model.scale];

  switch (model.geometryType) {
    case "정육면체": // BoxGeometry(width, height, depth)
      newArgs[2] = Math.max(MIN_VALUE, (newArgs[2] || 1) + deltaX);
      return { geometryArgs: newArgs };
    case "평면": // Plane은 깊이 개념이 없으므로 Z스케일만 변경
      newScale[2] = Math.max(MIN_VALUE, newScale[2] + deltaX);
      return { scale: newScale };
    default:
      newScale[2] = Math.max(MIN_VALUE, newScale[2] + deltaX);
      return { scale: newScale };
  }
};


