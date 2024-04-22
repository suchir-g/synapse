import React, { useState, useEffect } from 'react';
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

import styles from "./AddTag.module.css"

const AddTag = ({isAuth, parentTagID}) => {
  const navigate = useNavigate();
  const tagsRef = collection(db, "tags");
  const flashcardsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");

  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState("")

  const [availableTags, setAvailableTags] = useState([]);
  const [availableFlashcards, setAvailableFlashcards] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);

  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  const [selectedParentTag, setSelectedParentTag] = useState(parentTagID || null);
  
  if (!isAuth) {navigate("/")}


  useEffect(() => {
    const fetchData = async () => {
      const currentUserUid = auth.currentUser.uid; // Get the current user's UID
  
      // fetch tags owned by the current user
      const tagsQuery = query(tagsRef, where("owner", "==", currentUserUid));
      const tagsSnapshot = await getDocs(tagsQuery);
      const tagsOptions = tagsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().tagName
      }));
      setAvailableTags(tagsOptions);
  
      // fetch flashcards owned by the current user
      const flashcardsQuery = query(flashcardsRef, where("owner", "==", currentUserUid));
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      const flashcardsOptions = flashcardsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().title
      }));
      setAvailableFlashcards(flashcardsOptions);
  
      // fetch notes owned by the current user
      const notesQuery = query(notesRef, where("owner", "==", currentUserUid));
      const notesSnapshot = await getDocs(notesQuery);
      const notesOptions = notesSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().title
      }));
      setAvailableNotes(notesOptions);
    };
  
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    // add new tag document
    const newTagData = {
      tagName,
      description: tagDescription,
      owner: auth.currentUser.uid
    };
    if (selectedParentTag) {
      newTagData.parentTag = selectedParentTag.value; // add parent tag reference so we can have a tree
    }
    const newTagRef = await addDoc(tagsRef, newTagData);

    console.log('New tag created with ID:', newTagRef.id);

    // if there is a selected parent tag, update its childTags field
    if (selectedParentTag) {
      const parentTagRef = doc(db, "tags", selectedParentTag.value);
      await updateDoc(parentTagRef, {
        childTags: arrayUnion(newTagRef.id) // adds the new tag ID to the parent tag's childTags using arrayUnion
      });
    }
  
      // update selected flashcards with the new tag
      await Promise.all(selectedFlashcards.map(async (flashcard) => {
        const flashcardRef = doc(db, "flashcardSets", flashcard.value);
        await updateDoc(flashcardRef, {
          tags: arrayUnion(newTagRef.id) // this updates the "tags" in every note
        });
      }));
  
      // update selected notes with the new tag
      await Promise.all(selectedNotes.map(async (note) => {
        const noteRef = doc(db, "notes", note.value);
        await updateDoc(noteRef, {
          tags: arrayUnion(newTagRef.id) // this updates the "tags" in every note
        });
      }));
  
      navigate("/mystuff");
    } catch (error) {
      console.error("Error creating new tag or updating flashcards/notes: ", error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Tag Name"
          required
        />

        <input type="text" value={tagDescription} onChange={(e) => setTagDescription(e.target.value)} placeholder='Description'/>

        {/* dropdown to select parent tag */}
        <Select
          options={availableTags}
          onChange={setSelectedParentTag}
          value={selectedParentTag}
          placeholder="Select Parent Tag"
        />

        {/* dropdowns to select flashcards and notes */}
        <Select
          options={availableFlashcards}
          isMulti
          onChange={setSelectedFlashcards}
          value={selectedFlashcards}
          placeholder="Select Flashcards"
        />

        <Select
          options={availableNotes}
          isMulti
          onChange={setSelectedNotes}
          value={selectedNotes}
          placeholder="Select Notes"
        />

        <button type="submit">Create Tag</button>
      </form>
    </div>
  );
};

export default AddTag;
