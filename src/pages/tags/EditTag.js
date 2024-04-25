import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Select from "react-select";

import styles from "./AddTag.module.css";

const EditTag = () => {
  const { tagID } = useParams();
  const navigate = useNavigate();

  const flashcardsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");
  const tagsRef = collection(db, "tags");

  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");

  const [availableFlashcards, setAvailableFlashcards] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);

  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tag details
        const tagDocRef = doc(tagsRef, tagID);
        const tagDocSnap = await getDoc(tagDocRef);

        if (!tagDocSnap.exists()) {
          console.error("Tag not found");
          navigate("/");
          return;
        }

        const tagData = tagDocSnap.data();
        setTagName(tagData.tagName); // assuming title is the field name
        setTagDescription(tagData.description);

        // Query flashcards and notes that have this tag
        const flashcardsQuery = query(
          flashcardsRef,
          where("tags", "array-contains", tagID)
        );
        const notesQuery = query(
          notesRef,
          where("tags", "array-contains", tagID)
        );

        const [
          flashcardsSnapshot,
          notesSnapshot,
          allFlashcardsSnapshot,
          allNotesSnapshot,
        ] = await Promise.all([
          getDocs(flashcardsQuery),
          getDocs(notesQuery),
          getDocs(flashcardsRef),
          getDocs(notesRef),
        ]);

        const formatOption = (doc) => ({
          value: doc.id,
          label: doc.data().title,
        });

        const selectedFlashcards = flashcardsSnapshot.docs.map(formatOption);
        const selectedNotes = notesSnapshot.docs.map(formatOption);

        const allFlashcardsOptions =
          allFlashcardsSnapshot.docs.map(formatOption);
        const allNotesOptions = allNotesSnapshot.docs.map(formatOption);

        setSelectedFlashcards(selectedFlashcards);
        setSelectedNotes(selectedNotes);
        setAvailableFlashcards(allFlashcardsOptions);
        setAvailableNotes(allNotesOptions);
      } catch (error) {
        console.error("Error fetching data: ", error);
        navigate("/error");
      }
    };

    fetchData();
  }, [tagID, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update tag document
      const tagDocRef = doc(tagsRef, tagID);
      await updateDoc(tagDocRef, {
        tagName: tagName,
        description: tagDescription,
      });

      // Get all flashcards
      const allFlashcardsSnapshot = await getDocs(flashcardsRef);

      // Update flashcards
      for (const fc of allFlashcardsSnapshot.docs) {
        const flashcardDocRef = doc(flashcardsRef, fc.id);
        const flashcardData = fc.data();
        const flashcardTags = flashcardData.tags || [];

        // Remove tag from every other flashcard
        if (
          flashcardTags.includes(tagID) &&
          !selectedFlashcards.find((selectedFc) => selectedFc.value === fc.id)
        ) {
          const updatedTags = flashcardTags.filter((tag) => tag !== tagID);
          await updateDoc(flashcardDocRef, { tags: updatedTags });
        }

        // Add tag to selected flashcards if it doesn't already contain the tag
        if (
          selectedFlashcards.find((selectedFc) => selectedFc.value === fc.id) &&
          !flashcardTags.includes(tagID)
        ) {
          await updateDoc(flashcardDocRef, { tags: [...flashcardTags, tagID] });
        }
      }

      // Update notes
      for (const note of selectedNotes) {
        const noteDocRef = doc(notesRef, note.value);
        const noteData = (await getDoc(noteDocRef)).data();
        const noteTags = noteData.tags || [];

        // Add tag to the note if it doesn't already contain the tag
        if (!noteTags.includes(tagID)) {
          await updateDoc(noteDocRef, { tags: [...noteTags, tagID] });
        }
      }

      console.log("Tag and associated items updated with ID:", tagID);
      // navigate("/tags");
    } catch (error) {
      console.error("Error updating tag and associated items: ", error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Edit Tag</h1>
      </div>
      <form className={styles.mainContent} onSubmit={handleSubmit}>
        <label htmlFor="title" className={styles.mutedLabel}>
          Title
        </label>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Tag Name"
          required
          id="title"
          className={`${styles.input} ${styles.title}`}
        />

        <label htmlFor="description" className={styles.mutedLabel}>
          Description
        </label>
        <input
          type="text"
          value={tagDescription}
          onChange={(e) => setTagDescription(e.target.value)}
          placeholder="Description"
          id="Description"
          className={styles.input}
        />

        <div className={styles.thing}>
          <label htmlFor="flashcards" className={styles.mutedLabel}>
            Flashcards
          </label>
          <Select
            options={availableFlashcards}
            isMulti
            onChange={setSelectedFlashcards}
            value={selectedFlashcards}
            placeholder="Select Flashcards"
            className={styles.selectMenu}
            id="flashcards"
          />
        </div>
        <div className={styles.thing}>
          <label htmlFor="notes" className={styles.mutedLabel}>
            Notes
          </label>
          <Select
            options={availableNotes}
            isMulti
            onChange={setSelectedNotes}
            value={selectedNotes}
            placeholder="Select Notes"
            className={styles.selectMenu}
            id="notes"
          />
        </div>

        <button type="submit" className={styles.endButton}>
          Update Tag
        </button>
      </form>
    </div>
  );
};

export default EditTag;
