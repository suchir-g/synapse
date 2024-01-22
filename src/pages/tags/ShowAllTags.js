import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
    <div>
      <h1>All Tags</h1>
      <ul>
        {tags.map(tag => (
          <li key={tag.id}>
            <strong>{tag.tagName}</strong> - 
            <Link to={`/tags/${tag.id}`}>View</Link> | 
            <Link to={`/tags/${tag.id}/edit`}>Edit</Link> 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowAllTags;
