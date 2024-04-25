import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // add quill styles
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { noteModule } from "../../config/quill";

import styles from "./EditNotes.module.css";
import LoadingComponent from "LoadingComponent";

const EditNotes = ({ isAuth }) => {
  const navigate = useNavigate();
  const params = useParams();

  const noteID = params.noteID;

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [tagsOptions, setTagsOptions] = useState([]); // all available tags
  const [selectedTags, setSelectedTags] = useState([]); // selected tags for the note

  if (!isAuth) {
    navigate("/");
  }

  useEffect(() => {
    const fetchNoteAndTags = async () => {
      const noteDocRef = doc(db, "notes", noteID);
      const noteSnapshot = await getDoc(noteDocRef);

      if (!noteSnapshot.exists()) {
        console.error("Note does not exist!");
        setIsLoading(false);
        return;
      }

      const noteData = noteSnapshot.data();
      setNoteTitle(noteData.title);
      setNoteContent(noteData.content);

      // check ownership
      if (!noteData.owners.includes(auth.currentUser.uid)) {
        navigate("/mystuff");
        return;
      }

      // only getting tags that we own
      const tagsQuery = query(
        collection(db, "tags"),
        where("owner", "==", auth.currentUser.uid)
      );
      const tagsSnapshot = await getDocs(tagsQuery);
      const fetchedTags = tagsSnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().tagName,
      }));
      setTagsOptions(fetchedTags);

      // set selected tags
      const noteTags = fetchedTags.filter((tag) =>
        noteData.tags?.includes(tag.value)
      );
      setSelectedTags(noteTags);

      setIsLoading(false);
    };

    fetchNoteAndTags();
  }, [noteID, navigate]);

  const handleUpdateNote = async (e) => {
    console.log("hois");
    e.preventDefault();

    if (!noteTitle.trim() || !noteContent.trim()) {
      console.error("title and content are required");
      return;
    }

    const updatedTagIds = selectedTags.map((tag) => tag.value);

    try {
      const noteDocRef = doc(db, "notes", noteID);

      await updateDoc(noteDocRef, {
        title: noteTitle,
        content: noteContent,
        viewed: new Date(),
        tags: updatedTagIds,
      });

      console.log("note updated with ID:", noteID);
      navigate("/mystuff/notes")
    } catch (error) {
      console.error("error: ", error);
    }
  };

  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
  };

  const handleDeleteNote = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        const noteDocRef = doc(db, "notes", noteID);
        await deleteDoc(noteDocRef);
        console.log("Note deleted with ID:", noteID);
        navigate("/mystuff/notes"); // Redirect to a suitable location after deletion
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.flashcard}>
        <form onSubmit={handleUpdateNote}>
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
              options={tagsOptions}
              isMulti
              onChange={handleTagChange}
              value={selectedTags}
            />
          </div>
          <ReactQuill
            value={noteContent}
            onChange={setNoteContent}
            placeholder="Edit your note"
            modules={noteModule}
            required
          />
          <button type="submit" className={styles.editButton}>
            Update Note
          </button>
        </form>
        <button
          onClick={handleDeleteNote}
          className={`${styles.editButton} ${styles.deleteButton}`}
        >
          Delete Note
        </button>
      </div>
    </div>
  );
};

export default EditNotes;
