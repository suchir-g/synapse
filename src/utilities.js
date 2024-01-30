import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from "firebase/firestore";
import { db } from "./config/firebase";
import DOMPurify from "dompurify";

export const userExistsEmail = async (usersRef, email) => {
  // this will return True if the user exists because if it dosen't, then we can't log in.
  const emailQuery = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(emailQuery);
  return !querySnapshot.empty; // returning False if it's empty and true otherwise
};

export const userIDFromEmail = async (usersRef, email) => {
  const emailQuery = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(emailQuery);

  // check if a user with the given email exists
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return userDoc.data().id; // returns the user's ID
  } else {
    return null; // returns null if no user is found
  }
};

export const emailFromUserID = async (usersRef, userID) => {
  const emailQuery = query(usersRef, where("userID", "==", userID));
  const querySnapshot = await getDocs(emailQuery);

  // check if a user with the given ID exists
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return userDoc.data().email; // returns the user's email
  } else {
    return null; // returns null if no user is found
  }
};

export const usernameFromUserID = async (usersRef, userID) => {
  const emailQuery = query(usersRef, where("userID", "==", userID));
  const querySnapshot = await getDocs(emailQuery);

  // check if a user with the given ID exists
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return userDoc.data().username; // returns the user's username
  } else {
    return null; // returns null if no user is found
  }
};

export const flashcardsFromSet = async (setRef) => {
  // reference to the flashcards subcollection
  const flashcardsRef = collection(setRef, "flashcards");
  const q = query(flashcardsRef, orderBy("created", "asc")); // sort by 'created' field
  // get the flashcards documents
  const querySnapshot = await getDocs(q);
  const flashcards = querySnapshot.docs.map((doc) => ({
    // map through documents and get data
    id: doc.id,
    ...doc.data(),
  }));
  return flashcards;
};
export const flashcardsFromSetID = async (setId) => {
  const flashcardsCollectionRef = collection(db, 'flashcards');
  const q = query(flashcardsCollectionRef, where('setId', '==', setId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const setDataFromID = async (setId) => {
  const setRef = doc(db, "flashcardSets", setId);
  const setSnapshot = await getDoc(setRef);
  if (setSnapshot.exists()) {
    return setSnapshot.data();
  } else {
    throw new Error("Flashcard set not found");
  }
};

export const sanitizeAndTruncateHtml = (htmlContent, maxLength = 30) => {
  // featuring regex as taught by mr hall
  const plainText = htmlContent.replace(/<[^>]*>/g, ""); // remove HTML tags to get plain text
  const truncatedText =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  return DOMPurify.sanitize(truncatedText); // sanitize and return
};

export const sanitizeHTML = (htmlContent) => {
  return { __html: DOMPurify.sanitize(htmlContent) };
};
