import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { sanitizeAndTruncateHtml } from "../../utilities";

import styles from "./ShowTag.module.css";
import LoadingComponent from "LoadingComponent";

const ShowTag = ({ isAuth }) => {
  const navigate = useNavigate();

  const { tagID } = useParams();
  const [tagData, setTagData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [relatedSets, setRelatedSets] = useState([]);
  const [relatedNotes, setRelatedNotes] = useState([]);

  const [childTags, setChildTags] = useState([]);

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        // get the tag document by ID
        const tagDocRef = doc(db, "tags", tagID);
        const tagDocSnap = await getDoc(tagDocRef);

        if (tagDocSnap.exists()) {
          const tag = tagDocSnap.data();
          setTagData(tag);

          // query flashcard sets with this tag
          const setsQuery = query(
            collection(db, "flashcardSets"),
            where("tags", "array-contains", tagID)
          );
          const setsSnapshot = await getDocs(setsQuery);
          const fetchedSets = setsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRelatedSets(fetchedSets);

          // query notes with this tag
          const notesQuery = query(
            collection(db, "notes"),
            where("tags", "array-contains", tagID)
          );
          const notesSnapshot = await getDocs(notesQuery);
          const fetchedNotes = notesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRelatedNotes(fetchedNotes);

          // fetch child tags if any
          // remember that it dosen't have to have any children (leaf node)
          if (tag.childTags) {
            const childTagsPromises = tag.childTags.map((childTagId) =>
              getDoc(doc(db, "tags", childTagId))
            );
            const childTagsDocs = await Promise.all(childTagsPromises);
            setChildTags(
              childTagsDocs
                .filter((docSnap) => docSnap.exists())
                .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            );
          }
        } else {
          console.error("Tag not found");
        }
      } catch (error) {
        console.error("Error fetching tag data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagData();
  }, [tagID]);

  const handleAddChildTag = () => {
    navigate("/tags/post", { state: { isAuth: isAuth, parentTagID: tagID } });
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!tagData) {
    navigate("/");
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h1 className={styles.tagName}>{tagData.tagName}</h1>
        {tagData.parentTag && (
          <div className={styles.parentTag}>
            Parent Tag:{" "}
            <Link to={`/tags/${tagData.parentTag}`}>Back to Parent Tag</Link>
          </div>
        )}

        <section>
          <h2 className={styles.labelText}>Flashcard Sets</h2>
          {relatedSets.length > 0 ? (
            relatedSets.map((set) => (
              <Link to={`/sets/${set.id}`}>
                <div key={set.id} className={styles.card}>
                  <h3 className={styles.title}>{set.title}</h3>
                  <p className={styles.cutoff}>{set.description}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No flashcard sets found for this tag.</p>
          )}
        </section>

        <section>
          <h2 className={styles.labelText}>Notes</h2>
          {relatedNotes.length > 0 ? (
            relatedNotes.map((note) => (
              <Link to={`/notes/${note.id}`}>
                <div key={note.id} className={styles.card}>
                  <h3 className={styles.title}>{note.title}</h3>
                  <p className={styles.cutoff}>{sanitizeAndTruncateHtml(note.content)}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No notes found for this tag.</p>
          )}
        </section>

        <section>
          <h2 className={styles.labelText}>Child Tags</h2>
          {childTags.length > 0 ? (
            childTags.map((childTag) => (
              <div key={childTag.id}>
                <Link to={`/tag/${childTag.id}`}>{childTag.tagName}</Link>
              </div>
            ))
          ) : (
            <p>No child tags found.</p>
          )}
          <span>
            <button onClick={handleAddChildTag} className={styles.addNewTag}>
              Add New Child Tag
            </button>
            <button onClick={() => {navigate(`/tags/${tagID}/edit`)}} className={styles.edit}>
              Edit
            </button>
          </span>
        </section>
      </div>
    </div>
  );
};

export default ShowTag;
