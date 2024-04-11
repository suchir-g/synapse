import React, { useState, useEffect } from 'react';
import { db, auth } from "../../config/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Add quill styles
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { noteModule } from '../../config/quill';
import styles from "./CreateNotes.module.css";

const CreateNotes = ({ isAuth }) => {
  const navigate = useNavigate();

  const notesRef = collection(db, "notes");
  const tagsRef = collection(db, "tags");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [tags, setTags] = useState([]); // Options for react-select
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags

  if (!isAuth) { navigate("/") }

  useEffect(() => {
    // like the other files, this just populates the tags field with the actual tags so that we can query by them later 

    const fetchTags = async () => {
      const querySnapshot = await getDocs(tagsRef);
      const fetchedTags = querySnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().tagName
      }));
      setTags(fetchedTags);
    };

    fetchTags();
  }, [tagsRef]);

  const handleCreateNote = async (e) => {
    e.preventDefault();

    // like the flashcards, this trimming makes it so "" isn't allowed as the title and content.
    if (!noteTitle.trim() || !noteContent.trim()) {
      console.error("Title and content are required");
      return;
    }

    const tagIds = selectedTags.map(tag => tag.value);

    try {
      const noteDocRef = await addDoc(notesRef, {
        title: noteTitle,
        content: noteContent,
        owners: [auth.currentUser.uid],
        tags: tagIds,
        viewed: new Date() // this is a DateTime object which allows us to sort by time. I will probably do this with flashcards too.
      });

      console.log('note created with ID:', noteDocRef.id);

      // afterward we set it to blanks and navigate back to my stuff
      setNoteTitle('');
      setNoteContent('');
      navigate("/mystuff")

    } catch (err) {
      console.error("error: ", err);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.flashcard}>
        <form onSubmit={handleCreateNote}>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note Title"
            required
            className={styles.title}
          />

          <div className={styles.tagsSection}>
            <label className={styles.tagsSelectText}>Select Tags:</label>
            <Select
              options={tags}
              isMulti
              onChange={setSelectedTags}
              value={selectedTags}
              placeholder="Select tags"
            />
          </div>

          <ReactQuill
            value={noteContent}
            onChange={setNoteContent}
            placeholder="Write here!"
            required
            modules={noteModule}
          />
          <button type="submit" className={styles.editButton}>Save Note</button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotes;
