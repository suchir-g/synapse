import React, { useEffect, useState, useRef } from "react";
import Phaser from "phaser";
import { useParams } from "react-router-dom";
import { flashcardsFromSetID } from "../../../utilities";

function preload() {
  this.load.image("meteor", "/temp_meteor.png");
}

function create() {
  this.meteors = this.physics.add.group();

  let delay = 5000;
  const minDelay = 1000;
  const delayDecrement = 50;

  const spawnMeteor = () => {
    const x = Phaser.Math.Between(0, 800);
    const targetX = this.sys.game.config.width / 2;
    const targetY = this.sys.game.config.height;
    const meteor = this.meteors
      .create(x, -50, "meteor")
      .setScale(Math.max(0.2, Math.min(0.5, Math.random())));

    const flashcards = this.game.registry.get("flashcards");
    const randomFlashcard =
      flashcards[Phaser.Math.Between(0, flashcards.length - 1)];
    meteor.flashcardQuestion = randomFlashcard.question;
    meteor.flashcardAnswer = randomFlashcard.answer;

    const distanceToTargetX = targetX - x;
    const distanceToTargetY = targetY - 50;
    const verticalVelocity = Phaser.Math.Between(10, 30);
    const timeToTargetY = distanceToTargetY / verticalVelocity;
    const velocityX = distanceToTargetX / timeToTargetY;

    meteor.setVelocity(velocityX, verticalVelocity);
    meteor.setAngularVelocity(Phaser.Math.Between(-50, 50));

    delay = Math.max(minDelay, delay - delayDecrement);
    this.time.delayedCall(delay, spawnMeteor);
  };

  this.time.delayedCall(delay, spawnMeteor);
}

function update() {
  let lowestMeteor = null;
  this.meteors.children.iterate(function (meteor) {
    if (meteor) {
      if (meteor.y > this.sys.game.config.height) {
        meteor.destroy();
      } else {
        const middleX = this.sys.game.config.width / 2;
        const direction = meteor.x < middleX ? 1 : -1;
        meteor.setVelocityX(50 * direction);
        if (!lowestMeteor || meteor.y > lowestMeteor.y) {
          lowestMeteor = meteor;
        }
      }
    }
  }, this);

  if (lowestMeteor) {
    const setCurrentQuestion = this.game.registry.get(
      "setCurrentQuestionRef"
    ).current;
    if (setCurrentQuestion) {
      setCurrentQuestion(lowestMeteor.flashcardQuestion);
    }
  }
}

const MeteorQuiz = () => {
  const [userAnswer, setUserAnswer] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const setCurrentQuestionRef = useRef();

  const { setID } = useParams();
  setCurrentQuestionRef.current = setCurrentQuestion;

  const gameInstance = useRef(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      const fetchedFlashcards = await flashcardsFromSetID(setID);
      setFlashcards(fetchedFlashcards);
    };

    if (setID) {
      fetchFlashcards();
    }
  }, [setID]);

  useEffect(() => {
    const gameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 50 },
          debug: false,
        },
      },
      scene: {
        data: { flashcards, setCurrentQuestionRef },
        preload,
        create,
        update,
      },
    };

    gameInstance.current = new Phaser.Game(gameConfig);

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
      }
    };
  }, [flashcards]);

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
  };

  const handleAnswerSubmit = () => {
    if (gameInstance.current) {
      const scene = gameInstance.current.scene.keys.default;
      const closestMeteor = findClosestMeteor(scene);
      if (
        closestMeteor &&
        userAnswer.toLowerCase() === closestMeteor.flashcardAnswer.toLowerCase()
      ) {
        closestMeteor.destroy();
        setUserAnswer("");
      } else {
        // Handle incorrect answers
      }
    }
  };

  const findClosestMeteor = (scene) => {
    let lowestMeteor = null;
    scene.meteors.getChildren().forEach((meteor) => {
      if (!lowestMeteor || meteor.y > lowestMeteor.y) {
        lowestMeteor = meteor;
      }
    });
    return lowestMeteor;
  };

  return (
    <div>
      <div id="phaser-game" style={{ width: "800px", height: "600px" }} />
      <div>Question: {currentQuestion}</div>
      <input type="text" value={userAnswer} onChange={handleAnswerChange} />
      <button onClick={handleAnswerSubmit}>Submit Answer</button>
    </div>
  );
};

export default MeteorQuiz;
