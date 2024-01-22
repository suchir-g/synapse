import React, { useState } from 'react'
import { auth, googleAuthProvider, db } from "../config/firebase"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"

import { addDoc, collection } from "firebase/firestore"

const Register = ({setIsAuth}) => {
    // states for user's email and password

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    const usersCollectionRef = collection(db, "users")

    const register = async () => {
        
      // calls the firebase method for creating a user with email and password
      try {
        await createUserWithEmailAndPassword(auth, email, password).then(() => {
          // this "then" will only go when the promise is resolved
          // so we can populate the db inside here
          
          localStorage.setItem("isAuth", true);
          setIsAuth(true);

          addDoc(usersCollectionRef,{
            username,
            email,
            userID: auth.currentUser.uid, 
          })

          // currently for now the "user" entry in the database only has username, email and userID
          // in the future this will expand to things like year group, school...
        })
      } catch (e) {
        console.log(e) // reminder to make a better error handling method later
      }
      
    }
    
    const registerGoogle = async () => {
      // this handles the google sign in (using popups)

      try {
        await signInWithPopup(auth, googleAuthProvider).then(() => {
          addDoc(usersCollectionRef,{
            username: auth.currentUser.displayName,
            email: auth.currentUser.email,
            userID: auth.currentUser.uid, 
          })
        })
        // this is done a bit different - it's loading the auth first and then populating the db based on values from the auth
        // it's not pulling it straight from the form

      } catch (e) {
        console.log(e) // make this one better too
      }
    }

  return (
    <div>
      <h1>REGISTER</h1>
        {/* This makes use of the useState hook to set the state of any inputs to the input values 
            straight away. */}
        <input type="text" placeholder='Username...' onChange={(e) => setUsername(e.target.value)} />
        <input type="text" placeholder="Email..." onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>
        <button onClick={register}>Register</button>
        <button onClick={registerGoogle}>Sign in with google</button>
    </div>
  )
}

export default Register