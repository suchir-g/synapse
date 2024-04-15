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
import { checkAndResetStreak } from "../UpdateStreak";
import styles from "./Dashboard.module.css";

import CompactTimerPage from "./timers/CompactTimerPage";
import CompactTodoList from "./todos/CompactTodoList";
import ExamCountdown from "./exams/ExamCountdown";
import StreakDisplay from "./StreakDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import LoadingComponent from "LoadingComponent";

const Dashboard = ({ isAuth }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [latestSets, setLatestSets] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRevisedToday, setHasRevisedToday] = useState(false);
  const [mainTodoListId, setMainTodoListId] = useState(null);
  const [setsToReviseToday, setSetsToReviseToday] = useState([]);
  const [greetingMessage, setGreetingMessage] = useState("Nice to have you back.")
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadData(user.uid);
        checkAndResetStreak(user.uid);
        fetchRevisionSchedules(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const date = new Date();
    const hours = date.getHours();

    let timeOfDay = 2
    if (hours < 12) {
      timeOfDay = 'morning';
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'night';
    }
    setGreetingMessage(`Good ${timeOfDay}`)
  })

  const fetchRevisionSchedules = async (currentUserID) => {
    const todayStr = new Date().toISOString().split("T")[0]; // format today's date as YYYY-MM-DD

    const revisionScheduleDocRef = doc(db, "revisionSchedules", currentUserID);
    const revisionScheduleSnapshot = await getDoc(revisionScheduleDocRef);

    if (revisionScheduleSnapshot.exists()) {
      const revisionSchedules =
        revisionScheduleSnapshot.data().revisionSchedule;

      const setsToCheck = revisionSchedules
        .filter(
          (schedule) => schedule.revisionDates.includes(todayStr) // check if the schedule includes today
        )
        .map((schedule) => schedule.flashcardId);

      const setsToRevisePromises = setsToCheck.map(async (setId) => {
        const setDocRef = doc(db, "flashcardSets", setId);
        const setDocSnap = await getDoc(setDocRef);
        if (setDocSnap.exists()) {
          const setData = setDocSnap.data();
          // check if the set hasn't been revised today
          console.log(setData);
          if (setData.revised !== todayStr) {
            const viewedDate = setData.revised;
            const formattedViewedDate = viewedDate
              .split("-")
              .reverse()
              .join("/");
            return { id: setId, ...setData, lastRevised: formattedViewedDate };
          }
        }
        return null;
      });

      const setsToReviseData = (await Promise.all(setsToRevisePromises)).filter(
        Boolean
      );
      setSetsToReviseToday(setsToReviseData);
    } else {
      console.log("No revision schedule found for the user.");
    }
  };

  const checkRevisionStatus = (lastRevised) => {
    if (!lastRevised) return;
    const lastRevisedDate = lastRevised.toDate(); // assuming lastRevised is a Firestore Timestamp
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

      setIsLoading(false); // Consider setting this false only when all data is fetched successfully
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(true);
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className={`${styles.dashboardContainer} container text-center`}>
      <div className="row justify-content-md-center py-5 mx-0">
        <div className={`${styles.mainContent} col-9`}>
          <div className={styles.mainSection}>
            <div className={styles.greetingSection}>
              <h1 className={styles.welcomeText}>
                {greetingMessage}, {userData ? userData.firstName : "there"}
              </h1>
              <h3 className={styles.welcomeTextSubtitle}>
                Welcome back!
              </h3>
            </div>
            <section className={styles.contentSection}>

              {(setsToReviseToday.length == 0 && latestSets.length == 0 && latestNotes.length == 0) && <section className={styles.nothingSection}>
                <h1 className={styles.nothingText}>Welcome To Synapse!</h1>
                It looks like your dashboard is currently empty. To get started, you can create a new post by clicking on the 'New Post' button or explore our existing content by navigating through the menu.
                <Link to="/howtouse"><div className={styles.tourContainer}><div className={styles.tourButton}>Take a tour</div></div>
                </Link>
              </section>}

              {setsToReviseToday.length > 0 && (
                <div className={styles.flashcardsToReviseToday}>
                  <h2 className={styles.latestText}>
                    Flashcard Sets to Revise Today
                  </h2>
                  <div className={styles.gridContainer}>
                    {setsToReviseToday.map((set) => (
                      <Link to={`/sets/${set.id}`}>
                        <div key={set.id} className={styles.card}>
                          <div className={styles.cardBody}>
                            <h3 className={styles.cardLink}>{set.title}</h3>
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
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {latestSets.length > 0 ? (
                <div className={styles.latestFlashcards}>
                  <h2 className={styles.latestText}>Latest Flashcard Sets</h2>
                  <div className={styles.gridContainer}>
                    {latestSets.map((set) => (
                      <Link to={`/sets/${set.id}`}>
                        <div key={set.id} className={styles.card}>
                          <div className={styles.cardBody}>
                            <h3 className={styles.cardLink}>{set.title}</h3>
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
                      </Link>
                    ))}
                    <Link to="/mystuff/flashcards">
                      <FontAwesomeIcon icon={faChevronRight} color="grey" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div>Post</div>
              )}

              {latestNotes.length > 0 ? <div className={styles.latestNotes}>
                <h2 className={styles.latestText}>Latest Notes</h2>
                <div className={styles.gridContainer}>
                  {latestNotes.map((note) => (
                    <Link to={`/notes/${note.id}`}>
                      <div key={note.id} className={styles.card}>
                        <div className={styles.cardBody}>
                          <h3 className={styles.cardLink}>{note.title}</h3>
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
                    </Link>
                  ))}
                  <Link to="/mystuff/notes">
                    <FontAwesomeIcon icon={faChevronRight} color="grey" />
                  </Link>
                </div>
              </div> : <div>
                post</div>}
            </section>
            <Link className={styles.myStuffLink} to="/mystuff">
              My stuff
            </Link>
          </div>
        </div>
        <div className={`${styles.sidebar} col-3`}>
          <div className={styles.examCountdown}>
            <ExamCountdown />
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
