import React, { useState, useEffect } from "react";

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
    if (isActive) {
      // set the end time based on the current time plus the remaining time
      if (!endTime) {
        setEndTime(Date.now() + timeLeft * 1000);
      }

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
    } else {
      // reset the end time when the timer is not active
      setEndTime(null);
    }
  }, [isActive, endTime, timeLeft, onTimerFinish]);

  useEffect(() => {
    // automatically start or stop the timer based on isTimerRunning prop changes
    setIsActive(isTimerRunning);
  }, [isTimerRunning]);

  useEffect(() => {
    // update the document title with the timer status
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `${title} - ${minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  }, [timeLeft, title]);

  const startTimer = () => {
    setIsActive(true);
    onTimerStart();
    if (!endTime) {
      // calculate and set the end time if not already set
      setEndTime(Date.now() + timeLeft * 1000);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    // adjust the endTime to null to ensure it recalculates when resumed
    setEndTime(null);
  };

  const resetTimer = () => {
    setTimeLeft(duration * 60);
    setIsActive(false);
    setEndTime(null);
  };

  return (
    <div>
      <h3>{title}</h3>
      <div>{`${Math.floor(timeLeft / 60)}:${
        timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60
      }`}</div>
      <button onClick={startTimer} disabled={isActive}>
        Start
      </button>
      <button onClick={pauseTimer} disabled={!isActive}>
        Pause
      </button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default Timer;
