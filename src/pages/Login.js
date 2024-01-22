import React, { useState } from 'react'

import { db, auth, googleAuthProvider } from "../config/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

import { useNavigate } from "react-router-dom";

import { query, collection, where, getDocs, addDoc } from "firebase/firestore";

import { userExistsEmail } from '../utilities';

const Login = ({setIsAuth}) => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const usersRef = collection(db, "users")

    // const userExists = async (email) => {
    //     // this will return True if the user exists because if it dosen't, then we can't log in.
    //     const emailQuery = query(usersRef, where("email", "==", email))
    //     const querySnapshot = await getDocs(emailQuery)
    //     return !querySnapshot.empty; // returning False if it's empty and true otherwise

    // }

    const loginWithEmailAndPassword = async () => {
        await signInWithEmailAndPassword(auth, email, password).then(() => {
            localStorage.setItem("isAuth", true);
            setIsAuth(true);
            navigate("/")
        }).catch((err) => {
            console.error(err) // make this better in the future
        })
    }

    const loginWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider).then(async () => {
            localStorage.setItem("isAuth", true);
            setIsAuth(true);

            console.log(auth)
            
            const exists = await userExistsEmail(usersRef,auth.currentUser.email) // Uses the ASYNC function userExists to determine if it should make an account or not

            if (!exists) {
                addDoc(usersRef,{
                  username: auth.currentUser.displayName,
                  email: auth.currentUser.email,
                  userID: auth.currentUser.uid, 
                })
            }


            navigate("/")
        }).catch((err) => {
            console.error(err)
        })
    }

  return (
    <div>
        <h1>LOGIN</h1>

        <input type="text" placeholder="Email..." onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>

        <button onClick={loginWithEmailAndPassword}>Login with email</button>
        <button onClick={loginWithGoogle}>Login with Google</button>

    </div>
  )
}

export default Login