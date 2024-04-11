import React, { useState, useEffect } from "react";
import { getMCQOptions } from "./MCQGenerator";
import { sanitizeHTML } from "../../../utilities";
import Fuse from "fuse.js";
import styles from "./DynamicDisplay.module.css";

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

  // function to split array into chunks of given size
  const chunkArray = (myArray, chunkSize) => {
    const arrayChunks = [];
    for (let i = 0; i < myArray.length; i += chunkSize) {
      arrayChunks.push(myArray.slice(i, i + chunkSize));
    }
    return arrayChunks;
  };

  // split mcqOptions into chunks of size 2
  const mcqOptionChunks = chunkArray(mcqOptions, 2);

  return (
    <div className={styles.flashcardContainer}>
      <div className={styles.flashcardContent}>
        <div className={styles.flashcardQuestion} dangerouslySetInnerHTML={sanitizeHTML(flashcard.question)}></div>
        {flashcard.currentType === "multipleChoice" && (
          <div>
            {mcqOptionChunks.map((chunk, index) => (
              <div key={index} className={styles.optionRow}>
                {chunk.map((option, innerIndex) => (
                  <button
                    key={innerIndex}
                    onClick={() => handleMCQAnswer(option)}
                    dangerouslySetInnerHTML={sanitizeHTML(option)}
                    className={`${selectedOption === option
                      ? isCorrect
                        ? styles.correct // CSS class for correct answers
                        : styles.incorrect // CSS class for incorrect answers
                      : selectedOption && flashcard.answer === option
                      ? styles.correct // highlight the correct answer
                      : ""} ${styles.option}`}
                    disabled={answerSubmitted}
                  ></button>
                ))}
              </div>
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
              className={styles.writtenAnswer}
            />
            <button onClick={handleWrittenAnswer} disabled={answerSubmitted} className={styles.submitButton}>
              Submit
            </button>
            {!isCorrect && answerSubmitted && (
              <>
                <p className={styles.correctAnswer}>
                  Correct answer:{" "}
                  <div
                    dangerouslySetInnerHTML={sanitizeHTML(flashcard.answer)}
                  ></div>
                </p>
              </>
            )}
          </div>
        )}

        {answerSubmitted && (
          <button onClick={handleNextClick} className={styles.nextButton}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};
