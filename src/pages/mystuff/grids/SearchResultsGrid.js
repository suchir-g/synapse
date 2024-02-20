import React, { useEffect, useState } from "react";
import { auth, db } from "../../../config/firebase"; // Ensure you import auth if you're getting the user ID here
import { collection, query, where, getDocs } from "firebase/firestore";

const SearchResultsGrid = ({ searchQuery, currentUserID }) => {
  const [results, setResults] = useState({
    flashcards: [],
    tags: [],
    notes: [],
    whiteboards: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim() || !currentUserID) return;

      setIsLoading(true);
      console.log(currentUserID, searchQuery);

      const flashcardsQuery = query(
        collection(db, "flashcardSets"),
        where("title", "==", searchQuery),
        where("owners", "array-contains", currentUserID)
      );
      const tagsQuery = query(
        collection(db, "tags"),
        where("tagName", "==", searchQuery),
        where("owner", "==", currentUserID)
      );
      const notesQuery = query(
        collection(db, "notes"),
        where("title", "==", searchQuery),
        where("owners", "array-contains", currentUserID)
      );
      const whiteboardsQuery = query(
        collection(db, "whiteboards"),
        where("title", "==", searchQuery),
        where("author", "==", currentUserID)
      );

      // Fetch results
      const fetchCategory = async (query) => {
        const querySnapshot = await getDocs(query);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      };

      const [flashcardsResults, tagsResults, notesResults, whiteboardsResults] =
        await Promise.all([
          fetchCategory(flashcardsQuery),
          fetchCategory(tagsQuery),
          fetchCategory(notesQuery),
          fetchCategory(whiteboardsQuery),
        ]);

      console.log(
        flashcardsResults,
        tagsResults,
        notesResults,
        whiteboardsResults
      );
      setResults({
        flashcards: flashcardsResults,
        tags: tagsResults,
        notes: notesResults,
        whiteboards: whiteboardsResults,
      });
      setIsLoading(false);
    };

    fetchResults();
  }, [searchQuery, currentUserID]);

  /* Hlloe */

  if (isLoading) return <div>Loading...</div>;
  if (!Object.values(results).some((category) => category.length))
    return <div>No results found for "{searchQuery}"</div>;

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {!isLoading &&
        Object.values(results).every((category) => category.length === 0) && (
          <div>No results found for "{searchQuery}"</div>
        )}

      {!isLoading && (
        <div>
          {/* Flashcards */}
          {results.flashcards.length > 0 && (
            <div>
              <h2>Flashcards</h2>
              <ul>
                {results.flashcards.map((flashcard) => (
                  <li key={flashcard.id}>
                    <strong>Title:</strong> {flashcard.title}
                    {/* Include other details you might want to show */}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <div>
              <h2>Tags</h2>
              <ul>
                {results.tags.map((tag) => (
                  <li key={tag.id}>
                    <strong>Tag:</strong> {tag.tagName}
                    {/* Include other details you might want to show */}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <h2>Notes</h2>
              <ul>
                {results.notes.map((note) => (
                  <li key={note.id}>
                    <strong>Title:</strong> {note.title}
                    {/* Include other details you might want to show */}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Whiteboards */}
          {results.whiteboards.length > 0 && (
            <div>
              <h2>Whiteboards</h2>
              <ul>
                {results.whiteboards.map((whiteboard) => (
                  <li key={whiteboard.id}>
                    <strong>Title:</strong> {whiteboard.title}
                    {/* Include other details you might want to show */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsGrid;
