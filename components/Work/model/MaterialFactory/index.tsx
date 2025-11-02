// MaterialFactory.tsx
import { MaterialType } from "@/types/model/MaterialType";
import { Texture } from "three";

interface MaterialProps {
  type: MaterialType;
  color?: string;
  metalness?: number; // standard / physical
  roughness?: number; // standard / physical
  shininess?: number; // phong
  matcap?: Texture;   // matcap
  transparent?: boolean;
  opacity?: number;
}

export default function MaterialFactory({
  type,
  color = "#ffffff",
  metalness = 0,
  roughness = 1,
  shininess = 30,
  matcap,
  transparent = false,
  opacity = 1,
}: MaterialProps) {
  switch (type) {
    case "basic":
      return <meshBasicMaterial color={color} transparent={transparent} opacity={opacity} />;
    case "standard":
      return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} transparent={transparent} opacity={opacity} />;
    case "physical":
      return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} transparent={transparent} opacity={opacity} />;
    case "lambert":
      return <meshLambertMaterial color={color} transparent={transparent} opacity={opacity} />;
    case "phong":
      return <meshPhongMaterial color={color} shininess={shininess} transparent={transparent} opacity={opacity} />;
    case "toon":
      return <meshToonMaterial color={color} transparent={transparent} opacity={opacity} />;
    case "normal":
      return <meshNormalMaterial transparent={transparent} opacity={opacity} />;
    case "depth":
      return <meshDepthMaterial transparent={transparent} opacity={opacity} />;
    case "matcap":
      return <meshMatcapMaterial matcap={matcap} transparent={transparent} opacity={opacity} />;
    default:
      return <meshStandardMaterial color={color} />;
  }
}
