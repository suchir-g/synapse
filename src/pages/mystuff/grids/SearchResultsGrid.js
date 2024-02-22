import React, { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Fuse from "fuse.js";
import styles from "../../../css/grids/SearchResultsGrid.module.css";

const SearchResultsGrid = ({ searchQuery, currentUserID }) => {
  const [data, setData] = useState({
    flashcards: [],
    tags: [],
    notes: [],
    whiteboards: [],
  });
  const [results, setResults] = useState({
    flashcards: [],
    tags: [],
    notes: [],
    whiteboards: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Define your queries here, just like before but without the searchQuery
      const queries = {
        flashcardsQuery: query(
          collection(db, "flashcardSets"),
          where("owners", "array-contains", currentUserID)
        ),
        tagsQuery: query(
          collection(db, "tags"),
          where("owner", "==", currentUserID)
        ),
        notesQuery: query(
          collection(db, "notes"),
          where("owners", "array-contains", currentUserID)
        ),
        whiteboardsQuery: query(
          collection(db, "whiteboards"),
          where("author", "==", currentUserID)
        ),
      };

      // Fetch data for each category
      const fetchDataForCategory = async (q) => {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      };

      const [flashcards, tags, notes, whiteboards] = await Promise.all([
        fetchDataForCategory(queries.flashcardsQuery),
        fetchDataForCategory(queries.tagsQuery),
        fetchDataForCategory(queries.notesQuery),
        fetchDataForCategory(queries.whiteboardsQuery),
      ]);

      setData({
        flashcards,
        tags,
        notes,
        whiteboards,
      });
      setIsLoading(false);
    };

    fetchData();
  }, [currentUserID]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(data);
      return;
    }

    // Initialize Fuse.js for each category with options tailored to your data structure and needs
    const fuseOptions = {
      includeScore: true,
      threshold: 0.2, // Lower this for stricter matching
      location: 0,
      distance: 100,
      minMatchCharLength: 2, // Adjust as needed
      keys: [
        {
          name: "title",
          weight: 0.7,
        },
        {
          name: "tagName",
          weight: 0.7,
        },
      ],
    };

    const searchInCategory = (items) =>
      new Fuse(items, fuseOptions).search(searchQuery).map((item) => item.item);

    setResults({
      flashcards: searchInCategory(data.flashcards),
      tags: searchInCategory(data.tags),
      notes: searchInCategory(data.notes),
      whiteboards: searchInCategory(data.whiteboards),
    });
  }, [searchQuery, data]);

  if (isLoading) return <div>Loading...</div>;
  if (!Object.values(results).some((category) => category.length))
    return <div>No results found for "{searchQuery}"</div>;

  if (!searchQuery) {
    return <></>;
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {!isLoading &&
        Object.values(results).every((category) => category.length === 0) && (
          <div>No results found for "{searchQuery}"</div>
        )}

      {!isLoading && (
        <div className={styles.content_section}>
          {/* Flashcards */}
          {results.flashcards.length > 0 && (
            <div>
              <h2>Flashcards</h2>
              <div className={styles.cards_grid}>
                {results.flashcards.map((flashcard) => (
                  <div key={flashcard.id} className={styles.card}>
                    <div className={styles.card_title}>{flashcard.title}</div>
                    {/* Include other details you might want to show */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <div>
              <h2>Tags</h2>
              <div className={styles.cards_grid}>
                {results.tags.map((tag) => (
                  <div key={tag.id} className={styles.card}>
                    <div className={styles.card_title}>{tag.tagName}</div>
                    {/* Include other details you might want to show */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <h2>Notes</h2>
              <div className={styles.cards_grid}>
                {results.notes.map((note) => (
                  <div key={note.id} className={styles.card}>
                    <div className={styles.card_title}>{note.title}</div>
                    {/* Include other details you might want to show */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Whiteboards */}
          {results.whiteboards.length > 0 && (
            <div>
              <h2>Whiteboards</h2>
              <div className={styles.cards_grid}>
                {results.whiteboards.map((whiteboard) => (
                  <div key={whiteboard.id} className={styles.card}>
                    <div className={styles.card_title}>{whiteboard.title}</div>
                    {/* Include other details you might want to show */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <br />
    </div>
  );
};

export default SearchResultsGrid;
