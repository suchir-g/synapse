import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { sanitizeAndTruncateHtml } from "../../../utilities";

import styles from "./MeteorQuiz.module.css";
import WebOnly from "pages/WebOnly";

class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: "MyScene" });
  }

  preload() {
    this.load.image("meteor", "/temp_meteor.png");
  }

  create() {
    this.meteors = this.physics.add.group();

    let delay = 5000; // initial delay
    const minDelay = 1000;
    const delayDecrement = 50;

    const spawnMeteor = () => {
      const x = Phaser.Math.Between(150, 750);
      const meteor = this.meteors
        .create(x, -50, "meteor")
        .setScale(Phaser.Math.FloatBetween(0.2, 0.5));

      const randomFlashcard =
        this.flashcards[Phaser.Math.Between(0, this.flashcards.length - 1)];
      meteor.flashcardQuestion = sanitizeAndTruncateHtml(
        randomFlashcard.question
      );
      meteor.flashcardAnswer = randomFlashcard.answer;

      // create a text object for the meteor
      const text = this.add.text(
        x,
        -50,
        sanitizeAndTruncateHtml(randomFlashcard.question),
        {
          font: "18px Inter",
          fill: "#ffffff",
        }
      );
      meteor.setData("text", text);

      const verticalVelocity = Phaser.Math.Between(20, 50); // adjusted for more noticeable vertical movement

      // determine horizontal and angular velocity based on spawn position
      const screenCenter = this.sys.game.config.width / 2;
      const isLeftSide = x < screenCenter;
      const horizontalVelocity = isLeftSide
        ? Phaser.Math.Between(20, 60)
        : Phaser.Math.Between(-60, -20); // move right if on left, left if on right
      meteor.setVelocity(horizontalVelocity, verticalVelocity);

      const angularVelocity = isLeftSide
        ? Phaser.Math.Between(20, 60)
        : Phaser.Math.Between(-60, -20); // rotate based on side
      meteor.setAngularVelocity(angularVelocity);

      // adjust spawn delay for next meteor
      delay = Math.max(minDelay, delay - delayDecrement);
      this.time.delayedCall(delay, spawnMeteor);
    };

    spawnMeteor();
    this.setCurrentQuestion(this.flashcards[0].question);
  }

  update() {
    this.meteors.children.iterate(function (meteor) {
      if (meteor && meteor.active && meteor.y > this.sys.game.config.height) {
        const text = meteor.getData("text");
        if (text) {
          text.destroy(); // destroy the text object
        }
        meteor.destroy();

        // decrease lives here
        if (typeof window.decreaseLives === "function") {
          window.decreaseLives();
        }
      } else if (meteor && meteor.active) {
        // update text position
        const text = meteor.getData("text");
        if (text) {
          text.setPosition(meteor.x, meteor.y);
        }
      }
    }, this);
  }
}
const MeteorQuiz = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [flashRed, setFlashRed] = useState(false);

  const setCurrentQuestionRef = useRef();
  setCurrentQuestionRef.current = setCurrentQuestion;

  const { setID } = useParams();
  const gameInstance = useRef(null);

  const navigate = useNavigate();

  const decreaseLives = () => {
    setLives((prevLives) => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        setGameOver(true); // end the game if lives reach 0
      }
      return newLives;
    });
  };

  useEffect(() => {
    const fetchFlashcards = async () => {
      const setDocRef = doc(db, "flashcardSets", setID);
      const docSnap = await getDoc(setDocRef);

      if (docSnap.exists()) {
        const subcollectionRef = collection(docSnap.ref, "flashcards");
        const querySnapshot = await getDocs(subcollectionRef);
        const fetchedFlashcards = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcards(fetchedFlashcards);
      } else {
        console.log("Document does not exist");
      }
    };

    if (setID) {
      fetchFlashcards();
    }
  }, [setID]);

  useEffect(() => {
    if (flashcards.length > 0) {
      // ensure that the scene knows how to update the question based on flipping
      MyScene.prototype.updateCurrentQuestion = (question, answer) => {
        const textToShow = flipped ? answer : question;
        setCurrentQuestionRef.current(textToShow);
      };
    }
  }, [flashcards, flipped]);

  useEffect(() => {
    window.decreaseLives = decreaseLives;
    if (flashcards.length > 0 && !gameInstance.current) {
      MyScene.prototype.flashcards = flashcards;
      MyScene.prototype.setCurrentQuestion = setCurrentQuestionRef.current;

      gameInstance.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: "phaser-game",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 5 },
            debug: false,
          },
        },
        scene: [MyScene],
      });

      return () => {
        if (gameInstance.current) {
          gameInstance.current.destroy(true);
        }
        delete window.decreaseLives;
      };
    }
  }, [flashcards]);

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
  };

  const handleFlip = () => {
    setFlipped(!flipped); // toggle between term and definition
    const currentMeteor = findClosestMeteor();
    if (currentMeteor) {
      const textToShow = flipped
        ? currentMeteor.flashcardQuestion
        : currentMeteor.flashcardAnswer;
      setCurrentQuestionRef.current(textToShow);
    }
  };

  const findClosestMeteor = () => {
    const scene = gameInstance.current.scene.keys.MyScene;
    let lowestMeteor = null;
    scene.meteors.getChildren().forEach((meteor) => {
      if (!lowestMeteor || meteor.y > lowestMeteor.y) {
        lowestMeteor = meteor;
      }
    });
    return lowestMeteor;
  };
  const getTextFromHtml = (htmlString) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  // function to handle answer submission
  const handleAnswerSubmit = () => {
    let answeredCorrectly = false;

    const meteors =
      gameInstance.current.scene.keys.MyScene.meteors.getChildren();
    for (let i = 0; i < meteors.length; i++) {
      const meteor = meteors[i];
      const plainAnswer = getTextFromHtml(meteor.flashcardAnswer);

      if (userAnswer.toLowerCase() === plainAnswer.toLowerCase()) {
        // correct answer
        meteor.setTint(0x00ff00); // green tint for correct answer
        const text = meteor.getData("text");
        if (text) {
          text.destroy(); // destroy the associated text
        }
        meteor.destroy(); // destroy the meteor
        answeredCorrectly = true;
        setScore((prevScore) => prevScore + 1); // increment score
        setUserAnswer(""); // reset user input
        break; // exit the loop after destroying a meteor
      }
    }

    if (!answeredCorrectly) {
      console.error("Answer was incorrect or no matching question found.");
      setFlashRed(true); // trigger the red flash
      setTimeout(() => setFlashRed(false), 500); // reset the flash state after 500ms
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        if (newLives <= 0) {
          setGameOver(true); // end the game if lives reach 0
          console.log("It's over");
        }
        return newLives;
      });
    }
    setUserAnswer(""); // reset user input regardless of whether the answer was correct
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAnswerSubmit();
    }
  };

  if (gameOver) {
    return (
      <div>
        <WebOnly />
        <div className={styles.mainContainer}>
          <span className={styles.flashcard}>
            <h1 className={styles.finishedText}>It's over</h1>
            <p className={styles.mutedText}>
              Thanks for playing - if you want more info on how this game works
              visit <Link className={styles.learnLink}>this page</Link>
            </p>
            <p>Score: {score}</p>
            <div>
              <button
                className={`${styles.restartButton} ${styles.afterButton}`}
                onClick={() => {
                  navigate(0);
                }}
              >
                {" "}
                Restart
              </button>
              <button
                className={`${styles.backButton} ${styles.afterButton}`}
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <WebOnly />
        <div
          style={{
            backgroundColor: flashRed ? "#ffaaaa" : "transparent",
            transition: "background-color 500ms",
          }}
          className={styles.mainContainer}
        >
          <div
            id="phaser-game"
            style={{ width: "800px", height: "600px" }}
          ></div>
          <input
            type="text"
            value={userAnswer}
            onChange={handleAnswerChange}
            onKeyDown={handleKeyDown}
            className={styles.answerInput}
            placeholder="Answer"
          />
          <button onClick={handleAnswerSubmit} className={styles.submitButton}>
            Submit Answer
          </button>
          <div>Lives: {lives}</div>
        </div>
      </div>
    );
  }
};

export default MeteorQuiz;
