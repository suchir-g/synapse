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
import styles from "./FlashcardGrid.module.css"

import { db } from "../../../config/firebase";
import MyStuffLoadingComponent from "../MyStuffLoadingComponent";
export const FlashcardGrid = ({ currentUserID }) => {
  const [allSets, setAllSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const setsRef = collection(db, "flashcardSets");
        const setsQuery = query(
          setsRef,
          where("owners", "array-contains", currentUserID),
          orderBy("viewed", "desc"),
          limit(10)
        );
        const setsQuerySnapshot = await getDocs(setsQuery);
        const newSets = setsQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllSets(newSets);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching flashcard sets: ", error);
      }
    };

    fetchSets();
  }, [currentUserID]);

  if (isLoading) {
    return <MyStuffLoadingComponent />;
  }

  return (
    <section className={styles.cards_grid}>
      {allSets.length > 0 ? (
        allSets.map((set, index) => (
          <Link to={`/sets/${set.id}`} key={index} className={styles.card_link}>
            <div className={styles.card}>
              <h3 className={styles.card_title}>{set.title}</h3>
              <p className={styles.card_content}>{set.description}</p>
            </div>
          </Link>
        ))
      ) : (
        <p>No flashcard sets found.</p>
      )}
    </section>
  );
};

export default FlashcardGrid;
