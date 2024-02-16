import React, { useState, useEffect } from "react";

const PomodoroTimer = () => {
  const workDuration = 25 * 60; // 25 minutes
  const breakDuration = 5 * 60; // 5 minutes
  const [secondsLeft, setSecondsLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(workDuration);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const timeLeft = duration - elapsed;
        if (timeLeft <= 0) {
          clearInterval(interval);
          // switch mode and reset timer
          setIsWorkTime(!isWorkTime);
          setDuration(isWorkTime ? breakDuration : workDuration);
          setSecondsLeft(isWorkTime ? breakDuration : workDuration);
          setStartTime(Date.now());
        } else {
          setSecondsLeft(timeLeft);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime, duration, isWorkTime]);

  const toggleIsActive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setStartTime(Date.now());
      setDuration(secondsLeft);
    }
  };

  const reset = () => {
    setIsActive(false);
    setIsWorkTime(true);
    setSecondsLeft(workDuration);
    setDuration(workDuration);
    setStartTime(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // update the document title
  useEffect(() => {
    document.title = `${isWorkTime ? "Work" : "Break"} Time: ${formatTime(
      secondsLeft
    )}`;
  }, [secondsLeft, isWorkTime]);

  return (
    <div>
      <h2>Pomodoro Timer</h2>
      <p>
        {isWorkTime ? "Work Time" : "Break Time"}: {formatTime(secondsLeft)}
      </p>
      <button onClick={toggleIsActive}>{isActive ? "Pause" : "Start"}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default PomodoroTimer;
