import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import styles from "./StreakDisplay.module.css"; 
import streakFire from "../assets/snobg2.gif";

const StreakDisplay = ({ userData, hasRevisedToday }) => {
  const navigate = useNavigate();

  const showStreak = userData && userData.streak && hasRevisedToday;

  return (
    <div className={styles.card}>
      <div className={styles.welcomeMessage}>
        <p className={styles.muted}>
          You have {hasRevisedToday ? "" : "not "}revised today.
        </p>
      </div>

      <div className={styles.streakDisplay}>
        {showStreak ? (
          <img src={streakFire} alt="Streak Fire" className={styles.fireGif} />
        ) : (
          <FontAwesomeIcon icon={faFire} className={styles.fireInactive} />
        )}
        <span
          className={
            showStreak ? styles.streakCountActive : styles.streakCountInactive
          }
        >
          {userData ? userData.streak : 0}
        </span>
      </div>
    </div>
  );
};

export default StreakDisplay;
