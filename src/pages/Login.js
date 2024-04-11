import React, { useState } from "react";

import { db, auth, googleAuthProvider } from "../config/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

import { useNavigate, Link } from "react-router-dom";

import { query, collection, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const usersRef = collection(db, "users");

  const loginWithEmailAndPassword = async () => {
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        localStorage.setItem("isAuth", true);
        setIsAuth(true);
        navigate("/");
      })
      .catch((err) => {
        console.error(err); // make this better in the future
      });
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
          lastRevisionDate: new Date(), // set to the current date
        });

        const todoListsRef = collection(db, "todoLists");
        await addDoc(todoListsRef, {
          owner: auth.currentUser.uid,
            name: "Main",
          todos: [], // initialize with an empty array
          main: true, // indicates this is the primary todo list for the user
          createdAt: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>LOGIN</h1>

      <input
        type="text"
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password..."
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={loginWithEmailAndPassword}>Login with email</button>
      <button onClick={loginWithGoogle}>Login with Google</button>

      <br />
      <Link to="/register">Don't have an account? Sign up</Link>
    </div>
  );
};

export default Login;
