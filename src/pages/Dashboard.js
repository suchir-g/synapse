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
} from "firebase/firestore";
import { sanitizeAndTruncateHtml } from "../utilities";
import { checkAndResetStreak } from "../UpdateStreak";
import styles from "../css/Dashboard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

const Dashboard = ({ isAuth }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSets, setLatestSets] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRevisedToday, setHasRevisedToday] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadData(user.uid);
        checkAndResetStreak(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe(); // remember to unsubscribe on component unmount
  }, [navigate]); // Consider adding all dependencies here

  const checkRevisionStatus = (lastRevised) => {
    if (!lastRevised) return;
    const lastRevisedDate = lastRevised.toDate(); // Assuming lastRevised is a Firestore Timestamp
    const today = new Date();
    const revisedToday =
      lastRevisedDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
    setHasRevisedToday(revisedToday);
  };

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
        const userData = userDoc.data();
        setUserData(userData);
        checkRevisionStatus(userData.lastRevisionDate);
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
    <div className={styles.dashboardContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.title}>
          Hello, {userData ? userData.firstName : "there"}!
        </h1>
        {userData && (
          <div className={styles.streakDisplay}>
            <FontAwesomeIcon icon={faFire} />
            <span className="streakCount">{userData.streak}</span>
          </div>
        )}
        <h2>You have {hasRevisedToday ? "" : "not "}revised today.</h2>
      </div>
      <div className={styles.flexRow}>
        <div className={`${styles.flexItem} ${styles.flashcards}`}>
          <h2>Latest Flashcard Sets</h2>
          {latestSets.map((set) => (
            <div key={set.id} className={styles.card}>
              <h3>
                <Link to={`/sets/${set.id}`} className={styles.cardLink}>
                  {set.title}
                </Link>
              </h3>
              <p className={styles.cardDescription}>{set.description}</p>
            </div>
          ))}
        </div>
        <div className={`${styles.flexItem} ${styles.notes}`}>
          <h2>Latest Notes</h2>
          {latestNotes.map((note) => (
            <div key={note.id} className={styles.card}>
              <h3>
                <Link to={`/notes/${note.id}`} className={styles.cardLink}>
                  {note.title}
                </Link>
              </h3>
              <div
                className={styles.cardContent}
                dangerouslySetInnerHTML={{
                  __html: sanitizeAndTruncateHtml(note.content),
                }} // Assuming content is safe and sanitized
              ></div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <button className={styles.button} onClick={() => navigate("/mystuff")}>
          Go to My Stuff
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
