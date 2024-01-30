import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { sanitizeHTML } from "../../../utilities";

class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: "MyScene" });
  }

  preload() {
    this.load.image("meteor", "/temp_meteor.png");
  }

  create() {
    this.meteors = this.physics.add.group();

    let delay = 5000; // Initial delay
    const minDelay = 1000;
    const delayDecrement = 50;

    const spawnMeteor = () => {
      const x = Phaser.Math.Between(0, 800);
      const meteor = this.meteors
        .create(x, -50, "meteor")
        .setScale(Phaser.Math.FloatBetween(0.2, 0.5));

      const randomFlashcard =
        this.flashcards[Phaser.Math.Between(0, this.flashcards.length - 1)];
      meteor.flashcardQuestion = randomFlashcard.question;
      meteor.flashcardAnswer = randomFlashcard.answer;

      // Lower initial vertical velocity
      const verticalVelocity = Phaser.Math.Between(1, 1.25); // Reduced initial velocity range
      const horizontalVelocity = Phaser.Math.Between(-40, 40);

      meteor.setVelocity(horizontalVelocity, verticalVelocity);
      meteor.setAngularVelocity(Phaser.Math.Between(-25, 25));

      delay = Math.max(minDelay, delay - delayDecrement);
      this.time.delayedCall(delay, spawnMeteor);
    };

    spawnMeteor();
    this.setCurrentQuestion(this.flashcards[0].question);
  }

  update() {
    this.meteors.children.iterate(function (meteor) {
      if (meteor && meteor.y > this.sys.game.config.height) {
        meteor.destroy();
      }
    }, this);

    // If you still want to set the current question based on the lowest meteor,
    // keep this part. Otherwise, it can be removed.
    let lowestMeteor = null;
    this.meteors.children.iterate(function (meteor) {
      if (!lowestMeteor || (meteor && meteor.y > lowestMeteor.y)) {
        lowestMeteor = meteor;
      }
    }, this);

    if (lowestMeteor) {
      this.setCurrentQuestion(lowestMeteor.flashcardQuestion);
    }
  }
}
const MeteorQuiz = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const setCurrentQuestionRef = useRef();
  setCurrentQuestionRef.current = setCurrentQuestion;

  const { setID } = useParams();
  const gameInstance = useRef(null);

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
            gravity: { y: 20 },
            debug: false,
          },
        },
        scene: [MyScene],
      });

      return () => {
        if (gameInstance.current) {
          gameInstance.current.destroy(true);
        }
      };
    }
  }, [flashcards]);

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
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

  // Function to handle answer submission
  const handleAnswerSubmit = () => {
    const closestMeteor = findClosestMeteor();
    const plainAnswer = getTextFromHtml(closestMeteor.flashcardAnswer);

    if (closestMeteor) {
      if (userAnswer.toLowerCase() === plainAnswer.toLowerCase()) {
        // Correct answer
        closestMeteor.setTint(0x00ff00); // Green tint for correct answer
        closestMeteor.destroy(); // Optionally, destroy the meteor
        setUserAnswer(""); // Reset user input
        setCurrentQuestion(flashcards.length > 1 ? flashcards[1].question : "");
      } else {
        // Incorrect answer
        closestMeteor.setTint(0xff0000); // Red tint for incorrect answer
        let newVelocityY = closestMeteor.body.velocity.y + 2; // Gradual increase in speed
        closestMeteor.setVelocityY(newVelocityY);
        closestMeteor.setVelocityY(closestMeteor.body.velocity.y + 500); // Significant increase in speed
        closestMeteor.setAngularVelocity(Phaser.Math.Between(-200, 200)); // Erratic spinning

        setLives((prevLives) => Math.max(prevLives - 1, 0));

        // Check for game over
        if (lives == 0) {
          console.log("Game Over"); // Replace with your game-over logic
          // Optionally, reset the game or navigate to a different screen
        }
      }
    }
    setUserAnswer("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAnswerSubmit();
    }
  };

  return (
    <div>
      <div id="phaser-game" style={{ width: "800px", height: "600px" }}></div>
      <div>Question:</div>
      <div dangerouslySetInnerHTML={sanitizeHTML(currentQuestion)}></div>
      <input
        type="text"
        value={userAnswer}
        onChange={handleAnswerChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleAnswerSubmit}>Submit Answer</button>
      <div>Lives: {lives}</div>
    </div>
  );
};

export default MeteorQuiz;
