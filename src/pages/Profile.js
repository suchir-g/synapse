import React from 'react'

import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from 'react-router-dom';
const Profile = ({setIsAuth}) => {

    const navigate = useNavigate();

    const logOut = async () => {
        try {
          await signOut(auth)
          localStorage.clear();
          setIsAuth(false);

          navigate("/")
        } catch (e) {
          console.log(e)
        }
      }


  return (
    <div>
        <h1>PROFILE</h1>
        <button onClick={logOut}> Sign out</button>
    </div>
  )
}

export default Profile