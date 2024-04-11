import React from 'react'
import { Link, useNavigate } from "react-router-dom"

import styles from "./Post.module.css"

const Post = ({ isAuth }) => {
    const navigate = useNavigate()

    if (!isAuth) { navigate("/") }
    return (
        <div className={styles.mainContainer}>
            <div className={styles.title}>
                <h3>Create your own revision material</h3><p>Go to <Link className={styles.learnLink} to="/learn/flashcards">this page </Link>to learn how to effectively make flashcards/notes.</p>
            </div>
            <div className={styles.cards}>
                <div className={styles.flashcard}>
                    <Link to="/sets/post">Flashcards</Link>
                </div>
                <div className={styles.flashcard}>
                    <Link to="/notes/post">Notes</Link>
                </div>
            </div>
            <div className={styles.importContainer}>
                <button className={styles.importButton} onClick={() => { navigate("/sets/import") }}>
                    Import from Quizlet
                </button>
            </div>
        </div>
    )
}

export default Post