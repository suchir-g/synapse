import React, { useState, useEffect } from "react";
import styles from "./DeleteAccount.module.css";
import {
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";

const DeleteAccount = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const reauthenticateUser = async () => {
    const credential = EmailAuthProvider.credential(email, password);
    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      setError(
        "Re-authentication failed. Please check your credentials and try again."
      );
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      if (await reauthenticateUser()) {
        try {
          await deleteUserData(userData.userID);
          localStorage.clear();
          setIsAuth(false);
          navigate("/login");
        } catch (error) {
          console.error("Error deleting user data:", error);
          setError("Failed to delete the account. Please try again later.");
        }
      }
      setIsLoading(false);
    }
  };

  const deleteUserData = async (userId) => {
    // Define all collection names and the respective field to check for the userId
    const collectionsWithOwnerFields = [
      { name: "examConfigs", ownerField: "owner" },
      { name: "flashcardSets", ownerField: "owners" },
      { name: "notes", ownerField: "owners" },
      { name: "tags", ownerField: "owner" },
      { name: "todoLists", ownerField: "owner" },
      { name: "whiteboards", ownerField: "author" },
      { name: "users", ownerField: "userId" },
    ];

    try {
      for (let { name, ownerField } of collectionsWithOwnerFields) {
        const q =
          ownerField === "owners"
            ? query(
                collection(db, name),
                where(ownerField, "array-contains", userId)
              )
            : query(collection(db, name), where(ownerField, "==", userId));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }
      await deleteDoc(doc(db, "revisionSchedules", userId));
      await deleteUser(auth.currentUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <h1 className={styles.mainText}>Enter your details to confirm deletion</h1>
        <p>After you do this, there is no way of recovering anything.</p>
        <input
          type="text"
          placeholder="Email..."
          required
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password..."
          required
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={styles.button}
          disabled={isLoading}
          onClick={handleDeleteAccount}
        >
          {isLoading ? "Deleting..." : "Delete Account"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default DeleteAccount;
