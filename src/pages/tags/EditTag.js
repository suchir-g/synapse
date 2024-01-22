import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from "../../config/firebase";
import { collection, doc, getDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import Select from 'react-select';

const EditTag = () => {
  const { tagID } = useParams();
  const navigate = useNavigate();

  const flashcardsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");

  const [tagName, setTagName] = useState('');
  const [tagDescription, setTagDescription] = useState('');

  const [availableFlashcards, setAvailableFlashcards] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);

  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch tag details
        const tagDocRef = doc(db, "tags", tagID);
        const tagDocSnap = await getDoc(tagDocRef);
  
        if (!tagDocSnap.exists() || tagDocSnap.data().owner !== auth.currentUser.uid) {
          navigate("/");
          return;
        }
  
        const tagData = tagDocSnap.data();
        setTagName(tagData.tagName);
        setTagDescription(tagData.description);
  
        // query flashcards and notes that have this tag
        const flashcardsQuery = query(flashcardsRef, where("tags", "array-contains", tagID));
        const notesQuery = query(notesRef, where("tags", "array-contains", tagID));
  
        const [flashcardsSnapshot, notesSnapshot] = await Promise.all([
          getDocs(flashcardsQuery),
          getDocs(notesQuery)
        ]);
  
        const formatOption = (doc) => ({ value: doc.id, label: doc.data().title });
  
        const selectedFlashcards = flashcardsSnapshot.docs.map(formatOption);
        const selectedNotes = notesSnapshot.docs.map(formatOption);
  
        setSelectedFlashcards(selectedFlashcards);
        setSelectedNotes(selectedNotes);
  
        // fetch all flashcards and notes options for the Select components
        const allFlashcardsSnapshot = await getDocs(flashcardsRef);
        const allNotesSnapshot = await getDocs(notesRef);
  
        const allFlashcardsOptions = allFlashcardsSnapshot.docs.map(formatOption);
        const allNotesOptions = allNotesSnapshot.docs.map(formatOption);
  
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
      const tagDoc = doc(db, "tags", tagID);
      await updateDoc(tagDoc, {
        tagName,
        flashcardSets: selectedFlashcards.map(fc => fc.value),
        notes: selectedNotes.map(note => note.value),
        description: tagDescription
      });

      console.log('Tag updated with ID:', tagID);
      navigate("/mystuff");
    } catch (error) {
      console.error("Error updating tag: ", error);
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
