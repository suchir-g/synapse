import React, { useEffect, useState } from "react";
import { auth, db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import Flashcard from "./Flashcard";
import { useNavigate, useParams } from "react-router-dom";
import { updateRevisionDates } from "../interleaving/updateFlashcards";
import { updateStreak } from "../../../UpdateStreak";

import styles from "./SimpleDisplay.module.css"

const SimpleDisplay = () => {
  const history = useNavigate();
  const { setID } = useParams();

  const [flashcards, setFlashcards] = useState([]);
  const [originalFlashcards, setOriginalFlashcards] = useState([]); // to store the original order
  const [owner, setOwner] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [interleaving, setInterleaving] = useState(false); // state to track the mode

  const [isQuestionFirst, setIsQuestionFirst] = useState(true);
  const [isRandomMode, setIsRandomMode] = useState(false); // state to track the mode

  const [isCompleted, setIsCompleted] = useState(false);

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]; // this basically swaps the 2 indexes using array unpacking
    }
    return array;
  };

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!setID) return;
      setIsLoading(true);
      try {
        // fetch the flashcard set document to get the interleaving setting
        const setDocRef = doc(db, "flashcardSets", setID);
        const setDocSnap = await getDoc(setDocRef);

        if (setDocSnap.exists()) {
          const setData = setDocSnap.data();
          setOwner(setData.owners);
          const interleavingSetting = setData.interleaving;

          // fetch the flashcards
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
          setOriginalFlashcards(fetchedFlashcards); // store the original order
          setInterleaving(interleavingSetting);
        } else {
          console.error("Flashcard set not found");
        }
      } catch (error) {
        console.error("Error fetching flashcards and settings: ", error);
      }
      setIsLoading(false);
    };

    fetchFlashcards();
  }, [setID]);

  const handlePrev = () => {
    setIsCompleted(false);
    setCurrentCardIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0)); //minuses one or sets it to 0 depending on the value of it
  };

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => {
      if (prevIndex < flashcards.length - 1) {
        return prevIndex + 1;
      } else {
        if (interleaving && owner.includes(auth?.currentUser?.uid)) {
          updateRevisionDates(setID, new Date().toISOString().split("T")[0])
            .then(() => {
              console.log("Revision dates updated successfully.");
            })
            .catch((error) => {
              console.error("Error updating revision dates:", error);
            });
        }
        updateStreak(auth?.currentUser?.uid);
        setIsCompleted(true); // set completion to true when the last card is reached
        return prevIndex;
      }
    });
  };

  const restartFlashcards = () => {
    setCurrentCardIndex(0);
    setIsCompleted(false); // reset the completion status
  };

  const toggleFlipMode = () => {
    setIsQuestionFirst(!isQuestionFirst);
  };

  const toggleMode = () => {
    setIsRandomMode(!isRandomMode);
    setFlashcards(
      isRandomMode ? originalFlashcards : shuffleArray([...originalFlashcards])
    );
    setCurrentCardIndex(0); // restart from the first flashcard
  };

  const navigateToSet = () => {
    history(-1); // goes back to where they came from
  };

  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isCompleted) {
    return (
      <div className={styles.endContainer}>
        <div className={styles.endText}>Finished!</div>
        <div className={styles.finished}>
          <button
            onClick={handlePrev}
            className={`${styles.arrowButton} ${styles.backEnd}`}
          >
            {"<"}
          </button>
          <div className={styles.flashcard}>
            <div className={styles.wellDone}>
              Well done! You've reached the end of the set.
            </div>
            <span>
              <button onClick={restartFlashcards} className={`${styles.endButton} ${styles.restartFlashcards}`}>
                Start Again
              </button>
              <button onClick={navigateToSet} className={styles.endButton}>
                Back to set
              </button>
            </span>
          </div>
          <div className={styles.dummy}></div>
        </div>
        <div className={styles.bottomSection}>
          <button onClick={toggleFlipMode} className={styles.toggleButton}>
            Toggle Flip Mode
          </button>
          <button onClick={toggleMode} className={styles.toggleButton}>
            {isRandomMode ? "Ordered Mode" : "Random Mode"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.progressText}>Progress: {progress.toFixed(0)}%</div>
      <div className={styles.mainSection}>
        <button onClick={handlePrev} className={styles.arrowButton}>{"<"}</button>
        {flashcards.length > 0 && (
          <Flashcard
            key={flashcards[currentCardIndex].id}
            flashcard={flashcards[currentCardIndex]}
            isQuestionFirst={isQuestionFirst}
            size={{ width: "1000px", height: "60vh" }}
          />
        )}
        <button onClick={handleNext} className={styles.arrowButton}>{">"}</button>
      </div>
      <div className={styles.bottomSection}>
        <button onClick={toggleFlipMode} className={styles.toggleButton}>Toggle Flip Mode</button>
        <button onClick={toggleMode} className={styles.toggleButton}>
          {isRandomMode ? "Ordered Mode" : "Random Mode"}
        </button>
      </div>
    </div>
  );
};

export default SimpleDisplay;
