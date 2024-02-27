import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase"; // Import your Firebase configuration
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const ViewExams = ({ isAuth }) => {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [userId, setUserId] = useState(null); // To store the user's ID

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
          console.log(doc.id, " => ", doc.data());
          setUserId(doc.id); // Assuming you want to use the document ID in Firestore
        });
      } else {
        // User is signed out
        navigate("/");
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [navigate]);

  const addExam = async (userId, exam) => {
    await addDoc(collection(db, `users/${userId}/exams`), exam);
  };

  // Update an existing exam
  const updateExam = async (userId, examId, updatedExam) => {
    const examDoc = doc(db, `users/${userId}/exams`, examId);
    await updateDoc(examDoc, updatedExam);
  };

  const handleAddExam = async () => {
    // Check that both exam name and exam date are provided
    if (!examName || !examDate) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    const exam = {
      name: examName,
      date: new Date(examDate).toISOString(), // Convert to ISO string for consistency in the database
    };
    await addExam(userId, exam);
    // Clear input fields after adding
    setExamName("");
    setExamDate("");
  };

  const handleUpdateExam = async () => {
    // Check that both exam name and exam date are provided
    if (!examName || !examDate) {
      alert("Please provide both an exam name and a date.");
      return;
    }
    const updatedExam = {
      name: examName,
      date: new Date(examDate).toISOString(),
    };
    await updateExam(userId, editingExamId, updatedExam);
    // Clear editing state and input fields after updating
    setEditingExamId(null);
    setExamName("");
    setExamDate("");
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
    </div>
  );
};

export default ViewExams;
