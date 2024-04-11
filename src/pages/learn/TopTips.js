import styles from "./TopTips.module.css"
import Flashcard from "pages/revision/flashcards/Flashcard"

const TopTips = () => {

    const flashcards = [
        { question: "How often should I revise?", answer: "Revise often but not too heavily. <br /> For example, it's better to revise a subject for 30 minutes per day for months than 6 hours a day before the exam. Cramming may seem to work, but it's very unreliable and the best way to learn content is to do it steadily over time. Make learning a habit, not a conscious effort." },
        { question: "How should I revise?", answer: "Just to preface this: everyone revises differently. However, strategies which are based on repetition are usually a lot better - types like interleaving and active recall. Practice papers and flashcards are the best for this - keep doing them until you have memorised the content/know the mark schemes inside out." },
        { question: "I know the content but can't perform in the exam. What should I do?", answer: "First, you have to diagnose the problem. Some common ones include time control, exam pressure and anxiety. For all of these, the best thing to do is just practice with those conditions - the best practice is just doing it in timed conditions with no distractions at all. Make sure you finish the practice paper and don't leave it since that's the closest to real conditions you can get. " }
    ]


    return (
        <div className={styles.mainContainer}>
            <div className={styles.mainContent}>
                <h1 className={styles.mainText}>How to revise</h1>
                <i className={styles.muted}>All info collated from research and also personal interviews with students achieving straight 9s at GCSE.</i>

                {flashcards.map(flashcard => {
                    return <Flashcard size={{width: "600px", height: "400px"}}  isQuestionFirst={true} flashcard={{ question: flashcard.question, answer: flashcard.answer }} />
                })}

            </div>
        </div>
    )
}

export default TopTips