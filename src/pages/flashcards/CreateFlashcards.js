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
    <div>
      <Link to="/sets/import">Import flashcards</Link>
      <form onSubmit={handleCreateSet}>
        <input
          type="text"
          value={setTitle}
          onChange={(e) => setSetTitle(e.target.value)}
          placeholder="Set Title"
          required
        />
        <textarea
          value={setDescription}
          onChange={(e) => setSetDescription(e.target.value)}
          placeholder="Set Description"
          required
        />

        {/* dynamically rendered flashcards input */}
        {flashcards.map((flashcard, index) => (
          <div key={index}>
            <ReactQuill
              value={flashcard.question}
              onChange={(content) =>
                handleFlashcardChange(index, "question", content)
              }
              placeholder="Question"
              theme="bubble" // 2et the theme to bubble
              modules={flashcardModule}
            />
            <ReactQuill
              value={flashcard.answer}
              onChange={(content) =>
                handleFlashcardChange(index, "answer", content)
              }
              placeholder="Answer"
              theme="bubble" // Set the theme to bubble
              modules={flashcardModule}
            />
            <button type="button" onClick={() => removeFlashcard(index)}>
              Remove
            </button>
          </div>
        ))}
        <div>
          <label>Select Tags:</label>
          <Select
            options={tagsOptions} // set options for react-select
            isMulti
            onChange={setSelectedTags} // update state when the user selects or unselects a tag
            value={selectedTags} // control the current value
            getOptionLabel={(option) => option.label} // defines how to display the option label
            getOptionValue={(option) => option.value} // defines how to get the option value
          />
        </div>

        <button type="button" onClick={addFlashcard}>
          Add Flashcard
        </button>

        <button type="submit">Create Set</button>
      </form>
    </div>
  );
};

export default CreateFlashcards;
