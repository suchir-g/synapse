import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

import styles from "./ExamCountdown.module.css";

const ExamCountdown = () => {
  const [daysUntilNextExam, setDaysUntilNextExam] = useState("");
  const [nextExamTitle, setNextExamTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up auth state changed listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in, fetching user document", user.uid);
        fetchUserDocument(user.uid);
      } else {
        console.log("User is not signed in");
        navigate("/login"); // Redirect to login if not signed in
      }
    });

    return () => {
      console.log("Cleaning up auth state changed listener");
      unsubscribe();
    };
  }, [navigate]);

  const fetchUserDocument = async (uid) => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("userID", "==", uid));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming each UID corresponds to exactly one user document
        const userDoc = querySnapshot.docs[0];
        console.log("User document found:", userDoc.id);
        fetchNextExam(userDoc.id);
      } else {
        console.log("No user document found for this UID:", uid);
      }
    } catch (error) {
      console.error("Error fetching user document:", error);
    }
  };

  const fetchNextExam = async (userId) => {
    console.log("Fetching exams for user document ID:", userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize today's date
    console.log("Today's date (normalized):", today);

    const examsCollection = collection(db, `users/${userId}/exams`);
    const q = query(examsCollection, orderBy("date"), limit(1));

    try {
      const examSnapshot = await getDocs(q);
      console.log(examSnapshot);
      if (examSnapshot.empty) {
        console.log("No upcoming exams found");
        setDaysUntilNextExam("No upcoming exams");
        return;
      }

      const nextExam = examSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];

      console.log("Next exam found:", nextExam);

      if (nextExam && nextExam.date) {
        const nextExamDate = nextExam.date.toDate(); // Convert Firestore Timestamp to JS Date
        setNextExamTitle(nextExam.name || "Untitled Exam");
        console.log("Next exam date:", nextExamDate);

        const differenceInTime = nextExamDate.getTime() - today.getTime();
        const differenceInDays = Math.ceil(
          differenceInTime / (1000 * 3600 * 24)
        );
        console.log("Days until next exam:", differenceInDays);
        setDaysUntilNextExam(differenceInDays);
      }
    } catch (error) {
      console.error("Error fetching next exam:", error);
    }
  };

  const getShadowColor = () => {
    if (daysUntilNextExam === "") return ""; // No data yet
    const days = parseInt(daysUntilNextExam);
    if (days <= 10) {
      return "rgba(255, 0, 0, 0.7)"; // Red shadow for 10 days or less
    } else if (days <= 30) {
      return "rgba(255, 165, 0, 0.7)"; // Orange shadow for 30 days or less
    } else {
      return "transparent"; // No shadow otherwise
    }
  };

  const cardStyle = {
    "--card-shadow-color": getShadowColor(),
  };

  return (
    <div className={styles.card} style={cardStyle}>
      <h3 className={styles.title}>
        Days until {nextExamTitle || "Next Exam"}:
      </h3>
      <div className={styles.timerDisplay}>
        {daysUntilNextExam !== "" ? daysUntilNextExam : "Loading..."}
      </div>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => navigate("/exams")}>
          Edit Exams
        </button>
        {/* Add more buttons here if needed */}
      </div>
    </div>
  );
};

export default ExamCountdown;
