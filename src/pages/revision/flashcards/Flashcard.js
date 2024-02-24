import React, { useState } from "react";
import { sanitizeHTML } from "../../../utilities";
import "../../../css/revision/flashcards/Flashcard.css"; // import CSS for styling

const Flashcard = ({ flashcard, isQuestionFirst, size }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const defaultSize = { width: "300px", height: "200px" }; // Default size

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Calculate the card size
  const cardStyle = {
    width: size && size.width ? size.width : defaultSize.width,
    height: size && size.height ? size.height : defaultSize.height,
    // Add other styles if necessary
  };

  return (
    <div className="card-container" style={cardStyle}>
      <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={flipCard}>
        <div className="front">
          <div
            dangerouslySetInnerHTML={sanitizeHTML(
              isQuestionFirst ? flashcard.question : flashcard.answer
            )}
          />
        </div>
        <div className="back">
          <div
            dangerouslySetInnerHTML={sanitizeHTML(
              isQuestionFirst ? flashcard.answer : flashcard.question
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
