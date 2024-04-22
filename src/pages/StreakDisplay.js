import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./StreakDisplay.module.css"; // Assuming this imports your updated CSS
import streakFire from "../assets/snobg2.gif";

const StreakDisplay = ({ userData, hasRevisedToday }) => {
  const navigate = useNavigate();

  const showStreak = userData && userData.streak && hasRevisedToday;
  return (
    <div
      className={`${styles.card} ${
        hasRevisedToday ? styles.revised : styles.notRevised
      }`}
    >
      <div className={styles.welcomeMessage}>
        <p className={styles.muted}>
          You have {hasRevisedToday ? "" : "not "}revised today.
        </p>
      </div>
      <div className={styles.streakDisplay}>
        {showStreak && (
          <img src={streakFire} alt="Streak Fire" className={styles.fireGif} />
        )}
        {!showStreak && <div style={{ height: "100px" }}></div>}
        <span
          className={
            showStreak ? styles.streakCountActive : styles.streakCountInactive
          }
        >
          {userData && userData.streak !== undefined && userData.streak !== null
            ? userData.streak
            : "N/A"}
        </span>
      </div>
    </div>
  );
};

export default StreakDisplay;
