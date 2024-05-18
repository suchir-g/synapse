import styles from "./AboutSynapse.module.css"
import React from "react"

import { Link } from "react-router-dom"

const AboutSynapse = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSection}>
                {/* <img></img> */}
            </div>
            <div className={styles.rightSection}>
                <h1 className={styles.mainText}>
                    About synapse
                </h1 >
                <p>
                    Synapse is a research-driven website designed to help students revise by maximising memory retention.
                    <br />
                    <br />
                    Don't worry - if that sounds too complicated and filled with buzzwords,
                    essentially all we do is do a lot of research into how the brain works, and then create revision strategies based on that.
                    <br />
                    <br />
                    For example, you might have heard of active recall - it's incredibly
                     more effective than things like rereading notes and so we have structured everything on the website 
                     to avoid these bad practices and go for things that take the same time but are more effective.
                     <br />
                    <br />

                    If you want to see all the research we have done (and the ways we have incorporated it into the website), check <Link to="https://1drv.ms/w/s!AnzR4qFMVVLAgi0dSj3CM9SVI8Vn?e=IQF5PK" className={styles.learnLink}>this link</Link>
                    <br />
                    <br />
                    Synapse was built by only me as part of an EPQ (extended project qualification). However, many people helped out and they are all credited <Link to="/credits" className={styles.learnLink}>here</Link>.
                </p>
            </div>
        </div>
    )
}

export default AboutSynapse