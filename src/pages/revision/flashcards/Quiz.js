import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

import { updateRevisionDates } from "../interleaving/updateFlashcards";

import Fuse from "fuse.js";

const Quiz = () => {
  const navigate = useNavigate();
  const { setID } = useParams();

  const [flashcards, setFlashcards] = useState([]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correct, setCorrect] = useState(0);
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [interleaving, setInterleaving] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!setID) return;
      setIsLoading(true);
      try {
        const setDocRef = doc(db, "flashcardSets", setID);
        const setDocSnap = await getDoc(setDocRef);

        if (setDocSnap.exists()) {
          const setData = setDocSnap.data();
          setOwners(setData.owners);
          setInterleaving(setData.interleaving);
        }

        const flashcardsQuery = query(
          collection(db, "flashcardSets", setID, "flashcards"),
          orderBy("created", "asc")
        );
        const flashcardsSnapshot = await getDocs(flashcardsQuery);
        const fetchedFlashcards = flashcardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcards(fetchedFlashcards);
      } catch (error) {
        console.error("Error fetching flashcards: ", error);
      }
      setIsLoading(false);
    };

    fetchFlashcards();
  }, [setID]);

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
  };

  const checkAnswer = (correctAnswer, userAnswer) => {
    if (isStrictMode) {
      return correctAnswer.toLowerCase() === userAnswer.toLowerCase(); // strict checking
    } else {
      const options = {
        includeScore: true,
      };
      const fuse = new Fuse([correctAnswer], options);
      const result = fuse.search(userAnswer);
      return result.length > 0 && result[0].score < 0.6; // relaxed checking
    }
  };

  const toggleJudgingMode = () => {
    setIsStrictMode(!isStrictMode);
  };

  const handleSubmit = () => {
    if (!userAnswer) {
      return;
    }
    const isCorrect = checkAnswer(
      flashcards[currentCardIndex].answer,
      userAnswer
    );
    if (isCorrect) {
      console.log("Correct Answer!");
      setCorrect((prevCorrect) => prevCorrect + 1);
    } else {
      console.log("Incorrect Answer.");
    }

    if (currentCardIndex >= flashcards.length - 1) {
      if (interleaving && owners.includes(auth?.currentUser?.uid)) {
        updateRevisionDates(setID, new Date().toISOString().split("T")[0])
          .then(() => {
            console.log("Revision dates updated successfully.");
          })
          .catch((error) => {
            console.error("Error updating revision dates:", error);
          });
      }
      setQuizEnded(true); // set quizEnded to true
    } else {
      // move to next question
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    }
    setUserAnswer(""); // clear the input field
  };

  const restartQuiz = () => {
    setQuizEnded(false);
    setCurrentCardIndex(0);
    setCorrect(0);
    setUserAnswer("");
    // Reset other states if necessary
  };

  const percentageCorrect =
    currentCardIndex > 0 ? (correct / currentCardIndex) * 100 : 0;

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (quizEnded) {
    return (
      <div>
        <h2>Quiz Completed</h2>
        <p>
          Your Score: {correct} / {flashcards.length}
        </p>
        <p>
          Percentage Correct: {((correct / flashcards.length) * 100).toFixed(2)}
          %
        </p>
        <button onClick={restartQuiz}>Restart Quiz</button>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Quiz</h2>
      {flashcards.length > 0 && (
        <div>
          <p>{flashcards[currentCardIndex].question}</p>
          <input
            type="text"
            value={userAnswer}
            onChange={handleAnswerChange}
            placeholder="Type your answer here"
            onKeyDown={handleEnter}
          />
          <button onClick={handleSubmit}>Submit Answer</button>
          <hr />
          <div>
            Correct Answers: {correct} / {currentCardIndex}
            <br />
            Percentage Correct: {percentageCorrect.toFixed(2)}%
          </div>
          <hr />
          <button onClick={toggleJudgingMode}>
            {isStrictMode
              ? "Switch to Relaxed Judging"
              : "Switch to Strict Judging"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
