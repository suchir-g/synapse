import React, { useState } from "react";
import { auth, googleAuthProvider, db } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const Register = ({ setIsAuth }) => {
  // states for user's email, password, and other details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [yearGroup, setYearGroup] = useState("");

  const usersCollectionRef = collection(db, "users");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        async () => {
          localStorage.setItem("isAuth", true);
          setIsAuth(true);

          // Update to include first name, last name, and year group
          addDoc(usersCollectionRef, {
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
            todos: [], // Initialize with an empty array
            main: true, // Indicates this is the primary todo list for the user
            createdAt: serverTimestamp(),
          });
        }
      );
    } catch (e) {
      console.log(e); // Improve error handling
    }
  };

  const registerGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider).then(async () => {
        // Using displayName to infer first and last name
        const names = auth.currentUser.displayName.split(" ");
        addDoc(usersCollectionRef, {
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
          todos: [], // Initialize with an empty array
          main: true, // Indicates this is the primary todo list for the user
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.log(e); // Improve error handling
    }
  };

  return (
    <div>
      <h1>REGISTER</h1>
      <input
        type="text"
        placeholder="Username..."
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="First Name..."
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name..."
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Year Group..."
        onChange={(e) => setYearGroup(e.target.value)}
      />
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
      <button onClick={register}>Register</button>
      <button onClick={registerGoogle}>Sign in with Google</button>
    </div>
  );
};

export default Register;
