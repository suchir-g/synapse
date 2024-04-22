import styles from "./PageNotFound.module.css"
import React from "react"
import { Link } from "react-router-dom"

const PageNotFound = () => {
    return (
        <div className={styles.mainContainer}>
            <h1 className={styles.mainText}>404</h1>
            <p className={styles.muted}>You seem a bit lost. Click <Link to="/" className={styles.link}>this</Link> to go home.</p>
        </div>
    )
}

export default PageNotFound