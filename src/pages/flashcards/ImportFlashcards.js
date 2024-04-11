import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import { parseQuizletData } from "../../quizletParser"

import styles from "./ImportFlashcards.module.css"

const ImportFlashcards = ({ isAuth }) => {
  const navigate = useNavigate();
  if (!isAuth) {
    navigate("/");
  }

  const flashcardSetsRef = collection(db, "flashcardSets");

  const [setTitle, setSetTitle] = useState("");
  const [setDescription, setSetDescription] = useState("");
  const [quizletData, setQuizletData] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsOptions, setTagsOptions] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      if (auth.currentUser) {
        // construct a query to fetch tags where the 'ownerId' field matches the current user's ID
        const tagsQuery = query(
          collection(db, "tags"),
          where("owner", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(tagsQuery);

        // this maps each doc into the only things we need - value and tagName
        // the value and tagName will be used when linking tags to the dropdown
        const options = querySnapshot.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().tagName,
        }));
        setTagsOptions(options);
      }
    };

    fetchTags();
  }, []);

  const handleImportSet = async (e) => {
    e.preventDefault();

    if (!setTitle.trim() || !setDescription.trim()) {
      console.error("Title and description are required");
      return;
    }

    const flashcards = parseQuizletData(quizletData);
    if (flashcards.length === 0) {
      console.error("No valid flashcards found in the provided data");
      return;
    }

    const selectedTagIds = selectedTags.map((tag) => tag.value);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayString = yesterday.toISOString().split("T")[0];

    try {
      // add a new document with a generated ID to the flashcard sets
      const setDocRef = await addDoc(flashcardSetsRef, {
        title: setTitle,
        description: setDescription,
        owners: [auth.currentUser.uid],
        tags: selectedTagIds,
        viewed: new Date(),
        interleaving: false,
        revised: yesterdayString, // this is for interleaving - stops them from revising twice in a day. initialised to yesterday so they can revise today.
      });

      // now we need to add the flashcards themselves

      const flashcardsRef = collection(
        db,
        "flashcardSets",
        setDocRef.id,
        "flashcards"
      );

      const flashcardPromises = flashcards.map((flashcard) => {
        // now a bunch of flashcard logic inside this
        // the below trims() are just checking if they are not blank.

        if (flashcard.question.trim() && flashcard.answer.trim()) {
          return addDoc(flashcardsRef, {
            question: flashcard.question,
            answer: flashcard.answer,
            created: serverTimestamp(), // this keeps track of when each one was edited so that we can order them as such
          });
        }

        return Promise.resolve();
      });

      await Promise.all(flashcardPromises);
      // this waits for everything to be finished before moving on

      navigate("/mystuff");
    } catch (error) {
      console.error("error: ", error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>
          Import Flashcards
        </h1>
        <p className={styles.mutedText}>Go to <Link className={styles.learnLink} to="/learn/revise">this page </Link>to learn how to effectively revise material.</p>

      </div>
      <div className={styles.mainContent}>
        <form onSubmit={handleImportSet}>
          {/* input fields for title, description, and tags */}

          <div className={styles.titleTagSection}>
            <div className={styles.formGroup}>
              <label className={styles.mutedText}>Title</label>
              <input
                type="text"
                value={setTitle}
                onChange={(e) => setSetTitle(e.target.value)}
                placeholder="Set Title"
                required
                className={styles.setName}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.mutedText}>Select Tags:</label>
              <Select
                options={tagsOptions} // set options for react-select
                isMulti
                onChange={setSelectedTags} // update state when the user selects or unselects a tag
                value={selectedTags} // control the current value
                getOptionLabel={(option) => option.label} // defines how to display the option label
                getOptionValue={(option) => option.value} // defines how to get the option value
                className={styles.tagsSelect}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.mutedText}>
              Description
            </label>
            <textarea
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="Set Description"
              required
              className={styles.descriptionInput}
            />
          </div>


          <textarea
            value={quizletData}
            onChange={(e) => setQuizletData(e.target.value)}
            placeholder="Paste your Quizlet flashcards here"
            required
            className={styles.quizletFlashcards}
          />

          <button type="submit" className={`${styles.bottomButton} ${styles.createButton}`}>Import Set</button>
        </form>
      </div>
    </div>
  );
};

export default ImportFlashcards;
