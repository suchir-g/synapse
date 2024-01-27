import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DynamicDisplay } from "./DynamicDisplay";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";

export const StudyFlashcards = () => {
  const { setID } = useParams();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [masteredCards, setMasteredCards] = useState(new Set());

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const flashcardsRef = collection(
          db,
          "flashcardSets",
          setID,
          "flashcards"
        );
        const snapshot = await getDocs(flashcardsRef);
        const fetchedFlashcards = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          performance: {
            written: { correct: 0, attempts: 0 },
            nonWritten: { correct: 0, attempts: 0 },
          },
          currentType: "multipleChoice",
        }));

        setFlashcards(fetchedFlashcards);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };

    fetchFlashcards();
  }, [setID]);

  const updateFlashcardPerformance = (flashcardId, isCorrect) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((flashcard) => {
        if (flashcard.id === flashcardId) {
          // determine current type and update performance
          let newPerformance = { ...flashcard.performance };
          if (flashcard.currentType === "written") {
            newPerformance.written.attempts++;
            if (isCorrect) newPerformance.written.correct++;
          } else {
            newPerformance.nonWritten.attempts++;
            if (isCorrect) newPerformance.nonWritten.correct++;
          }

          // update type based on the number of correct nonWritten answers
          const newType =
            newPerformance.nonWritten.correct >= 2
              ? "written"
              : "multipleChoice";

          return {
            ...flashcard,
            performance: newPerformance,
            currentType: newType,
          };
        }
        return flashcard;
      })
    );
  };

  const determineNextType = (performance) => {
    return performance.nonWritten.correct >= 3 ? "written" : "multipleChoice";
  };

  const handleAnswerSubmit = (flashcardId, isCorrect) => {
    updateFlashcardPerformance(flashcardId, isCorrect);

    // update the flashcard's performance data
    const updatedFlashcards = flashcards.map((flashcard) => {
      if (flashcard.id === flashcardId) {
        let newPerformance = { ...flashcard.performance };

        if (flashcard.currentType === "written") {
          newPerformance.written.attempts++;
          if (isCorrect) newPerformance.written.correct++;
        } else {
          // nonWritten
          newPerformance.nonWritten.attempts++;
          if (isCorrect) newPerformance.nonWritten.correct++;
        }

        return {
          ...flashcard,
          performance: newPerformance,
          currentType: determineNextType(newPerformance),
        };
      }
      return flashcard;
    });

    setFlashcards(updatedFlashcards);
  };

  const getNextFlashcardIndex = () => {
    // update mastered cards based on the latest flashcards state
    const newMasteredCards = new Set([...masteredCards]);
    flashcards.forEach((card, index) => {
      if (card.performance.correct >= 2) {
        newMasteredCards.add(index);
      }
    });
    setMasteredCards(newMasteredCards);

    // filter and sort the flashcards, excluding the mastered ones
    const filteredAndSortedFlashcards = flashcards
      .map((card, index) => ({ ...card, index }))
      .filter((card) => !newMasteredCards.has(card.index))
      .sort();

    // limit to the first 5 non-mastered flashcards
    const topFlashcards = filteredAndSortedFlashcards.slice(0, 5);

    // find the next flashcard index within the top 5
    let nextIndex = topFlashcards.findIndex(
      (card) => card.index > currentCardIndex
    );
    if (nextIndex === -1) {
      // if no higher index is found in the top 5, wrap around to the first card
      nextIndex = 0;
    }

    // return the original index of the next flashcard to show
    return topFlashcards[nextIndex].index;
  };

  const goToNextFlashcard = () => {
    const nextIndex = getNextFlashcardIndex();
    setCurrentCardIndex(nextIndex);
    console.log(flashcards);
  };

  if (!flashcards.length || flashcards.length <= currentCardIndex) {
    return <div>Loading flashcards...</div>;
  }

  return (
    <div>
      <h1>Study Flashcards</h1>
      {flashcards.length > 0 && currentCardIndex < flashcards.length && (
        <DynamicDisplay
          flashcard={flashcards[currentCardIndex]}
          onAnswerSubmit={handleAnswerSubmit}
          onNext={goToNextFlashcard}
          otherFlashcards={flashcards}
        />
      )}
    </div>
  );
};

export default StudyFlashcards;
