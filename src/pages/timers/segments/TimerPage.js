import React, { useState, useEffect } from "react";
import Timer from "../Timer"; // adjust the import path as necessary
import styles from "./TimerPage.module.css"

const TimerPage = () => {
  const [title, setTitle] = useState("My Timer");
  const [duration, setDuration] = useState(5); // duration in minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleTimerStart = () => {
    setIsTimerRunning(true);
  };

  const handleTimerFinish = () => {
    setIsTimerRunning(false);
    alert("Timer finished!");
  };

  // when the duration changes, we want to stop the timer
  useEffect(() => {
    setIsTimerRunning(false);
  }, [duration]);

  const handleDurationChange = (e) => {
    const inputDuration = parseFloat(e.target.value);
    setDuration(Math.round(inputDuration)); // round to the nearest minute
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const resetTimer = () => {
    // to reset the timer, we change the duration which will trigger useEffect to stop the timer
    setDuration((prevDuration) => (prevDuration !== 0 ? prevDuration : 5));
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainSection}>
        <h2 className={styles.setTimerText}>Set Timer</h2>
        <div className={styles.formGroup}>
          <label className={styles.muted}>
            Title:
          </label>
          <input type="text" value={title} onChange={handleTitleChange} className={`${styles.input}`} />
        </div>
        <br />
        <div className={styles.formGroup}>
          <label className={styles.muted}>
            Duration (minutes):
          </label>
          <input type="number" value={duration} onChange={handleDurationChange} className={`${styles.input}`} />
        </div>
        <br />
        <Timer
          key={duration} // using duration as a key to remount Timer when it changes
          title={title}
          duration={duration}
          isTimerRunning={isTimerRunning}
          onTimerStart={handleTimerStart}
          onTimerFinish={handleTimerFinish}
        />
      </div>
    </div>
  );
};

export default TimerPage;
