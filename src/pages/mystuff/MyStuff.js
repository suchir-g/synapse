import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  getDoc,
  doc,
  limit,
} from "firebase/firestore";

import styles from "../../css/MyStuff.module.css";
import FlashcardGrid from "./grids/FlashcardGrid";
import NotesGrid from "./grids/NotesGrid";
import TagsGrid from "./grids/TagsGrid";
import WhiteboardsGrid from "./grids/WhiteboardsGrid";
import SearchResultsGrid from "./grids/SearchResultsGrid";

const MyStuff = ({ isAuth }) => {
  const navigate = useNavigate();

  const [setsToReviseToday, setSetsToReviseToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [activeTab, setActiveTab] = useState("flashcards");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const currentUserID = user.uid;
        setCurrentUserID(user.uid);

        try {
          setIsLoading(false);

          const fetchRevisionSchedules = async () => {
            const todayStr = new Date().toISOString().split("T")[0]; // format today's date as YYYY-MM-DD

            const revisionScheduleDocRef = doc(
              db,
              "revisionSchedules",
              currentUserID
            );
            const revisionScheduleSnapshot = await getDoc(
              revisionScheduleDocRef
            );

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
                  // Check if the set hasn't been revised today
                  if (setData.revised !== todayStr) {
                    return {
                      title: setData.title,
                      id: setId,
                    };
                  }
                }
                return null;
              });

              const setsToReviseData = (
                await Promise.all(setsToRevisePromises)
              ).filter(Boolean);
              setSetsToReviseToday(setsToReviseData);
            } else {
              console.log("No revision schedule found for the user.");
            }
          };

          if (isAuth) {
            fetchRevisionSchedules();
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      } else {
        navigate("/");
      }
    });

    // clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [navigate]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Stuff</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "flashcards" ? styles.active : ""
          }`}
          onClick={() => handleTabClick("flashcards")}
        >
          Flashcards
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "notes" ? styles.active : ""
          }`}
          onClick={() => handleTabClick("notes")}
        >
          Notes
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "whiteboards" ? styles.active : ""
          }`}
          onClick={() => handleTabClick("whiteboards")}
        >
          Whiteboards
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => handleSearch(searchQuery)}>Search</button>
      </div>

      {showSearchResults && <SearchResultsGrid searchQuery={searchQuery} currentUserID={currentUserID}/>}
      <section className={styles.contentSection}>
        {activeTab === "flashcards" && (
          <FlashcardGrid currentUserID={currentUserID} />
        )}
        {activeTab === "notes" && <NotesGrid currentUserID={currentUserID} />}
        {activeTab === "tags" && <TagsGrid currentUserID={currentUserID} />}
        {activeTab === "whiteboards" && (
          <WhiteboardsGrid currentUserID={currentUserID} />
        )}
      </section>
    </div>
  );
};

export default MyStuff;
