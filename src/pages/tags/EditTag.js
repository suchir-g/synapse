import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../config/firebase";
import { collection, doc, getDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import Select from 'react-select';

const EditTag = () => {
  const { tagID } = useParams();
  const navigate = useNavigate();

  const flashcardsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");
  const tagsRef = collection(db, "tags");

  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');

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
        const flashcardsQuery = query(flashcardsRef, where("tags", "array-contains", tagID));
        const notesQuery = query(notesRef, where("tags", "array-contains", tagID));

        const [flashcardsSnapshot, notesSnapshot, allFlashcardsSnapshot, allNotesSnapshot] = await Promise.all([
          getDocs(flashcardsQuery),
          getDocs(notesQuery),
          getDocs(flashcardsRef),
          getDocs(notesRef)
        ]);

        const formatOption = (doc) => ({ value: doc.id, label: doc.data().title });

        const selectedFlashcards = flashcardsSnapshot.docs.map(formatOption);
        const selectedNotes = notesSnapshot.docs.map(formatOption);

        const allFlashcardsOptions = allFlashcardsSnapshot.docs.map(formatOption);
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
      // update tag document
      const tagDocRef = doc(tagsRef, tagID);
      await updateDoc(tagDocRef, {
        tagName: tagName, // assuming title is the field name
        description: tagDescription
      });

      // watch update for flashcards and notes
      const batch = db.batch();

      selectedFlashcards.forEach(fc => {
        const flashcardDocRef = doc(flashcardsRef, fc.value);
        batch.update(flashcardDocRef, { tags: [tagID] }); // this will overwrite existing tags
      });

      selectedNotes.forEach(note => {
        const noteDocRef = doc(notesRef, note.value);
        batch.update(noteDocRef, { tags: [tagID] }); // this will overwrite existing tags
      });

      await batch.commit();

      console.log('Tag and associated items updated with ID:', tagID);
      navigate("/mystuff");
    } catch (error) {
      console.error("Error updating tag and associated items: ", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Tag Name"
          required
        />

        <input 
          type="text" 
          value={tagDescription} 
          onChange={(e) => setTagDescription(e.target.value)} 
          placeholder="Description" 
        />

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

        <button type="submit">Update Tag</button>
      </form>
    </div>
  );
};

export default EditTag;
