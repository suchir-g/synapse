import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, getDocs, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import styles from "./CompactWhiteboardGrid.module.css"; // Path to the new CSS file

const CompactWhiteboardGrid = () => {
  const [whiteboards, setWhiteboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWhiteboards(user.uid);
      } else {
        console.log("User is not authenticated");
        setWhiteboards([]);
        setIsLoading(false);
      }
    });

    const fetchWhiteboards = async (userId) => {
      try {
        const q = query(
          collection(db, "whiteboards"),
          where("author", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const whiteboardsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWhiteboards(whiteboardsData);
      } catch (error) {
        console.error("Error fetching whiteboards: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading whiteboards...</div>;
  }

  return (
    <section className={styles.compact_whiteboards_grid_container}>
      Latest Whiteboards
      {whiteboards.length > 0 ? (
        <div className={styles.compact_whiteboards_grid}>
          {whiteboards.map((whiteboard) => (
            <Link
              to={`/whiteboards/${whiteboard.id}`}
              key={whiteboard.id}
              className={styles.compact_whiteboard_card}
            >
              <div className={styles.card_content}>
                <h3>{whiteboard.title}</h3>
                {whiteboard.downloadURL && (
                  <img
                    src={whiteboard.downloadURL}
                    alt="Preview"
                    className={styles.compact_whiteboard_preview_image}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No whiteboards found.</p>
      )}
    </section>
  );
};

export default CompactWhiteboardGrid;
