import styles from "./AboutMe.module.css"

const AboutMe = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSection}>
                {/* <img></img> */}
            </div>
            <div className={styles.rightSection}>
                <h1 className={styles.mainText}>
                    About me!
                </h1 >
                <p>
                    Hello!
                    <br />
                    <br />
                    I am Suchir Gupta, a 16 year old aspiring software engineer hoping to study Computer Science at Imperial College London.
                    <br />
                    <br />
                    My interests include mathematics, competitive programming and problem solving in general.
                    <br />
                    <br />
                    At GCSE, I achieved straight 9s and an A in FMSQ Additional Maths. I also got highest in the school for English Literature (full marks with 160/160), English Language (152/160) and Computer Science.
                    <br /> <br/>
                    At A-Level, I am persuing Maths, Further Maths, Computer Science, Physics and an EPQ with a predicted A*A*A*A*A*.
                    <br />
                    <br />
                    I am also a black belt in Taekwondo, play drums at a grade 8 level and am interested in history.
                    <br />
                    <br />
                    If you have any queries/want to get in touch, then drop me a message anywhere (preferably on whatsapp).
                    <br />
                    I am open to any work experience/projects to work on.
                </p>
            </div>
        </div>
    )
}

export default AboutMe