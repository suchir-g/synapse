export const getMCQOptions = (currentFlashcard, otherFlashcards, numberOfOptions = 4) => {
    let options = new Set();
    options.add(currentFlashcard.answer);
  
    // keep adding random options until we have the desired number
    while (options.size < numberOfOptions) {
      const randomIndex = Math.floor(Math.random() * otherFlashcards.length);
      const randomOption = otherFlashcards[randomIndex].answer;
      
      // ensure the random option is not the same as the current flashcard's answer
      if (randomOption !== currentFlashcard.answer) {
        options.add(randomOption);
      }
    }
  
    // convert the Set to an array - we will shuffle it in the other component
    return Array.from(options);
  };
  