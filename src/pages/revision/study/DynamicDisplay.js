import React, { useState, useEffect } from "react";
import { getMCQOptions } from "./MCQGenerator";
import { sanitizeHTML } from "../../../utilities";
import Fuse from "fuse.js";
import "../../../css/revision/study/DynamicDisplay.css"

export const DynamicDisplay = ({
  flashcard,
  onAnswerSubmit,
  otherFlashcards,
  onNext,
}) => {
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [mcqOptions, setMcqOptions] = useState([]);

  useEffect(() => {
    // shuffle the options each time the flashcard changes
    const shuffledOptions = getMCQOptions(flashcard, otherFlashcards).sort(
      () => Math.random() - 0.5
    );
    setMcqOptions(shuffledOptions);
  }, [flashcard, otherFlashcards]);

  const handleMCQAnswer = (option) => {
    const isAnswerCorrect = option === flashcard.answer;
    setSelectedOption(option);
    setIsCorrect(isAnswerCorrect);
    setAnswerSubmitted(true);
  };

  const handleWrittenAnswer = () => {
    const trimmedInput = userInput.trim();
    const options = {
      includeScore: true,
    };
    const fuse = new Fuse([flashcard.answer], options);
    const result = fuse.search(trimmedInput);
    const isAnswerCorrect = result.length > 0 && result[0].score < 0.6;

    setIsCorrect(isAnswerCorrect);
    setAnswerSubmitted(true);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      handleWrittenAnswer();
    }
  };

  const handleNextClick = () => {
    // now we call onAnswerSubmit with the stored answer correctness
    onAnswerSubmit(flashcard.id, isCorrect);
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setUserInput("");
    onNext();
  };

  return (
    <div>
      <div dangerouslySetInnerHTML={sanitizeHTML(flashcard.question)}></div>
      {flashcard.currentType === "multipleChoice" && (
        <div>
          {mcqOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleMCQAnswer(option)}
              dangerouslySetInnerHTML={sanitizeHTML(option)}
              className={
                selectedOption === option
                  ? isCorrect
                    ? "correct" // CSS class for correct answers
                    : "incorrect" // CSS class for incorrect answers
                  : selectedOption && flashcard.answer === option
                  ? "correct" // highlight the correct answer
                  : "" // no class for unselected options
              }
              disabled={answerSubmitted}
            ></button>
          ))}
        </div>
      )}

      {flashcard.currentType === "written" && (
        <div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={answerSubmitted}
            onKeyDown={handleEnter}
          />
          <button onClick={handleWrittenAnswer} disabled={answerSubmitted}>
            Submit
          </button>
          {(!isCorrect && answerSubmitted)  && (
            <>
              <p className="correct">Correct answer: <div dangerouslySetInnerHTML={sanitizeHTML(flashcard.answer  )}></div></p>
            </>
          )}
        </div>
      )}

      {answerSubmitted && <button onClick={handleNextClick}>Next</button>}
    </div>
  );
};
