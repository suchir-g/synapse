import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

const TagsGrid = () => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false); // keep track of auth loading

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTags();
      }
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const tagsQuery = query(
        collection(db, "tags"),
        where("owner", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(tagsQuery);
      const fetchedTags = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTags(fetchedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="cards-grid">
      {tags.length > 0 ? (
        tags.map((tag) => (
          <Link to={`/tags/${tag.id}`} key={tag.id} className="card-link">
            <div className="card">
              <h3 className="card-title">{tag.tagName}</h3>
            </div>
          </Link>
        ))
      ) : (
        <p>No tags found.</p>
      )}
    </section>
  );
};

export default TagsGrid;
