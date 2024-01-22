import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // add quill styles
import { useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';
import { module } from '../../config/quill';
const EditNotes = ({ isAuth }) => {
  const navigate = useNavigate();
  const params = useParams();
  console.log(params);

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
      const tagsQuery = query(collection(db, "tags"), where("owner", "==", auth.currentUser.uid));
      const tagsSnapshot = await getDocs(tagsQuery);
      const fetchedTags = tagsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().tagName,
      }));
      setTagsOptions(fetchedTags);

      // Set selected tags
      const noteTags = fetchedTags.filter(tag => noteData.tags?.includes(tag.value));
      setSelectedTags(noteTags);

      setIsLoading(false);
    };

    fetchNoteAndTags();
  }, [noteID, navigate]);

  const handleUpdateNote = async (e) => {
    e.preventDefault();

    if (!noteTitle.trim() || !noteContent.trim()) {
      console.error("title and content are required");
      return;
    }

    const updatedTagIds = selectedTags.map(tag => tag.value);

    try {
      const noteDocRef = doc(db, "notes", noteID);

      await updateDoc(noteDocRef, {
        title: noteTitle,
        content: noteContent,
        viewed: new Date(),
        tags: updatedTagIds,
      });

      console.log("note updated with ID:", noteID);
    } catch (error) {
      console.error("error: ", error);
    }
  };

  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleUpdateNote}>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Note Title"
          required
        />
        <div>
          <label>Select Tags:</label>
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
          modules={module}
          required
        />
        <button type="submit">Update Note</button>
      </form>
    </div>
  );
};

export default EditNotes;
