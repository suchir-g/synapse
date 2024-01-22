export const parseQuizletData = (quizletData) => {
    const lines = quizletData.split('\n');
    const flashcards = [];
    let currentFlashcard = {};
  
    lines.forEach((line, index) => {
      if (line.includes('\t')) {
        if (currentFlashcard.question) {
          // if there's already a question in the current flashcard,
          // push it to the flashcards array and start a new one
          flashcards.push(currentFlashcard);
        }
        const [question, answer] = line.split('\t').map(part => part.trim());
        currentFlashcard = { question, answer };
      } else {
        // this line is a continuation of the previous answer
        currentFlashcard.answer = (currentFlashcard.answer ? currentFlashcard.answer + '\n' : '') + line.trim();
      }
    });
  
    // add the last flashcard if it exists
    if (currentFlashcard.question) {
      flashcards.push(currentFlashcard);
    }
  
    return flashcards.filter(flashcard => flashcard.question && flashcard.answer);
  };
  