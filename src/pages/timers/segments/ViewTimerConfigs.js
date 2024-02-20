import React, { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";

const ViewTimerConfigs = () => {
  const [examConfigs, setExamConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // user is signed in, fetch examConfigs
        const fetchExamConfigs = async () => {
          try {
            const q = query(
              collection(db, "examConfigs"),
              where("owner", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const configs = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExamConfigs(configs);
            setLoading(false)
          } catch (error) {
            console.error("Error fetching exam configs: ", error);
            // handle the errsor state as appropriately
          }
        };

        fetchExamConfigs();
      } else {
        // user is signed out
        setExamConfigs([]); // clear configs or handle as needed
      }
    });// cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // empty dependency array ensures this effect runs only once on mount
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Timers</h2>
      <Link to="/timers/pomodoro">Pomodoro timer</Link>
      <br />
      <Link to="/timers/basic">Basic timer</Link>
      <h2>Exam Configurations</h2>
      {examConfigs.length > 0 ? (
        <ul>
          {examConfigs.map((config) => (
            <li key={config.id}>
              {config.name} -&nbsp;
              <Link to={`/timers/config/edit/${config.id}`}>Edit</Link>
              <Link to="/timers/config">Set timer</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No exam configurations found.</p>
      )}
      <Link to="/timers/config/post">Create config</Link>
    </div>
  );
};

export default ViewTimerConfigs;
