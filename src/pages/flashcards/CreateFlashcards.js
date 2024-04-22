import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css"; // Import the Bubble theme CSS
import styles from "./CreateFlashcards.module.css"
import "./Ql-editor.css"
import { flashcardModule } from "../../config/quill";



const CreateFlashcards = ({ isAuth }) => {
  const navigate = useNavigate();
  if (!isAuth) {
    navigate("/");
  }

  const flashcardSetsRef = collection(db, "flashcardSets");

  const [setTitle, setSetTitle] = useState("");
  const [setDescription, setSetDescription] = useState("");
  const [flashcards, setFlashcards] = useState([{ question: "", answer: "" }]);

  const [selectedTags, setSelectedTags] = useState([]); // for storing selected tags
  const [tagsOptions, setTagsOptions] = useState([]);

  if (!isAuth) {
    navigate("/");
  }

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

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards]; // this is effectively copying it
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const addFlashcard = () => {
    // this is saying flashcards = flashcards + this new template one
    setFlashcards([...flashcards, { question: "", answer: "" }]);
  };

  const removeFlashcard = (index) => {
    const newFlashcards = [...flashcards];
    newFlashcards.splice(index, 1); // splicing with a length of 1 basically removes that index.
    setFlashcards(newFlashcards);
  };

  const handleCreateSet = async (e) => {
    e.preventDefault(); // prevents the default form behaviour from taking place
    // therefore we can do what we want here and manually navigate at the end

    // first we have to check title and description

    if (!setTitle.trim() || !setDescription.trim() || flashcards.length < 4) {
      //probably make this more formal later
      console.error(
        "Title and description are required as well as more than 3 flashcards"
      );
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
          Post Flashcards
        </h1>
        <p className={styles.mutedText}>Go to <Link className={styles.learnLink} to="/toptips">this page </Link>to learn how to effectively revise material.</p>

      </div>

      <div className={styles.mainContent}>
        <form onSubmit={handleCreateSet}>
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

          {/* dynamically rendered flashcards input */}
          {flashcards.map((flashcard, index) => (
            <div key={index} className={styles.flashcardPair}>
              <ReactQuill
                value={flashcard.question}
                onChange={(content) =>
                  handleFlashcardChange(index, "question", content)
                }
                placeholder="Question"
                theme="bubble" // set the theme to bubble
                modules={flashcardModule}
                className={styles.quillComponent}
              />
              <ReactQuill
                value={flashcard.answer}
                onChange={(content) =>
                  handleFlashcardChange(index, "answer", content)
                }
                placeholder="Answer"
                theme="bubble" // Set the theme to bubble
                modules={flashcardModule}
                className={styles.quillComponent}
              />
              <button className={styles.removeCard} type="button" onClick={() => removeFlashcard(index)}>
                Remove
              </button>
            </div>
          ))}


          <button type="button" onClick={addFlashcard} className={styles.bottomButton}>
            Add Flashcard
          </button>

          <button type="submit" className={`${styles.bottomButton} ${styles.createButton}`}>Create Set</button>
        </form>
      </div>
    </div>
  );
};

export default CreateFlashcards;
