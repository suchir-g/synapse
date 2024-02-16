import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { sanitizeAndTruncateHtml } from "../utilities";

const Dashboard = ({ isAuth }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSets, setLatestSets] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // user is signed in.
        loadData(user.uid);
      } else {
        // no user is signed in.
        navigate("/login");
      }
    });

    return () => unsubscribe(); // remember to unsubscribe on component unmount
  }, [navigate]);

  const loadData = async (userId) => {
    setIsLoading(true);
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("userID", "==", userId)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        setUserData(userDoc.data());
      }
      const setsQuery = query(
        collection(db, "flashcardSets"),
        where("owners", "array-contains", userId),
        orderBy("viewed", "desc"),
        limit(5)
      );
      const setsSnapshot = await getDocs(setsQuery);
      setLatestSets(
        setsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const notesQuery = query(
        collection(db, "notes"),
        where("owners", "array-contains", userId),
        orderBy("viewed", "desc"),
        limit(5)
      );
      const notesSnapshot = await getDocs(notesQuery);
      setLatestNotes(
        notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Hello, {userData ? userData.username : "there"}!</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row", // ensures the children are in a row
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: 1, marginRight: "10px" }}>
          {" "}
          <h2>Latest Flashcard Sets</h2>
          {latestSets.map((set) => (
            <div key={set.id}>
              <h3>
                <Link to={`/sets/${set.id}`}>{set.title}</Link>
              </h3>
              <p>{set.description}</p>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {" "}
          {/* added flex: 1 to take up the remaining space */}
          <h2>Latest Notes</h2>
          {latestNotes.map((note) => (
            <div key={note.id}>
              <h3>
                <Link to={`/notes/${note.id}`}>{note.title}</Link>
              </h3>
              {/* render a preview of the note content using the sanitizeAndTruncateHtml function from the utility function */}
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeAndTruncateHtml(note.content),
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <button onClick={() => navigate("/mystuff")}>Go to My Stuff</button>
      </div>
    </div>
  );
};

export default Dashboard;
