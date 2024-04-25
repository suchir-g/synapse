import React, { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

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
  serverTimestamp,
} from "firebase/firestore";

import { flashcardsFromSet } from "../../utilities";

import { useNavigate } from "react-router-dom";

import Select from "react-select";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

import { flashcardModule } from "../../config/quill";
import styles from "./CreateFlashcards.module.css";

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
        title: setTitle,
        description: setDescription,
        tags: tagIds,
      });

      const flashcardRef = collection(db, "flashcardSets", id, "flashcards");

      // Iterate over each flashcard and update it individually
      for (const flashcard of flashcards) {
        if (flashcard.deleted) continue;

        if (flashcard.id) {
          const flashcardDocRef = doc(flashcardRef, flashcard.id);
          await updateDoc(flashcardDocRef, {
            question: flashcard.question,
            answer: flashcard.answer,
            created: flashcard.created || serverTimestamp(), // Use existing created field or server timestamp
          });
        } else {
          await addDoc(flashcardRef, {
            question: flashcard.question,
            answer: flashcard.answer,
            created: flashcard.created || serverTimestamp(), // Use existing created field or server timestamp
          });
        }
      }

      await deleteMarkedFlashcards();
      console.log("updated!");
      navigate("/mystuff/flashcards")
    } catch (err) {
      console.error("Error updating. Try again");
      console.log(err);
    }
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const addFlashcard = () => {
    const newFlashcard = {
      question: "",
      answer: "",
      created: serverTimestamp(), // Adding created field with server timestamp
    };
    setFlashcards([...flashcards, newFlashcard]);
    console.log(flashcards);
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
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Edit Flashcards</h1>
        <p className={styles.mutedText}>
          Go to{" "}
          <Link className={styles.learnLink} to="/learn/revise">
            this page{" "}
          </Link>
          to learn how to effectively revise material.
        </p>
      </div>
      <div className={styles.mainContent}>
        <form onSubmit={handleUpdateSet}>
          <div className={styles.titleTagSection}>
            <div className={styles.formGroup}>
              <label htmlFor="setTitle" className={styles.mutedText}>
                Set Title
              </label>
              <input
                type="text"
                id="setTitle"
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
                options={tagsOptions}
                isMulti
                onChange={handleTagChange}
                value={selectedTags}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                className={styles.tagsSelect}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="setDescription" className={styles.mutedText}>
              Set Description
            </label>
            <textarea
              id="setDescription"
              value={setDescription}
              onChange={(e) => setSetDescription(e.target.value)}
              placeholder="Set Description"
              required
              className={styles.descriptionInput}
            />
          </div>

          {shownCards.map((flashcard, index) => (
            <div key={flashcard.id || index} className={styles.flashcardPair}>
              <ReactQuill
                value={flashcard.question}
                onChange={(content) =>
                  handleFlashcardChange(index, "question", content)
                }
                placeholder="Question"
                theme="bubble"
                modules={flashcardModule}
              />
              <ReactQuill
                value={flashcard.answer}
                onChange={(content) =>
                  handleFlashcardChange(index, "answer", content)
                }
                placeholder="Answer"
                theme="bubble"
                modules={flashcardModule}
              />
              <button
                className={styles.removeCard}
                type="button"
                onClick={() => removeFlashcard(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addFlashcard}
            className={styles.bottomButton}
          >
            Add Flashcard
          </button>

          <button
            type="submit"
            className={`${styles.bottomButton} ${styles.createButton}`}
          >
            Update Set
          </button>
          <button
            type="button"
            onClick={deleteSet}
            className={`${styles.bottomButton} ${styles.deleteButton}`}
          >
            Delete Set
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFlashcards;
