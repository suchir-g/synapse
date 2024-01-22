import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

import DOMPurify from "dompurify";

const ShowNotes = () => {
  const [note, setNote] = useState(null);
  const [tags, setTags] = useState([]); // State for tags
  const [isLoading, setIsLoading] = useState(true);
  const { noteID } = useParams();
  const navigate = useNavigate();

  const sanitizeHtml = (htmlContent) => {
    return DOMPurify.sanitize(htmlContent); // sanitize and return
  };

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const noteDocRef = doc(db, "notes", noteID);
        const noteSnapshot = await getDoc(noteDocRef);

        if (noteSnapshot.exists()) {
          const noteData = noteSnapshot.data();
          setNote(noteData);

          // this is making it so the last viewed time is set properly, but ONLY if the viewer is the owner.
          // this stops random people from setting the last viewed time.
          if (noteData.owners.includes(auth.currentUser.uid)) {
            await updateDoc(noteDocRef, {
              viewed: new Date(),
            });
          }

          // this bit is fetching the tag data
          // fetch each tag associated with the note
          if (noteData.tags && noteData.tags.length > 0) {
            const tagPromises = noteData.tags.map((tagId) =>
              getDoc(doc(db, "tags", tagId))
            );
            const tagDocs = await Promise.all(tagPromises);
            const fetchedTags = tagDocs
              .filter((doc) => doc.exists())
              .map((doc) => ({
                id: doc.id, // get tag ID
                tagName: doc.data().tagName, // get tag name
              }));
            setTags(fetchedTags);
          }
        } else {
          console.error("Note does not exist!");
        }
      } catch (error) {
        console.error("Error fetching note: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteID]);

  // navigating to the edit page
  const handleEdit = () => {
    navigate(`/notes/${noteID}/edit`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div>
      <h1>{note.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(note.content),
        }}
      />
      {tags.length > 0 && (
        <div>
          <hr />
          <strong>Tags: </strong>
          {tags.map((tag, index) => (
            <span key={index}>
              <Link to={`/tags/${tag.id}`}>{tag.tagName}</Link>
              {/* some short circuiting to make a list - i never knew how useful this is until now */}
              {index < tags.length - 1 ? ", " : ""}
            </span>
          ))}
          <hr />
        </div>
      )}
      <button onClick={handleEdit}>Edit Note</button>
    </div>
  );
};

export default ShowNotes;
