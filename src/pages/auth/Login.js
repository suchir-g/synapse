import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  query,
  collection,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, googleAuthProvider } from "../../config/firebase";
import { getFirebaseErrorMessage } from "../../firebaseErrors"; // Import the error handling utility
import styles from "./Login.module.css";

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to manage error messages
  const usersRef = collection(db, "users");

  const loginWithEmailAndPassword = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("isAuth", true);
      setIsAuth(true);
      navigate("/");
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code)); // Use the utility function to get a user-friendly error message
      console.error(err);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      localStorage.setItem("isAuth", true);
      setIsAuth(true);

      // check if the user already exists in the database
      const userSnapshot = await getDocs(
        query(usersRef, where("userID", "==", user.uid))
      );
      if (userSnapshot.empty) {
        // user does not exist, so create a new user document
        await addDoc(usersRef, {
          username: user.displayName,
          email: user.email,
          userID: user.uid,
          firstName: "",
          lastName: "",
          yearGroup: "",
          streak: 0,
          lastRevisionDate: new Date(),
        });

        const todoListsRef = collection(db, "todoLists");
        await addDoc(todoListsRef, {
          owner: auth.currentUser.uid,
          name: "Main",
          todos: [],
          main: true,
          createdAt: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code)); // Use the utility function to get a user-friendly error message
      console.error(err);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Login</h1>
      </div>

      <div className={styles.mainContent}>
        <input
          type="text"
          placeholder="Email..."
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password..."
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
        <span>
          <button onClick={loginWithEmailAndPassword} className={styles.button}>
            Login with email
          </button>
          <button onClick={loginWithGoogle} className={styles.button}>
            Login with Google
          </button>
        </span>
        <Link
          to="/register"
          className={`${styles.registerButton} ${styles.button}`}
        >
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
