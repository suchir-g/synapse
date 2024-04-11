
import { Link } from "react-router-dom"
import styles from "./Footer.module.css"
export function Footer() {

    return (
        <div className={styles.mainContainer}>
            <ul className={styles.aboutUs}>
                <li className={`${styles.header} ${styles.item}`}>
                    About us
                </li>
                <Link to="/aboutus">
                    <li className={styles.item}>
                        About Synapse
                    </li>
                </Link>
                <Link to="/aboutme">
                    <li className={styles.item}>
                        About Me
                    </li >
                </Link>
                <Link to="https://github.com/suchir-g/synapse">
                    <li className={styles.item}>
                        Documentation
                    </li>
                </Link>
            </ul>
            <ul className={styles.contactUs}>
                <li className={`${styles.header} ${styles.item}`}>
                    Contact Us
                </li>
                <li className={styles.item}>
                    Email
                </li>
                <Link to="https://www.linkedin.com/in/suchirgpta/">
                    <li className={styles.item}>
                        LinkedIn
                    </li>
                </Link>
                <li className={styles.item}>
                    Phone
                </li>
            </ul>
            <ul className={styles.resources}>
                <li className={`${styles.header} ${styles.item}`}>
                    Resources
                </li>
                <Link to="/toptips">
                    <li className={styles.item}>
                        How to revise
                    </li>
                </Link>
                <li className={styles.item}>
                    Revision resources
                </li>
                <Link to="/research">
                    <li className={styles.item}>
                        Study Research
                    </li>
                </Link>
                <li className={styles.item}>
                    Other tools
                </li>
            </ul>
            <ul className={styles.supporters}>
                <li className={`${styles.header} ${styles.item}`}>
                    Supporters
                </li>
                <li className={styles.item}>
                    Maniyar
                </li>
            </ul>
        </div >
    )
}