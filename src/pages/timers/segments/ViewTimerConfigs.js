import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const ViewTimerConfigs = () => {
  const [examConfigs, setExamConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamConfigs = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "examConfigs"));
        const configs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExamConfigs(configs);
      } catch (error) {
        console.error("Error fetching exam configs:", error);
      }
      setLoading(false);
    };

    fetchExamConfigs();
  }, []);

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
