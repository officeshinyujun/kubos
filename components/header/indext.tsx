import styles from "./style.module.scss";
import kubosLogo from "../../assets/images/kubos_logo.svg";
import kubosLogoText from "../../assets/images/kubos_logo_text.png";
import Image from 'next/image';

export default function Header() {
    return (
        <header className={styles.container}>
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
        </header>
    );
}