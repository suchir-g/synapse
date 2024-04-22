import styles from "./AboutMe.module.css";
import React from "react";

const AboutMe = () => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftSection}>
        <img src="./image.png" alt="Me (suchir gupta) at Senior Prizegiving" />
      </div>
      <div className={styles.rightSection}>
        <h1 className={styles.mainText}>About me!</h1>
        <p>
          Hello!
          <br />
          <br />
          I am Suchir Gupta, a 16 year old aspiring software engineer hoping to
          study Computer Science at Imperial College London. I go to Heckmondwike Grammar School, and I have studied there for the past 6 years.
          <br />
          <br />
          My interests include mathematics, competitive programming and problem
          solving in general.
          <br />
          <br />
          At GCSE, I achieved straight 9s and an A in FMSQ Additional Maths. I
          also got highest in the school for English Literature (full marks with
          160/160), English Language (152/160) and Computer Science (169/180). I
          also achieved second highest in the school for Religious Studies.
          <br /> <br />
          At A-Level, I am persuing Maths, Further Maths, Computer Science,
          Physics and an EPQ with a predicted A*A*A*A*A* (and currently working at those grades).
          <br />
          <br /> This year, I achieved a Gold in the Senior Maths Challenge, a
          top 5% score in the British Informatics Olympiad and was awarded
          "flight status" in the Astro Pi challenge (meaning my code will run on
          the ISS).
          <br />
          <br />
          I am also a black belt in Taekwondo, play drums at a grade 8 level and
          am interested in history.
          <br />
          <br />
          If you have any queries/want to get in touch, then drop me a message
          anywhere (preferably on LinkedIn).
          <br />I am open to any work experience/projects to work on.
        </p>
      </div>
    </div>
  );
};

export default AboutMe;
