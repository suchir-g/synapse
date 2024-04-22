import React, { useState } from "react";
import { auth, googleAuthProvider, db } from "../../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import styles from "./Login.module.css";
import LoadingComponent from "LoadingComponent";
const Register = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false)
  const usersCollectionRef = collection(db, "users");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        async () => {
          localStorage.setItem("isAuth", true);
          setIsAuth(true);
          setLoadingRegister(true);
          // update to include first name, last name, and year group
          await addDoc(usersCollectionRef, {
            username,
            email,
            firstName,
            lastName,
            yearGroup,
            userID: auth.currentUser.uid,
            streak: 0,
            lastRevisionDate: new Date(),
          });
          const todoListsRef = collection(db, "todoLists");
          await addDoc(todoListsRef, {
            owner: auth.currentUser.uid,
            name: "Main",
            todos: [], // initialize with an empty array
            main: true, // indicates this is the primary todo list for the user
            createdAt: serverTimestamp(),
          });
          setLoadingRegister(false)
          navigate("/");
        }
      );
    } catch (e) {
      console.log(e); // improve error handling
    }
  };

  const registerGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider).then(async () => {
        // Using displayName to infer first and last name
        const names = auth.currentUser.displayName.split(" ");
        setLoadingRegister(true)
        await addDoc(usersCollectionRef, {
          username: auth.currentUser.displayName,
          firstName: names[0],
          lastName: names.length > 1 ? names[names.length - 1] : "",
          email: auth.currentUser.email,
          yearGroup, // This would have to be handled separately as Google Auth doesn't provide this
          userID: auth.currentUser.uid,
          streak: 0,
          lastRevisionDate: new Date(),
        });
        const todoListsRef = collection(db, "todoLists");
        await addDoc(todoListsRef, {
          owner: auth.currentUser.uid,
          name: "Main",
          todos: [], // initialize with an empty array
          main: true, // indicates this is the primary todo list for the user
          createdAt: serverTimestamp(),
        });
        setLoadingRegister(false)
        navigate("/");
      });
    } catch (e) {
      console.log(e); // improve error handling
    }
  };

  if (loadingRegister) {
    return <LoadingComponent />
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Register</h1>
      </div>
      <div className={styles.mainContent}>
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className={`${styles.input}`}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className={`${styles.input}`}
        />
        <hr></hr>
        <input
          type="text"
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)}
          className={`${styles.input}`}
        />
        <span className={styles.inputGroup}>
          <input
            type="text"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            className={`${styles.input} ${styles.halfSize}`}
          />
          <input
            type="text"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            className={`${styles.input} ${styles.halfSize}`}
          />
        </span>
        <input
          type="text"
          placeholder="Year Group"
          onChange={(e) => setYearGroup(e.target.value)}
          className={`${styles.input}`}
        />

        <span>
          <button
            onClick={register}
            className={`${styles.registerButton} ${styles.button}`}
          >
            Register
          </button>
          <button onClick={registerGoogle} className={`${styles.button}`}>
            Sign in with Google
          </button>
        </span>
      </div>
    </div>
  );
};

export default Register;
