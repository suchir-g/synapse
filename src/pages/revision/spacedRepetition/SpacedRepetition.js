import React, { useState, useEffect } from "react";
import Flashcard from "../flashcards/Flashcard";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useParams, useNavigate } from "react-router-dom";

const SpacedRepetition = () => {
  const [cards, setCards] = useState([]);
  const [completed, setCompleted] = useState(false); // track completion of the set
  const [isLoading, setIsLoading] = useState(true);
  const { setID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcards();
  }, [setID]);

  const fetchFlashcards = async () => {
    if (!setID) return;
    setIsLoading(true);
    try {
      const setDocRef = doc(db, "flashcardSets", setID);
      const setDocSnap = await getDoc(setDocRef);

      if (setDocSnap.exists()) {
        const flashcardsQuery = query(
          collection(db, "flashcardSets", setID, "flashcards"),
          orderBy("created", "asc")
        );
        const flashcardsSnapshot = await getDocs(flashcardsQuery);
        const fetchedFlashcards = flashcardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCards(fetchedFlashcards);
      } else {
        console.error("Flashcard set not found");
      }
    } catch (error) {
      console.error("Error fetching flashcards: ", error);
    }
    setIsLoading(false);
  };

  const handleConfidence = (confidenceLevel) => {
    if (cards.length === 0) {
      setCompleted(true); // set completed to true when no cards are left
      return;
    }

    // shift the first card from the queue
    let currentCard = cards.shift();

    // if the confidence level is less than 4, calculate the delay and reinsert the card
    if (confidenceLevel < 4) {
      let delay = 2 ** confidenceLevel; // you can adjust this logic if needed
      let newIndex = Math.min(cards.length, delay - 1); // ensure the newIndex doesn't exceed the queue's length
      cards.splice(newIndex, 0, currentCard); // reinsert the card at the new index
    }
    // if the confidence level is 4, the card is not reinserted, effectively removing it from future reviews

    setCards([...cards]); // update the cards state to reflect the changes

    // check if all cards have been reviewed
    if (cards.length === 0) {
      setCompleted(true); // update the completed state to true if there are no cards left
    }
  };

  const handleRestart = () => {
    setCompleted(false); // reset completion status
    fetchFlashcards(); // refetch or reset the flashcards to their initial state
  };

  const renderCompletionScreen = () => (
    <div>
      <h2>Congratulations! You've completed the flashcard set.</h2>
      <button onClick={handleRestart}>Restart</button>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const renderFlashcards = () => (
    <div>
      <Flashcard
        key={cards[0].id}
        flashcard={cards[0]}
        isQuestionFirst={true}
      />
      {renderConfidenceButtons()}
    </div>
  );

  const renderConfidenceButtons = () => (
    <div>
      <p>How confident are you with this card?</p>
      {[1, 2, 3, 4].map((level) => (
        <button key={level} onClick={() => handleConfidence(level)}>
          {level}
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return <div>Loading flashcards...</div>;
  }

  return (
    <div>
      {completed ? (
        renderCompletionScreen()
      ) : cards.length > 0 ? (
        renderFlashcards()
      ) : (
        <p>No flashcards found.</p>
      )}
    </div>
  );
};

export default SpacedRepetition;
