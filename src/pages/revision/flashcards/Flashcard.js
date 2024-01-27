import React, { useState } from "react";
import { sanitizeHTML } from "../../../utilities";
import "../../../css/revision/flashcards/Flashcard.css"; // import CSS for styling

const Flashcard = ({ flashcard, isQuestionFirst}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="card-container">
      <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={flipCard}>
        <div className="front">
          <div dangerouslySetInnerHTML={sanitizeHTML(isQuestionFirst ? flashcard.question : flashcard.answer)} />
        </div>
        <div className="back">
          <div dangerouslySetInnerHTML={sanitizeHTML(isQuestionFirst ? flashcard.answer : flashcard.question)} />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
