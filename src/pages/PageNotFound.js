import styles from "./PageNotFound.module.css"

const PageNotFound = () => {
    return (
        <div className={styles.mainContainer}>
            <h1 className={styles.mainText}>404</h1>
            <p className={styles.muted}>What are you doing</p>
        </div>
    )
}

export default PageNotFound