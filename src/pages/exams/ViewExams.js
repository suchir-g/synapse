import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import styles from "./ViewExams.module.css";

const ViewExams = ({ isAuth }) => {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [exams, setExams] = useState([]);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  if (!isAuth) {
    navigate("/");
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("userID", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUserId(doc.id);
          fetchExams(doc.id);
        });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchExams = async (userId) => {
    const examsCollection = collection(db, `users/${userId}/exams`);
    const examSnapshot = await getDocs(examsCollection);
    const examsList = examSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExams(examsList);
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      const date = timestamp.toDate();
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    } else {
      return "Invalid Date";
    }
  };

  const isFutureDate = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    return targetDate > today;
  };

  const deleteExam = async (userId, examId) => {
    await deleteDoc(doc(db, `users/${userId}/exams`, examId));
    fetchExams(userId);
  };

  const handleAddExam = async () => {
    if (!examName || !examDate) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    if (!isFutureDate(examDate)) {
      alert("Please enter a future date for the exam.");
      return;
    }
    const exam = {
      name: examName,
      date: Timestamp.fromDate(new Date(examDate)),
    };
    await addDoc(collection(db, `users/${userId}/exams`), exam);
    fetchExams(userId);
    setExamName("");
    setExamDate("");
  };

  const handleUpdateExam = async () => {
    if (!examName || !examDate || !editingExamId) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    if (!isFutureDate(examDate)) {
      alert("Please enter a future date for the exam.");
      return;
    }
    const updatedExam = {
      name: examName,
      date: Timestamp.fromDate(new Date(examDate)),
    };
    await updateDoc(
      doc(db, `users/${userId}/exams`, editingExamId),
      updatedExam
    );
    fetchExams(userId);
    setEditingExamId(null);
    setExamName("");
    setExamDate("");
  };

  const handleEditExam = (examId) => {
    const exam = exams.find((exam) => exam.id === examId);
    setEditingExamId(examId);
    setExamName(exam.name);
    if (exam.date && exam.date.toDate) {
      setExamDate(exam.date.toDate().toISOString().split("T")[0]);
    } else {
      console.error("Invalid exam date", exam.date);
      setExamDate("");
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Exams</h1>
      </div>
      <div className={styles.mainContent}>
        <ul>
          {exams.map((exam) => (
            <li key={exam.id} className={styles.exam}>
              {exam.name} - {formatDate(exam.date)}
              <span>
                <button
                  className={styles.button}
                  onClick={() => handleEditExam(exam.id)}
                >
                  Edit
                </button>
                <button
                  className={styles.button}
                  onClick={() => deleteExam(userId, exam.id)}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>

        <span className={styles.inputGroup}>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Exam Name"
            className={styles.input}
          />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            placeholder="Exam Date"
            className={styles.input}
          />
        </span>
        {editingExamId ? (
          <button
            onClick={handleUpdateExam}
            className={`${styles.button} ${styles.updateAdd}`}
          >
            Update Exam
          </button>
        ) : (
          <button
            onClick={handleAddExam}
            className={`${styles.button} ${styles.updateAdd}`}
          >
            Add Exam
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewExams;
