// GeometryFactory.tsx
import { GeometryType } from "@/types/model/GeometryType";

interface GeometryProps {
    type: GeometryType;
    args?: any[];
    
}

export default function GeometryFactory({ type, args = [] }: GeometryProps) {
    switch (type) {
        case "정육면체":
            //@ts-ignore
            return <boxGeometry args={args.length ? args : [1, 1, 1]} />;
        case "구":
            //@ts-ignore
            return <sphereGeometry args={args.length ? args : [1, 32, 32]} />;
        case "평면":
            //@ts-ignore
            return <planeGeometry args={args.length ? args : [1, 1]} />;
        case "원판":
            //@ts-ignore
            return <circleGeometry args={args.length ? args : [1, 32]} />;
        case "원기둥":
            //@ts-ignore
            return <cylinderGeometry args={args.length ? args : [1, 1, 2, 32]} />;
        case "도넛":
            //@ts-ignore
            return <torusGeometry args={args.length ? args : [1, 0.3, 16, 100]} />;
        case "꼬인 도넛":
            //@ts-ignore
            return <torusKnotGeometry args={args.length ? args : [1, 0.3, 100, 16]} />;
        case "12면체":
            //@ts-ignore
            return <dodecahedronGeometry args={args.length ? args : [1]} />;
        case "8면체":
            //@ts-ignore
            return <octahedronGeometry args={args.length ? args : [1]} />;
        case "20면체":
            //@ts-ignore
            return <icosahedronGeometry args={args.length ? args : [1]} />;
        default:
            return <boxGeometry args={[1, 1, 1]} />;
    }
}
