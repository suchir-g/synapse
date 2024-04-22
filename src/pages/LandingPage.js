import React from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import AboutSynapse from "./about/AboutSynapse";
const LandingPage = () => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i < rating ? styles.filledStar : styles.emptyStar}
        />
      );
    }
    return stars;
  };
  return (
    <div className={styles.mainContent}>
      <img src="heroimage.png" className={styles.heroImage} />
      <div className={styles.heroSection}>
        <h1 className={styles.mainText}>Synapse</h1>
        <h3 className={styles.reviseText}>
          The revision platform with no distractions.
        </h3>
        <Link to="register" className={styles.signUpButton}>
          Sign Up
        </Link>
      </div>
      <div className={styles.starsSection}>
        <div className={styles.starCard}>
          <div>{renderStars(5)}</div>
          <p>
            "Excellent product, would recommend to all people studying at both
            GCSE and A-Level"
          </p>
          <p>- Arnav Maniyar</p>
        </div>
      </div>
      <div className={styles.aboutSynapse}>
        <AboutSynapse />
      </div>
      <div className={styles.jenyaCredits}>
        Logo design done by my sister Jenya Gupta (age 11)
      </div>
    </div>
  );
};

export default LandingPage;
