import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Timer from "./Timer";
import styles from "./CompactTimerPage.module.css";

const CompactTimerPage = () => {
  const [timerConfigs, setTimerConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [duration, setDuration] = useState(25); // Default duration for Pomodoro
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [configName, setConfigName] = useState("Custom");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is sidgned in, fetch timer configurations
        const fetchTimerConfigs = async () => {
          const q = query(
            collection(db, "examConfigs"),
            where("owner", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const configs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTimerConfigs(configs);
        };

        fetchTimerConfigs();
      } else {
        // User is signed out, clear configs
        setTimerConfigs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleConfigChange = (e) => {
    const configId = e.target.value;
    setSelectedConfigId(configId);

    // Find the selected config
    const selectedConfig = timerConfigs.find(
      (config) => config.id === configId
    );

    if (selectedConfig && selectedConfig.sections.length > 0) {
      // Set the new duration and reset the timer
      setDuration(selectedConfig.sections[0].duration);
      setConfigName(selectedConfig.name);
      setIsTimerRunning(false); // Reset the timer to not be running
    } else {
      // Fallback duration if no sections are found or if 'Custom' is selected
      setDuration(25);
      setIsTimerRunning(false);
    }
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}> Timer</h2>
      <select
        className={styles.input}
        value={selectedConfigId}
        onChange={handleConfigChange}
      >
        <option value="" className={styles.selectOption}>
          Select Timer Config
        </option>
        {timerConfigs.map((config) => (
          <option
            key={config.id}
            value={config.id}
            className={styles.selectOption}
          >
            {config.name}
          </option>
        ))}
        <option value="custom" className={styles.selectOption}>
          Custom
        </option>
      </select>
      <br />
      {selectedConfigId === "custom" && (
        <>
          <label className={styles.label}>
            Duration (minutes):
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              className={styles.input}
            />
          </label>
          <br />
        </>
      )}
      <Timer
        duration={duration}
        isTimerRunning={isTimerRunning}
        onTimerFinish={() => setIsTimerRunning(false)}
        onTimerStart={() => {}} // Timer start logic is now handled by config change
      />
    </div>
  );
};

export default CompactTimerPage;
