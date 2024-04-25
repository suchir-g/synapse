import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import styles from "./AddTag.module.css";

const AddTag = ({ parentTagID }) => {
  const navigate = useNavigate();
  const tagsRef = collection(db, "tags");
  const flashcardsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");

  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [availableFlashcards, setAvailableFlashcards] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState(
    parentTagID || null
  );
  const [isAuth, setIsAuth] = useState(false); // State to track authentication status

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuth(true); // Set authentication status to true if user is authenticated
      } else {
        setIsAuth(false); // Set authentication status to false if user is not authenticated
        navigate("/"); // Redirect to home page if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the subscription when component unmounts
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUserUid = auth.currentUser.uid;

      // Fetch tags owned by the current user
      const tagsQuery = query(tagsRef, where("owner", "==", currentUserUid));
      const tagsSnapshot = await getDocs(tagsQuery);
      const tagsOptions = tagsSnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().tagName,
      }));
      setAvailableTags(tagsOptions);

      // Fetch flashcards owned by the current user
      const flashcardsQuery = query(
        flashcardsRef,
        where("owners", "array-contains", currentUserUid)
      );

      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      const flashcardsOptions = flashcardsSnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().title,
      }));
      setAvailableFlashcards(flashcardsOptions);

      // Fetch notes owned by the current user
      const notesQuery = query(
        notesRef,
        where("owners", "array-contains", currentUserUid)
      );
      const notesSnapshot = await getDocs(notesQuery);
      const notesOptions = notesSnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().title,
      }));
      setAvailableNotes(notesOptions);
    };

    if (isAuth) {
      fetchData();
    }
  }, [isAuth, tagsRef, flashcardsRef, notesRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTagData = {
        tagName,
        description: tagDescription,
        owner: auth.currentUser.uid,
      };
      if (selectedParentTag) {
        newTagData.parentTag = selectedParentTag.value;
      }
      const newTagRef = await addDoc(tagsRef, newTagData);

      if (selectedParentTag) {
        const parentTagRef = doc(db, "tags", selectedParentTag.value);
        await updateDoc(parentTagRef, {
          childTags: arrayUnion(newTagRef.id),
        });
      }

      await Promise.all(
        selectedFlashcards.map(async (flashcard) => {
          const flashcardRef = doc(db, "flashcardSets", flashcard.value);
          await updateDoc(flashcardRef, {
            tags: arrayUnion(newTagRef.id),
          });
        })
      );

      await Promise.all(
        selectedNotes.map(async (note) => {
          const noteRef = doc(db, "notes", note.value);
          await updateDoc(noteRef, {
            tags: arrayUnion(newTagRef.id),
          });
        })
      );

      navigate("/tags");
    } catch (error) {
      console.error(
        "Error creating new tag or updating flashcards/notes: ",
        error
      );
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Add Tag</h1>
      </div>
      <form className={styles.mainContent} onSubmit={handleSubmit}>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Tag Name"
          required
          className={`${styles.input} ${styles.title}`}
        />

        <input
          type="text"
          value={tagDescription}
          onChange={(e) => setTagDescription(e.target.value)}
          placeholder="Description"
          className={styles.input}
        />

        <Select
          options={availableTags}
          onChange={setSelectedParentTag}
          value={selectedParentTag}
          placeholder="Select Parent Tag"
          className={styles.selectMenu}
        />

        <Select
          options={availableFlashcards}
          isMulti
          onChange={setSelectedFlashcards}
          value={selectedFlashcards}
          placeholder="Select Flashcards"
          className={styles.selectMenu}
        />

        <Select
          options={availableNotes}
          isMulti
          onChange={setSelectedNotes}
          value={selectedNotes}
          placeholder="Select Notes"
          className={styles.selectMenu}
        />

        <button type="submit" className={styles.button}>Create Tag</button>
      </form>
    </div>
  );
};

export default AddTag;
