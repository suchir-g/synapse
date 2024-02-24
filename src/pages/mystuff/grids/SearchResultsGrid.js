import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Fuse from "fuse.js";
import styles from "../../../css/grids/SearchResultsGrid.module.css";
import { sanitizeAndTruncateHtml } from "../../../utilities";

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

    const fuseOptions = {
      includeScore: true,
      threshold: 0.2,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      keys: ["title", "tagName", "description"], // Assuming description is a key you want to search through as well
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

  if (!searchQuery) {
    return <> </>;
  }

  if (isLoading) return <div>Loading...</div>;
  if (!Object.values(results).some((category) => category.length))
    return <div>No results found for "{searchQuery}"</div>;

  return (
    <div>
      {!isLoading && (
        <div className={styles.content_section}>
          {Object.entries(results).map(
            ([categoryName, items]) =>
              items.length > 0 && (
                <div key={categoryName} className={styles.category_section}>
                  <h2 className={styles.category_title}>
                    {categoryName.charAt(0).toUpperCase() +
                      categoryName.slice(1)}
                  </h2>
                  <div className={styles.category_separator}></div>
                  <div className={styles.cards_grid}>
                    {items.map((item) => (
                      <Link
                        to={`/${categoryName}/${item.id}`}
                        key={item.id}
                        className={styles.card_link}
                      >
                        <div className={styles.card}>
                          <div className={styles.card_title}>
                            {item.title || item.tagName}
                          </div>
                          {categoryName === "flashcards" &&
                            item.description && (
                              <div className={styles.card_content}>
                                {item.description}
                              </div>
                            )}
                          {categoryName === "notes" && (
                            <div className={styles.card_content}>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: sanitizeAndTruncateHtml(item.content),
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
      <br />
    </div>
  );
};

export default SearchResultsGrid;
