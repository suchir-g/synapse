import React, { useState } from "react";
import { auth } from "../../config/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

import styles from "./UpdatePassword.module.css";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      // Re-authenticate user before updating the password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, password);
      alert("Password updated successfully!");
      navigate("/profile"); // Redirect to profile page or wherever you see fit
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>Update Password</h1>
      </div>
      <div className={styles.mainContent}>
        <h1>Update Your Password</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleUpdatePassword}>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
