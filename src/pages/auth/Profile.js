import React, { useEffect, useState } from "react";

import { signOut, deleteUser } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, where, doc, deleteDoc } from "firebase/firestore";
import styles from "./Profile.module.css";

const Profile = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");
  const loadData = async (userId) => {
    const usersQuery = query(
      collection(db, "users"),
      where("userID", "==", userId)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      setUserData(userData);
      console.log(userData);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadData(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      setIsAuth(false);

      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };
  

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Profile</h1>
      </div>
      <div className={styles.mainContent}>
        <h1 className={styles.username}>{userData.username}</h1>
        <p className={styles.firstLastName}>
          {userData.firstName} {userData.lastName}
        </p>
        <p className={`${styles.streak} ${styles.firstLastName}`}>
          Streak: {userData.streak}
        </p>
        <p className={styles.firstLastName}>User ID: {userData.userID}</p>
        <span className={styles.buttonGroup}>
          <button
            onClick={() => {
              navigate("/updatepassword");
            }}
            className={`${styles.button} ${styles.updatePassword}`}
          >
            Update Password
          </button>
          <button onClick={logOut} className={styles.button}>
            Sign out
          </button>
          <button onClick={() => navigate("/deleteAccount")} className={styles.button}>
            Delete Account
          </button>
        </span>
      </div>
    </div>
  );
};

export default Profile;
