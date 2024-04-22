import React, { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import styles from "./ViewTimerConfigs.module.css";
import LoadingComponent from "LoadingComponent";

const ViewTimerConfigs = () => {
  const [examConfigs, setExamConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

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
            setLoading(false)
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
    });// cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // empty dependency array ensures this effect runs only once on mount


  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.flashcard}>
        <h2 className={styles.titleText}>Timers</h2>
        <div className={styles.presets}>
          <Link to="/timers/pomodoro" className={`${styles.timerButton} ${styles.pomodoro}`}>Pomodoro timer</Link>
          <Link to="/timers/basic" className={`${styles.timerButton} ${styles.basic}`}>Basic timer</Link>
        </div>
        <hr />
        <h2 className={styles.examText}>Exam Configurations</h2>
        <div className={styles.examConfigs}>{examConfigs.length > 0 ? (
          <ul>
            {examConfigs.map((config) => (
              <li key={config.id} className={styles.timerSlot}>
                <h2 className={styles.timerName}>{config.name}</h2>
                <span>
                  <Link to={`/timers/config/edit/${config.id}`} className={styles.extraButtons}>Edit</Link>
                  <Link to="/timers/config" className={`${styles.extraButtons} ${styles.setTimer}`}>Set timer</Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No exam configurations found.</p>
        )}</div>
        <Link to="/timers/config/post" className={styles.createConfigButton}>Create config</Link>
      </div>
    </div>
  );
};

export default ViewTimerConfigs;
