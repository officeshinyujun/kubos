import { create } from "zustand";
import { useSceneStore } from "./useSceneStore";
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate random position around the center
const getRandomPosition = (radius = 3) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 2 + Math.random() * radius;
  return [
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  ] as [number, number, number];
};

export interface ModelTemplate {
  id: string;
  geometryType: string;
  geometryArgs: number[];
  materialType: string;
  materialProps: Record<string, any>;
  position: [number, number, number];
  scale: [number, number, number];
  name: string;
}

interface ModelTemplatesState {
  templates: ModelTemplate[];
  addModelToScene: (template: Omit<ModelTemplate, 'id' | 'name'>, name: string) => void;
  getTemplatesByCategory: () => Record<string, ModelTemplate[]>;
}

const initialTemplates: Omit<ModelTemplate, 'id' | 'name'>[] = [
  {
    geometryType: "정육면체",
    geometryArgs: [1, 1, 1],
    materialType: "phong",
    materialProps: { color: "green", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "구",
    geometryArgs: [0.8],
    materialType: "phong",
    materialProps: { color: "blue", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "원기둥",
    geometryArgs: [0.5, 0.5, 1],
    materialType: "phong",
    materialProps: { color: "red", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "도넛",
    geometryArgs: [0.8, 0.2],
    materialType: "phong",
    materialProps: { color: "purple", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "평면",
    geometryArgs: [1, 1],
    materialType: "standard",
    materialProps: { color: "gray", side: 2 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "원판",
    geometryArgs: [1],
    materialType: "standard",
    materialProps: { color: "yellow", side: 2 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "꼬인 도넛",
    geometryArgs: [0.8, 0.1, 100, 16],
    materialType: "phong",
    materialProps: { color: "orange", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "12면체",
    geometryArgs: [1],
    materialType: "phong",
    materialProps: { color: "cyan", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "8면체",
    geometryArgs: [1],
    materialType: "phong",
    materialProps: { color: "magenta", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    geometryType: "20면체",
    geometryArgs: [1],
    materialType: "phong",
    materialProps: { color: "lime", shininess: 100 },
    position: [0, 0, 0],
    scale: [1, 1, 1],
  },
];

export const useModelTemplates = create<ModelTemplatesState>((set, get) => ({
  templates: initialTemplates.map((t, i) => ({
    ...t,
    id: `template-${i}`,
    name: `${t.geometryType} ${i + 1}`,
  })),
  
  addModelToScene: (template, name) => {
    const sceneStore = useSceneStore.getState();
    const id = `model-${uuidv4()}`;
    const position = getRandomPosition();
    
    const modelData = {
      id,
      type: 'mesh' as const,
      name: name || template.geometryType,
      geometryType: template.geometryType,
      geometryArgs: template.geometryArgs,
      materialType: template.materialType as any,
      materialProps: template.materialProps,
      position,
      rotation: [0, 0, 0] as [number, number, number],
      scale: template.scale,
      visible: true,
      userData: {},
    };

    sceneStore.addObject(null, modelData);
  },

  getTemplatesByCategory: () => {
    const { templates } = get();
    const categories: Record<string, ModelTemplate[]> = {
      '기본 도형': [],
      '고급 도형': [],
    };

    templates.forEach(template => {
      if (['정육면체', '구', '원기둥', '평면', '원판'].includes(template.geometryType)) {
        categories['기본 도형'].push(template);
      } else {
        categories['고급 도형'].push(template);
      }
    });

    return categories;
  },
}));
