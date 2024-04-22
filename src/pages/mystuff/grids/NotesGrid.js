import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { sanitizeAndTruncateHtml } from "../../../utilities";
import styles from "./NotesGrid.module.css";
import MyStuffLoadingComponent from "../MyStuffLoadingComponent";

const NotesGrid = ({ currentUserID }) => {
  const [allNotes, setAllNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesRef = collection(db, "notes");
        const notesQuery = query(
          notesRef,
          where("owners", "array-contains", currentUserID),
          orderBy("viewed", "desc"),
          limit(10)
        );
        const notesQuerySnapshot = await getDocs(notesQuery);
        const newNotes = notesQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllNotes(newNotes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching notes: ", error);
      }
    };

    fetchNotes();
  }, [currentUserID]);

  if (isLoading) {
    return <MyStuffLoadingComponent />;
  }

  return (
    <section className={styles.cards_grid}>
      {allNotes.length > 0 ? (
        allNotes.map((note, index) => (
          <Link
            to={`/notes/${note.id}`}
            key={index}
            className={styles.card_link}
          >
            <div className={styles.card}>
              <h3 className={styles.card_title}>{note.title}</h3>
              <div
                className={styles.card_content}
                dangerouslySetInnerHTML={{
                  __html: sanitizeAndTruncateHtml(note.content),
                }}
              />
            </div>
          </Link>
        ))
      ) : (
        <p>No notes found.</p>
      )}
    </section>
  );
};

export default NotesGrid;
