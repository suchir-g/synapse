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
import { auth, db } from "../../config/firebase"; // import your Firebase configuration
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const ViewExams = ({ isAuth }) => {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [exams, setExams] = useState([]); // Store exams here
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
          setUserId(doc.id); // set the user ID
          fetchExams(doc.id); // fetch exams whenever the user ID is set
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
      const date = timestamp.toDate(); // convert Firestore Timestamp to JavaScript Date
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    } else {
      return "Invalid Date";
    }
  };

  const deleteExam = async (userId, examId) => {
    await deleteDoc(doc(db, `users/${userId}/exams`, examId));
    fetchExams(userId); // refresh the exams list after deletion
  };

  // define the handleAddExam function
  const handleAddExam = async () => {
    if (!examName || !examDate) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    const exam = {
      name: examName,
      date: Timestamp.fromDate(new Date(examDate)), // convert to Firestore Timestamp
    };
    await addDoc(collection(db, `users/${userId}/exams`), exam);
    fetchExams(userId); // refresh exams list after adding
    setExamName("");
    setExamDate("");
  };

  // define the handleUpdateExam function
  const handleUpdateExam = async () => {
    if (!examName || !examDate || !editingExamId) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    const updatedExam = {
      name: examName,
      date: Timestamp.fromDate(new Date(examDate)), // convert to Firestore Timestamp
    };
    await updateDoc(
      doc(db, `users/${userId}/exams`, editingExamId),
      updatedExam
    );
    fetchExams(userId); // refresh exams list after updating
    setEditingExamId(null);
    setExamName("");
    setExamDate("");
  };

  const handleEditExam = (examId) => {
    const exam = exams.find((exam) => exam.id === examId);
    setEditingExamId(examId);
    setExamName(exam.name);

    // ensure exam.date is a Firestore Timestamp before converting
    if (exam.date && exam.date.toDate) {
      setExamDate(exam.date.toDate().toISOString().split("T")[0]); // convert to 'YYYY-MM-DD'
    } else {
      console.error("Invalid exam date", exam.date);
      setExamDate(""); // reset the date if invalid
    }
  };

  return (
    <div>
      <input
        type="text"
        value={examName}
        onChange={(e) => setExamName(e.target.value)}
        placeholder="Exam Name"
      />
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        placeholder="Exam Date"
      />
      {editingExamId ? (
        <button onClick={handleUpdateExam}>Update Exam</button>
      ) : (
        <button onClick={handleAddExam}>Add Exam</button>
      )}

      <ul>
        {exams.map((exam) => (
          <li key={exam.id}>
            {exam.name} - {formatDate(exam.date)}
            <button onClick={() => handleEditExam(exam.id)}>Edit</button>
            <button onClick={() => deleteExam(userId, exam.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewExams;
