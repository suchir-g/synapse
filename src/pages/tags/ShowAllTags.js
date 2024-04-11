import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import styles from "./ShowAllTags.module.css"

const ShowAllTags = () => {
  const [tags, setTags] = useState([]);

  // there's two things that have to load here - auth and data. So we will keep loading for both of them

  const [isLoading, setIsLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false); // new state to track auth loading

  const navigate = useNavigate();

  useEffect(() => {
    // listener for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchTags();
      } else {
        // handle unauthenticated user
        navigate("/login");
      }
      setAuthLoaded(true);
    });

    // cleanup function - gets rid of the listener
    return () => unsubscribe();
  }, [navigate]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const tagsQuery = query(collection(db, "tags"), where("owner", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(tagsQuery);
      const fetchedTags = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTags(fetchedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authLoaded) {
    return <div>Loading authentication...</div>;
  }

  if (isLoading) {
    return <div>Loading tags...</div>;
  }
  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h1 className={styles.mainText}>All Tags</h1>
        <ul className={styles.tags}>
          {tags.map(tag => (
            <li key={tag.id} className={styles.tag}>
              <strong className={styles.tagName}>{tag.tagName}</strong>
              <span>
                <Link to={`/tags/${tag.id}`} className={`${styles.button} ${styles.view}`}>View</Link>
                <Link to={`/tags/${tag.id}/edit`} className={`${styles.button} ${styles.edit}`}>Edit</Link>
              </span>
            </li>
          ))}
        </ul>
        <Link to="/tags/post">Post</Link>
      </div>
    </div>
  );
};

export default ShowAllTags;
