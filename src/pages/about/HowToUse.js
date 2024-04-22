import React, { useState } from 'react';
import styles from './HowToUse.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

const HowToUse = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
        //HELLO
    const questions = [
        {
            question: 'How do I get started?',
            answer: `To get started, follow these steps: <br /> <br /> 1. Press "Post" in the top right to create content <br/> 2. When you have created whatever you want to revise from (e.g. flashcards), press "My Stuff" to get onto the selector menu. <br />3. Use the various revision modes on the document's page to effectively study the content.`,
        },
        {
            question: 'What features does this app offer?',
            answer: 'This app offers features such as flashcard creation and revision, notes, whiteboards and more. <br />We also have things like a todo list + calendar for optimal time management. <br /> Synapse was built after considering various psychological studies and papers - all the revision modes are carefully crafted to reduce memory loss.',
        },
        {
            question: 'How can I optimise my revision ?',
            answer: 'Interleaving and active recall are some of the best ways to optimise learning. <br /> Interleaving mixes different topics during study sessions, while active recall involves actively retrieving information from memory; integrating both techniques optimizes learning by strengthening understanding and retention.',
        },
    ];

    return (
        <div className={styles.mainContainer}>
            <div className={styles.postFlashcardsContainer}>
                <h1 className={styles.postFlashcards}>How to use</h1>
            </div>
            <div className={styles.mainContent}>
                {questions.map((q, index) => (
                    <div key={index} className={styles.question} onClick={() => toggleExpand(index)}>
                        <span className={styles.questionPart}>
                            <h1 className={styles.mainText}>{q.question}</h1>
                            <span className={styles.arrow}>
                                {expandedIndex === index ? (
                                    <FontAwesomeIcon icon={faCaretUp} />
                                ) : (
                                    <FontAwesomeIcon icon={faCaretDown} />
                                )}
                            </span>
                        </span>
                        {expandedIndex === index && (
                            <div className={styles.answer}>
                                <p className={styles.answerText}><div dangerouslySetInnerHTML={{__html: q.answer}}></div></p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HowToUse;
