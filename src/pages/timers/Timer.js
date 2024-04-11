import React, { useState, useEffect } from "react";
import styles from "./Timer.module.css";

const Timer = ({
  duration,
  title,
  onTimerFinish,
  isTimerRunning,
  onTimerStart,
}) => {
  const [endTime, setEndTime] = useState(null);
  const [isActive, setIsActive] = useState(isTimerRunning);
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    // this effect resets the timer when the duration changes.
    setTimeLeft(duration * 60);
    setEndTime(null);
    setIsActive(isTimerRunning);
    // if the timer is supposed to be running, restart it with the new duration.
    if (isTimerRunning) {
      setEndTime(Date.now() + duration * 60 * 1000);
    }
  }, [duration, isTimerRunning]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const updatedTimeLeft = Math.round((endTime - now) / 1000);

        if (updatedTimeLeft <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          onTimerFinish();
          setIsActive(false);
        } else {
          setTimeLeft(updatedTimeLeft);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, endTime, onTimerFinish]);

  useEffect(() => {
    // update the document title with the timer status
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (title) {
      document.title = `${title} - ${minutes}:${seconds < 10 ? `0${seconds}` : seconds
        }`;
    }
  }, [timeLeft, title]);

  const startTimer = () => {
    setIsActive(true);
    if (onTimerStart) onTimerStart();
    setEndTime(Date.now() + timeLeft * 1000);
  };

  const pauseTimer = () => {
    setIsActive(false);
    setEndTime(null); // save the remaining time to start from there later
  };

  const resetTimer = () => {
    setTimeLeft(duration * 60);
    setIsActive(false);
    setEndTime(null);
  };

  return (
    <div className={styles.mainContainer}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.timeLeft}>{`${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60
        }`}</div>
      <span>
        <button
          onClick={startTimer}
          disabled={isActive}
          className={styles.button}
        >
          Start
        </button>
        <button
          onClick={pauseTimer}
          disabled={!isActive}
          className={styles.button}
        >
          Pause
        </button>
        <button onClick={resetTimer} className={styles.button}>
          Reset
        </button>
      </span>
    </div>
  );
};

export default Timer;
