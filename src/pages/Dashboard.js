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
import styles from "./Dashboard.module.css";

import CompactTimerPage from "./timers/CompactTimerPage";
import CompactTodoList from "./todos/CompactTodoList";
import ExamCountdown from "./exams/ExamCountdown";
import StreakDisplay from "./StreakDisplay";

const Dashboard = ({ isAuth }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSets, setLatestSets] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRevisedToday, setHasRevisedToday] = useState(false);
  const [mainTodoListId, setMainTodoListId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadData(user.uid);
        checkAndResetStreak(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
      //ghello

      const setsQuery = query(
        collection(db, "flashcardSets"),
        where("owners", "array-contains", userId),
        orderBy("viewed", "desc"),
        limit(3)
      );
      const setsSnapshot = await getDocs(setsQuery);
      setLatestSets(
        setsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const notesQuery = query(
        collection(db, "notes"),
        where("owners", "array-contains", userId),
        orderBy("viewed", "desc"),
        limit(3)
      );
      const notesSnapshot = await getDocs(notesQuery);
      setLatestNotes(
        notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const todoListsQuery = query(
        collection(db, "todoLists"),
        where("owner", "==", userId),
        where("main", "==", true),
        limit(1)
      );
      const todoListsSnapshot = await getDocs(todoListsQuery);
      if (!todoListsSnapshot.empty) {
        setMainTodoListId(todoListsSnapshot.docs[0].id);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={`${styles.dashboardContainer} container text-center`}>
      <div className="row justify-content-md-center">
        <div className={`${styles.mainContent} col-8`}>
          <div className={styles.mainSection}>
            <div className={styles.greetingSection}>
              <h1 className={styles.welcomeText}>
                Welcome, {userData ? userData.firstName : "there"}
              </h1>
              <h3 className={styles.welcomeTextSubtitle}>
                Nice to have you back.
              </h3>
            </div>
          </div>
        </div>
        <div className={`${styles.sidebar} col-4`}>
          <div className={styles.todoList}>
            <h2>Todo list</h2>
            <CompactTodoList todoID={mainTodoListId} />
          </div>
          <div className={styles.timerPage}>
            <CompactTimerPage />
          </div>
          <div className={styles.streakDisplay}>
            <StreakDisplay
              userData={userData}
              hasRevisedToday={hasRevisedToday}
            />
          </div>

          <div className={styles.examCountdown}>
            <ExamCountdown />
          </div>
          <section className={styles.latestContentSection}>
            <div className={styles.latestFlashcards}>
              <h2>Latest Flashcard Sets</h2>
              <div className={styles.gridContainer}>
                {latestSets.map((set) => (
                  <div key={set.id} className={styles.card}>
                    <Link to={`/sets/${set.id}`} className={styles.cardLink}>
                      <h3>{set.title}</h3>
                    </Link>
                    <p className={styles.cardDescription}>{set.description}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.lastRevised}>
                        Last revised: {set.lastRevised}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.latestNotes}>
              <h2>Latest Notes</h2>
              <div className={styles.gridContainer}>
                {latestNotes.map((note) => (
                  <div key={note.id} className={styles.card}>
                    <Link to={`/notes/${note.id}`} className={styles.cardLink}>
                      <h3>{note.title}</h3>
                    </Link>
                    <div
                      className={styles.cardContent}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeAndTruncateHtml(note.content),
                      }}
                    />
                    <div className={styles.cardFooter}>
                      <span className={styles.lastRevised}>
                        Last revised: {note.lastRevised}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
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
