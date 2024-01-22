import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { db, auth } from "../../config/firebase";

import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";

import { flashcardsFromSet } from "../../utilities";

import { useNavigate } from "react-router-dom";

import Select from "react-select";

const EditFlashcards = ({ isAuth }) => {
  const { id } = useParams();

  const [setTitle, setSetTitle] = useState("");
  const [setDescription, setSetDescription] = useState("");
  const [flashcards, setFlashcards] = useState([]);

  const [shownCards, setShownCards] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [tagsOptions, setTagsOptions] = useState([]); // Options for the tags dropdown
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags

  const navigate = useNavigate();

  if (!isAuth) {
    navigate("/");
  }

  useEffect(() => {
    const fetchSetData = async () => {
      try {
        const setDocRef = doc(db, "flashcardSets", id);
        const setSnapshot = await getDoc(setDocRef);

        if (setSnapshot.exists()) {
          const setData = setSnapshot.data();
          setSetTitle(setData.title);
          setSetDescription(setData.description);

          const checkOwnership = async () => {
            let owned = false;

            for (const owner of setData.owners) {
              if (auth.currentUser.uid == owner) {
                owned = true;
                break; // exit the loop as soon as a match is found - saves time
              }
            }

            if (!owned) {
              navigate("/mystuff");
            }
          };

          checkOwnership();

          // fetch all tags for dropdown options but only the ones owned by the owner
          const tagsQuery = query(
            collection(db, "tags"),
            where("owner", "==", auth.currentUser.uid)
          );

          //again mapping them into value, and label now for the dropdown
          const tagsSnapshot = await getDocs(tagsQuery);
          const fetchedTags = tagsSnapshot.docs.map((doc) => ({
            value: doc.id,
            label: doc.data().tagName,
          }));
          setTagsOptions(fetchedTags);

          // set selected tags for the set
          const currentTags = fetchedTags.filter((tag) =>
            setData.tags.includes(tag.value)
          );
          setSelectedTags(currentTags);

          // fetch flashcards for this set using the utility function
          const loadFlashcards = await flashcardsFromSet(setDocRef);
          setFlashcards(loadFlashcards);
        } else {
          console.error("No set exists.");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSetData();
    setIsLoading(false);
  }, [id]);

  // everytime we change, it's setting the selected options to whatever selected or nothing if nothing is selected (thats the purpose of || [])
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
  };

  const handleUpdateSet = async (event) => {
    event.preventDefault();

    const setDocRef = doc(db, "flashcardSets", id);

    try {
      const tagIds = selectedTags.map((tag) => tag.value);
      await updateDoc(setDocRef, {
        // sets the title and description to the current state
        title: setTitle,
        description: setDescription,
        tags: tagIds,
      });

      // updating each flashcard now

      const flashcardRef = collection(db, "flashcardSets", id, "flashcards");

      const flashcardPromises = flashcards.map((flashcard) => {
        // first check if we have to delete it

        if (flashcard.deleted) return null;

        // what we are doing here is saying that those who exist have an id so should be edited
        // if the flashcard dosen't have an id, it's new and should be added
        if (flashcard.id) {
          const flashcardDocRef = doc(flashcardRef, flashcard.id);

          return updateDoc(flashcardDocRef, {
            question: flashcard.question,
            answer: flashcard.answer,
          });
        } else {
          // now here we don't have to update anything, we just add.
          return addDoc(flashcardRef, {
            question: flashcard.question,
            answer: flashcard.answer,
          });
        }
      });

      // waits until everything is resolved
      await Promise.all(flashcardPromises);

      await deleteMarkedFlashcards();
    } catch (err) {
      console.error("Error updating. Try again");
    }
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { question: "", answer: "" }]);
  };

  useEffect(() => {
    setShownCards(flashcards.filter((flashcard) => !flashcard.deleted));
  }, [flashcards]);

  const removeFlashcard = (index) => {
    // if the flashcard has an ID, it means it exists in the database
    // and we should mark it for deletion instead of removing from the array
    const newFlashcards = [...flashcards];
    if (newFlashcards[index].id) {
      // mark the flashcard for deletion in the state by setting a flag
      newFlashcards[index].deleted = true;
    } else {
      // remove flashcard from the array if it doesn't have an ID (it's not saved in db yet) so it's fine to delete like this
      newFlashcards.splice(index, 1);
    }
    setFlashcards(newFlashcards);
  };

  // this is going through our "delete list" and deleting them
  const deleteMarkedFlashcards = async () => {
    const deletePromises = flashcards
      .filter((flashcard) => flashcard.deleted)
      .map((flashcard) => {

        // notice how we have to give 3 ids since we have a nested collection 
        const flashcardRef = doc(
          db,
          "flashcardSets",
          id,
          "flashcards",
          flashcard.id
        );
        return deleteDoc(flashcardRef);
      });

    await Promise.all(deletePromises);
  };

  const deleteSet = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this set? This action cannot be undone."
      )
    ) {
      try {
        // delete all flashcards in the set first
        const flashcardsRef = collection(db, "flashcardSets", id, "flashcards");
        const flashcardsSnapshot = await getDocs(flashcardsRef);
        const deletionPromises = flashcardsSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletionPromises);

        // then delete the set itself
        // this is because deleting the subcollection of flashcards won't do anything to this outer one
        const setDocRef = doc(db, "flashcardSets", id);
        await deleteDoc(setDocRef);

        navigate("/mystuff");
      } catch (err) {
        console.error("Error deleting set: ", err);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-flashcards-container">
      <h2>EDIT</h2>
      <form onSubmit={handleUpdateSet}>
        <div className="form-group">
          <label htmlFor="setTitle">Set Title</label>
          <input
            type="text"
            id="setTitle"
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="Set Title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="setDescription">Set Description</label>
          <textarea
            id="setDescription"
            value={setDescription}
            onChange={(e) => setSetDescription(e.target.value)}
            placeholder="Set Description"
            required
          />
        </div>

        <hr />

        {/* tags dropdown */}
        <div>
          <label>Select Tags:</label>
          <Select
            options={tagsOptions}
            isMulti
            onChange={handleTagChange}
            value={selectedTags}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
        </div>

        <hr />

        {/* dynamically rendered flashcards input */}
        {shownCards.map((flashcard, index) => (
          <div key={flashcard.id || index} className="flashcard-edit-group">
            <div className="form-group">
              <label htmlFor={`question-${index}`}>Question</label>
              <input
                type="text"
                id={`question-${index}`}
                value={flashcard.question}
                onChange={(e) =>
                  handleFlashcardChange(index, "question", e.target.value)
                }
                placeholder="Question"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor={`answer-${index}`}>Answer</label>
              <input
                type="text"
                id={`answer-${index}`}
                value={flashcard.answer}
                onChange={(e) =>
                  handleFlashcardChange(index, "answer", e.target.value)
                }
                placeholder="Answer"
                required
              />
            </div>
            <button type="button" onClick={() => removeFlashcard(index)}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addFlashcard}>
          Add Flashcard
        </button>

        <button type="submit">Update Set</button>
        <button type="button" onClick={deleteSet}>
          Delete Set
        </button>
      </form>
    </div>
  );
};

export default EditFlashcards;