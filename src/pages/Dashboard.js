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
import { CollectionsBookmarkOutlined } from "@mui/icons-material";

const Dashboard = ({ isAuth }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSets, setLatestSets] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRevisedToday, setHasRevisedToday] = useState(false);
  const [mainTodoListId, setMainTodoListId] = useState(null);
  const [revisionSetsDueToday, setRevisionSetsDueToday] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadData(user.uid);
        checkAndResetStreak(user.uid);
      } else {
        navigate("/login");
      }
    });

    loadRevisionsDueToday();
    return () => unsubscribe();
  }, []);

  const isRevisionDueToday = (revisionDates) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    return revisionDates.includes(dateString);
  };

  const loadRevisionsDueToday = async (userId) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    // Query revisionSchedules where today's date is within the revisionDates array
    const revisionSchedulesQuery = query(
      collection(db, "revisionSchedules"),
      where(`revisionDates`, "array-contains", dateString)
    );
    const querySnapshot = await getDocs(revisionSchedulesQuery);

    const revisionsDueToday = [];
    querySnapshot.forEach((doc) => {
      revisionsDueToday.push({ id: doc.id, ...doc.data() });
    });

    setRevisionSetsDueToday(revisionsDueToday);
  };

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
  const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate(); // Converts the Timestamp to a JavaScript Date object
    const day = date.getDate().toString().padStart(2, "0"); // Ensures the day is two digits
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed, plus ensures two digits
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Concatenates in "dd-mm-yyyy" format
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={`${styles.dashboardContainer} container text-center`}>
      <div className="row justify-content-md-center py-5 mx-0">
        <div className={`${styles.mainContent} col-9`}>
          <div className={styles.mainSection}>
            <div className={styles.greetingSection}>
              <h1 className={styles.welcomeText}>
                Welcome, {userData ? userData.firstName : "there"}
              </h1>
              <h3 className={styles.welcomeTextSubtitle}>
                Nice to have you back.
              </h3>
            </div>
            <section className={styles.contentSection}>
              <div className={styles.revisionsDueTodaySection}>
                <h2>Revisions Due Today</h2>
                <div className={styles.gridContainer}>
                  {revisionSetsDueToday.map((set) => (
                    <div key={set.id} className={styles.card}>
                      <div className={styles.cardBody}>
                        <Link
                          to={`/sets/${set.flashcardId}`}
                          className={styles.cardLink}
                        >
                          <h3>Revision: {set.flashcardId}</h3>
                        </Link>
                        <p className={styles.cardDescription}>
                          Number of Revisions: {set.numberOfRevisions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.latestFlashcards}>
                <h2 className={styles.latestText}>Latest Flashcard Sets</h2>
                <div className={styles.gridContainer}>
                  {latestSets.map((set) => (
                    <div key={set.id} className={styles.card}>
                      <div className={styles.cardBody}>
                        <Link
                          to={`/sets/${set.id}`}
                          className={styles.cardLink}
                        >
                          <h3>{set.title}</h3>
                        </Link>
                        <p className={styles.cardDescription}>
                          {set.description}
                        </p>
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.lastRevised}>
                          Last revised: {set.revised}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.latestNotes}>
                <h2 className={styles.latestText}>Latest Notes</h2>
                <div className={styles.gridContainer}>
                  {latestNotes.map((note) => (
                    <div key={note.id} className={styles.card}>
                      <div className={styles.cardMainSection}>
                        <Link
                          to={`/notes/${note.id}`}
                          className={styles.cardLink}
                        >
                          <h3>{note.title}</h3>
                        </Link>
                        <div
                          className={`${styles.cardDescription}`}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeAndTruncateHtml(note.content, 20),
                          }}
                        />
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.lastRevised}>
                          Last revised: {formatFirestoreTimestamp(note.viewed)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className={`${styles.sidebar} col-3`}>
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
