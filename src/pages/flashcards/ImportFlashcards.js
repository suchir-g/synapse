import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { parseQuizletData } from "../../quizletParser"

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

    try {
      // add a new document with a generated ID to the flashcard sets
      const setDocRef = await addDoc(flashcardSetsRef, {
        title: setTitle,
        description: setDescription,
        owners: [auth.currentUser.uid],
        tags: selectedTagIds,
        viewed: new Date(),
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
      <form onSubmit={handleImportSet}>
        {/* input fields for title, description, and tags */}

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

        <div>
          <label>Select Tags:</label>
          <Select
            options={tagsOptions} // Set options for react-select
            isMulti
            onChange={setSelectedTags} // Update state when the user selects or unselects a tag
            value={selectedTags} // Control the current value
            getOptionLabel={(option) => option.label} // Defines how to display the option label
            getOptionValue={(option) => option.value} // Defines how to get the option value
          />
        </div>

        <textarea
          value={quizletData}
          onChange={(e) => setQuizletData(e.target.value)}
          placeholder="Paste your Quizlet flashcards here"
          required
        />

        <button type="submit">Import Set</button>
      </form>
    </div>
  );
};

export default ImportFlashcards;
