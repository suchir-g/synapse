import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom"; // Assuming you're using react-router for navigation
import { onAuthStateChanged } from "firebase/auth";

const WhiteboardsPage = () => {
  const [whiteboards, setWhiteboards] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchWhiteboards = async () => {
          const q = query(
            collection(db, "whiteboards"),
            where("author", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const whiteboardsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWhiteboards(whiteboardsData);
        };
        fetchWhiteboards();
      } else {
        console.log("User is not authenticated");
        setWhiteboards([]); // Clear whiteboards if no user is authenticated
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>My Whiteboards</h2>
      {whiteboards.length > 0 ? (
        <ul>
          {whiteboards.map((whiteboard) => (
            <li key={whiteboard.id}>
              {whiteboard.title} -{" "}
              <Link to={`/whiteboards/${whiteboard.id}`}>View/Edit</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No whiteboards fodund.</p>
      )}
    </div>
  );
};

export default WhiteboardsPage;
