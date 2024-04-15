import styles from "./TopTips.module.css";
import Flashcard from "pages/revision/flashcards/Flashcard";
import React from "react";

const TopTips = () => {
  const flashcards = [
    {
      question: "How often should I revise?",
      answer:
        "Revise often but not too heavily. <br /> For example, it's better to revise a subject for 30 minutes per day for months than 6 hours a day before the exam. Cramming may seem to work, but it's very unreliable and the best way to learn content is to do it steadily over time. Make learning a habit, not a conscious effort.",
    },
    {
      question: "How should I revise?",
      answer:
        "Just to preface this: everyone revises differently. However, strategies which are based on repetition are usually a lot better - types like interleaving and active recall. Practice papers and flashcards are the best for this - keep doing them until you have memorised the content/know the mark schemes inside out.",
    },
    {
      question:
        "I know the content but can't perform in the exam. What should I do?",
      answer:
        "First, you have to diagnose the problem. Some common ones include time control, exam pressure and anxiety. For all of these, the best thing to do is just practice with those conditions - the best practice is just doing it in timed conditions with no distractions at all. Make sure you finish the practice paper and don't leave it since that's the closest to real conditions you can get. ",
    },
    {
      question: "How does the use of color impact my memory during revision?",
      answer:
        "Research highlights that colors can significantly influence memory retention. For instance, yellow has been shown to enhance memory recall in language learning. Incorporate colors like yellow in your revision materials, such as flashcards or highlighted notes, to help improve recall efficiency.",
    },
    {
      question: "Why is it important to minimize distractions while revising?",
      answer:
        "Studies on attention and memory demonstrate that minimizing distractions leads to better focus and deeper learning. Design your study environment to be free from unnecessary elements and noises. This focused approach aligns with active recall techniques, ensuring that your attention is solely on the material you're studying.",
    },
    {
      question: "What is the ideal amount of information per flashcard?",
      answer:
        "To avoid overwhelming your working memory, keep flashcards concise and focused. Research suggests that a clear, minimalistic approach aids in better retention and understanding. Each flashcard should contain just enough information to cover a key concept or definition, facilitating easier recall and review.",
    },
    {
      question: "How should I organise my flashcards?",
      answer:
        "Structuring flashcards hierarchically helps in managing cognitive load effectively. By organizing study materials into clear categories, you reduce the mental effort needed to switch contexts and maintain focus on one topic at a time. This method is particularly effective in enhancing learning efficiency and reducing the time needed to find relevant information during revision sessions.",
    },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h1 className={styles.mainText}>How to revise</h1>
        <i className={styles.muted}>
          All info collated from research and also personal interviews with
          students achieving straight 9s at GCSE.
        </i>

        {flashcards.map((flashcard) => {
          return (
            <Flashcard
              size={{ width: "100%", height: "200px" }}
              isQuestionFirst={true}
              flashcard={{
                question: flashcard.question,
                answer: flashcard.answer,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TopTips;
