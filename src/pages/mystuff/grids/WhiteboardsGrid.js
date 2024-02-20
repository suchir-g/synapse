import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, getDocs, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import styles from "../../../css/grids/WhiteboardsGrid.module.css";

const WhiteboardsGrid = () => {
  const [whiteboards, setWhiteboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    <section className={styles.whiteboards_grid_container}>
      {whiteboards.length > 0 ? (
        <div className={styles.whiteboards_grid}>
          {whiteboards.map((whiteboard) => (
            <Link
              to={`/whiteboards/${whiteboard.id}`}
              key={whiteboard.id}
              className={styles.whiteboard_card}
            >
              <div>
                <h3>{whiteboard.title}</h3>
                {/* Display the image in a smaller size */}
                {whiteboard.downloadURL && (
                  <img
                    src={whiteboard.downloadURL}
                    alt="Preview"
                    style={{ width: "100%", height: "auto" }} // Adjust size as needed
                    className={styles.whiteboard_preview_image}
                  />
                )}
                <p>View/Edit</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No whiteboards found.</p>
      )}
      <button
        onClick={() => navigate("/whiteboards/post")}
        className={styles.create_whiteboard_btn}
      >
        Create Whiteboard
      </button>
    </section>
  );
};

export default WhiteboardsGrid;
