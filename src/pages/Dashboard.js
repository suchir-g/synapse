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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

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
  }, []);

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
        setsSnapshot.docs.map((doc) => {
          const setData = doc.data();
          const viewedDate = setData.viewed.toDate();
          const formattedViewedDate = viewedDate.toLocaleDateString("en-US");
          return { id: doc.id, ...setData, lastRevised: formattedViewedDate };
        })
      );

      const notesQuery = query(
        collection(db, "notes"),
        where("owners", "array-contains", userId),
        orderBy("viewed", "desc"),
        limit(3)
      );
      const notesSnapshot = await getDocs(notesQuery);
      setLatestNotes(
        notesSnapshot.docs.map((doc) => {
          const noteData = doc.data();
          const viewedDate = noteData.viewed.toDate();
          const formattedViewedDate = viewedDate.toLocaleDateString("en-US");
          return { id: doc.id, ...noteData, viewed: formattedViewedDate };
        })
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
                          Last revised: {set.lastRevised}
                        </span>
                      </div>
                    </div>
                  ))}
                  <FontAwesomeIcon icon={faChevronRight} color="grey" />
                </div>
              </div>

              <div className={styles.latestNotes}>
                <h2 className={styles.latestText}>Latest Notes</h2>
                <div className={styles.gridContainer}>
                  {latestNotes.map((note) => (
                    <div key={note.id} className={styles.card}>
                      <div className={styles.cardBody}>
                        <Link
                          to={`/notes/${note.id}`}
                          className={styles.cardLink}
                        >
                          <h3>{note.title}</h3>
                        </Link>
                        <div
                          className={`${styles.cardContent}`}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeAndTruncateHtml(note.content, 20),
                          }}
                        />
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.lastRevised}>
                          Last revised: {note.viewed}
                        </span>
                      </div>
                    </div>
                  ))}
                  <FontAwesomeIcon icon={faChevronRight} color="grey" />
                </div>
              </div>
            </section>
            <Link className={styles.myStuffLink} to="/mystuff">
              My stuff
            </Link>
          </div>
        </div>
        <div className={`${styles.sidebar} col-3`}>
          <div className={styles.todoList}>
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
