import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { sanitizeAndTruncateHtml } from "../utilities";

const MyStuff = ({ isAuth }) => {
  const navigate = useNavigate();
  const setsRef = collection(db, "flashcardSets");
  const notesRef = collection(db, "notes");

  const [allSets, setAllSets] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [setsToReviseToday, setSetsToReviseToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const currentUserID = user.uid;

        try {
          // construct the query to get sets ordered by viewed timestamp
          const setsQuery = query(
            setsRef,
            where("owners", "array-contains", currentUserID),
            orderBy("viewed", "desc")
          );
          const setsQuerySnapshot = await getDocs(setsQuery);
          const newSets = setsQuerySnapshot.docs.map((setDoc) => ({
            title: setDoc.data().title,
            description: setDoc.data().description,
            id: setDoc.id,
            viewed: setDoc.data().viewed,
          }));
          setAllSets(newSets);

          // construct the query to get notes ordered by last viewed timestamp
          const notesQuery = query(
            notesRef,
            where("owners", "array-contains", currentUserID),
            orderBy("viewed", "desc")
          );
          const notesQuerySnapshot = await getDocs(notesQuery);
          const newNotes = notesQuerySnapshot.docs.map((noteDoc) => ({
            title: noteDoc.data().title,
            content: noteDoc.data().content,
            id: noteDoc.id,
            viewed: noteDoc.data().viewed,
          }));
          setAllNotes(newNotes);
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

  const navigateToTags = () => {
    navigate("/tags", { state: { isAuth: isAuth } });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Stuff</h1>
      <button onClick={navigateToTags}>Tags</button>
      <section>
        {setsToReviseToday.length > 0 && (
          <section>
            <h2>Sets to Revise Today</h2>
            {setsToReviseToday.map((set, index) => (
              <div key={index}>
                <h3>
                  <Link to={`/sets/${set.id}`}>{set.title}</Link>
                </h3>
              </div>
            ))}
          </section>
        )}
        <h2>Flashcards</h2>
        {allSets.length > 0 ? (
          allSets.map((set, index) => (
            <div key={index}>
              <h3>
                <a href={`/sets/${set.id}`}>{set.title}</a>
              </h3>
              <p>{set.description}</p>
            </div>
          ))
        ) : (
          <p>No flashcard sets found.</p>
        )}
      </section>

      <section>
        <h2>Notes</h2>
        {allNotes.length > 0 ? (
          allNotes.map((note, index) => (
            <div key={index}>
              <h3>
                <a href={`/notes/${note.id}`}>{note.title}</a>
              </h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeAndTruncateHtml(note.content), // use the new function here
                }}
                style={{
                  maxWidth: "400px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
            </div>
          ))
        ) : (
          <p>No notes found.</p>
        )}
      </section>
    </div>
  );
};

export default MyStuff;
