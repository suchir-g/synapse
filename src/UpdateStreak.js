import {
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config/firebase";

export const checkAndResetStreak = async (userID) => {
  if (!userID) {
    console.error("Invalid or undefined userID provided.");
    return; // Exit the function early
  }
  console.log("hello")
  console.log("hello 2")
  const usersCollectionRef = collection(db, "users");
  const q = query(usersCollectionRef, where("userID", "==", userID));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const today = new Date();
      const lastRevision = userData.lastRevisionDate.toDate(); // Convert Firestore Timestamp to Date
      const differenceInDays = Math.floor(
        (today - lastRevision) / (1000 * 60 * 60 * 24)
      );

      if (differenceInDays >= 2) {
        // It's been 2 or more days since the last revision, reset the streak to 0
        await updateDoc(userDoc.ref, {
          streak: 0,
        });

        console.log("Streak reset to 0 due to inactivity.");
      } else {
        console.log("Streak remains unchanged.");
      }
    } else {
      console.log("No such user!");
    }
  } catch (error) {
    console.error("Error checking and resetting streak: ", error);
  }
};

export const updateStreak = async (userID) => {
  const usersCollectionRef = collection(db, "users");
  const q = query(usersCollectionRef, where("userID", "==", userID));
  checkAndResetStreak(userID);

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Assuming userID is unique, there should only be one document.
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const today = new Date();
      const lastRevision = userData.lastRevisionDate.toDate(); // Convert Firestore Timestamp to Date
      const differenceInDays = Math.floor(
        (today - lastRevision) / (1000 * 60 * 60 * 24)
      );
      let newStreak = userData.streak;

      if (differenceInDays === 1) {
        // User revised yesterday, so increment the streak
        newStreak++;
      } else if (differenceInDays > 1) {
        // It's been more than one day since the last revision, so reset the streak
        newStreak = 1;
      }

      // Update the lastRevisionDate to today and streak in Firestore
      await updateDoc(userDoc.ref, {
        streak: newStreak,
        lastRevisionDate: today,
      });

      console.log(`Streak updated to ${newStreak}`);
    } else {
      console.log("No such user!");
    }
  } catch (error) {
    console.error("Error updating streak: ", error);
  }
};
