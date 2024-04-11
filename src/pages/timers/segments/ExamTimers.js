import React, { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Timer from "../Timer"; // Your Timer component
import MyStuffLoadingComponent from "../../mystuff/MyStuffLoadingComponent"

import styles from "./ExamTimers.module.css"
import LoadingComponent from "LoadingComponent";

const ExamTimers = () => {
  const [examConfigs, setExamConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mode, setMode] = useState("sequential"); // 'sequential' for 'segmented'
  const [autoStart, setAutoStart] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // user is signed in, fetch examConfigs
        const fetchExamConfigs = async () => {
          try {
            const q = query(
              collection(db, "examConfigs"),
              where("owner", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const configs = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExamConfigs(configs);
          } catch (error) {
            console.error("Error fetching exam configs: ", error);
            // handle the errsor state as appropriately
          }
        };

        fetchExamConfigs();
      } else {
        // user is signed out
        setExamConfigs([]); // clear configs or handle as needed
      }
    });

    // cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // empty dependency array ensures this effect runs only once on mount


  useEffect(() => {
    const fetchSelectedConfig = async () => {
      if (selectedConfigId) {
        setLoading(true);
        try {
          const docRef = doc(db, "examConfigs", selectedConfigId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setSelectedConfig({ id: docSnap.id, ...docSnap.data() });
            // reset the timer state when a new config is selected
            setCurrentSectionIndex(0);
            setIsTimerRunning(false);
          } else {
            console.log("No such document!");
            setSelectedConfig(null);
          }
        } catch (error) {
          console.error("Error fetching selected config: ", error);
        }
        setLoading(false);
      }
    };

    fetchSelectedConfig();
  }, [selectedConfigId, auth.currentUser]);

  const handleConfigChange = (event) => {
    setCurrentSectionIndex(0);
    setIsTimerRunning(false);
    const configId = event.target.value;
    setSelectedConfigId(configId);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const toggleMode = () => {
    setMode(mode === "sequential" ? "segmented" : "sequential");
    setCurrentSectionIndex(0);
    setIsTimerRunning(false);
  };

  const renderTimers = () => {
    if (!selectedConfig || selectedConfig.sections.length === 0) {
      return <p>No sections available.</p>;
    }

    // if in "segmented" mode, return all timers at once
    if (mode === "segmented") {
      return selectedConfig.sections.map((section, index) => (
        <Timer
          key={`${selectedConfigId}-${index}`} // use a combination of config ID and index as key
          duration={section.duration}
          title={section.title}
          onTimerFinish={() => { }}
          isTimerRunning={isTimerRunning}
          onTimerStart={startTimer}
        />
      ));
    }

    // if in "sequential" mode, only return the current section's timer
    const currentSection = selectedConfig.sections[currentSectionIndex];
    return (
      <Timer
        key={selectedConfigId} // use config ID as key
        duration={currentSection.duration}
        title={currentSection.title}
        onTimerFinish={moveToNextSection}
        isTimerRunning={isTimerRunning}
        onTimerStart={startTimer}
      />
    );
  };

  const moveToNextSection = () => {
    if (currentSectionIndex < selectedConfig.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      if (autoStart) {
        // automatically start the next timer if autoStart is true
        setIsTimerRunning(true);
      }
    } else {
      alert("You have completed all sections of the exam.");
      setIsTimerRunning(false); // ensure the timer is stopped at the end
    }
  };

  // function to toggle auto-start feature
  const toggleAutoStart = () => {
    setAutoStart(!autoStart);
  };

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h2 className={styles.mainText}>Select an Exam Configuration</h2>

        {loading ? (
          <p>Loading configurations...</p>
        ) : (
          <select value={selectedConfigId} onChange={handleConfigChange} className={styles.selectDropdown}>
            {/* disabled default option here */}
            <option value="" disabled>
              Select config here
            </option>
            {examConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        )}
        <br />

        <button onClick={toggleMode} className={styles.button}>
          Switch to {mode === "sequential" ? "Segmented" : "Sequential"} Mode
        </button>
        <button onClick={toggleAutoStart} className={styles.button}>
          {autoStart ? "Disable" : "Enable"} Auto-Start Next Timer
        </button>

        {loading && <MyStuffLoadingComponent flexSize={true}/>}

        {selectedConfig && (
          <div>
            {renderTimers()}
            {mode === "sequential" &&
              !isTimerRunning &&
              currentSectionIndex < selectedConfig.sections.length - 1 && (
                <button onClick={moveToNextSection} className={`${styles.button} ${styles.nextSection}`}>Next Section</button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTimers;
