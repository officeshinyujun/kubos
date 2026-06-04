import styles from "./style.module.scss";
import kubosLogo from "@/assets/images/kubos_logo.svg";
import kubosLogoText from "@/assets/images/kubos_logo_text.png";
import Image from 'next/image';
import { HStack } from "@/components/general/HStack";

export default function Header() {
    return (
        <HStack as="header" className={styles.container} fullWidth justify="between" align="center" gap={12}>
            <HStack gap={12} align="center">
                <Image 
                src={kubosLogo}
                alt="Kubos Logo"
                width={45}
                height={45}
                
            />
            <Image 
                src={kubosLogoText}
                alt="Kubos Logo Text"
                width={87}
            />
            </HStack>
            <div className={styles.userProfile}/>
        </HStack>
    );
}
