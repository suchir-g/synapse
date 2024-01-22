import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { db, auth } from "../../config/firebase";

import { doc, getDoc, collection, updateDoc } from "firebase/firestore";

import { flashcardsFromSet, usernameFromUserID } from "../../utilities";

const FlashcardSet = ({ isAuth }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owners, setOwners] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [tags, setTags] = useState([]);

  
  useEffect(() => {
    const collectData = async () => {
      if (!isAuth) {navigate("/")}
      const setRef = doc(db, "flashcardSets", params.setID);
      const usersRef = collection(db, "users");
      const setSnapshot = await getDoc(setRef);
      
      if (setSnapshot.exists() && isAuth) {
        const setData = setSnapshot.data();
        
        // this is making it so the last viewed time is set properly, but ONLY if the viewer is the owner. 
        // this stops random people from setting the last viewed time.
        if (setData.owners.includes(auth.currentUser.uid)) {
          await updateDoc(setRef, {
            viewed: new Date(),
          });
        }

        setTitle(setData.title);
        setDescription(setData.description);

        const usernames = await Promise.all(
          setData.owners.map(async (owner) =>
            usernameFromUserID(usersRef, owner)
          )
        );

        setOwners(usernames);

        const newFlashcards = await flashcardsFromSet(setRef);
        setFlashcards(newFlashcards);

        if (setData.tags) {
          console.log(setData.tags)
          const tagDocs = await Promise.all(
            setData.tags.map((tagId) => getDoc(doc(db, "tags", tagId)))
          );

          // adding each one as an object storing the id and name: this will be useful in rendering when we need both for the link and display

          const tagNames = tagDocs
            .filter((doc) => doc.exists())
            .map((docSnap) => ({
              id: docSnap.id,
              name: docSnap.data().tagName,
            }));
          setTags(tagNames);
        }
      }

      setIsLoading(false);
    };
    collectData();
  }, [params.setID, isAuth]);

  // // for debugging purposes. we can't put the console.log() inside the first useEffect since it would likely be called too fast.
  // useEffect(() => {
  //   console.log(owners);
  //   console.log(flashcards);
  // }, [flashcards, owners]); // this useEffect will run whenever flashcards state changes

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      {owners.map((owner, index) => (
        <i key={index}>{owner}</i>
      ))}
      <hr />
      <div>
        <strong>Tags: </strong>
        {tags.map((tag, index) => (
          <span key={index}>
            <Link to={`/tags/${tag.id}`}>{tag.name}</Link>
            {/* some short circuiting to make a list - i never knew how useful this is until now */}
            {index < tags.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
      <hr />
      {flashcards.map((flashcard, index) => (
        <div key={index}>
          <h3>{flashcard.question}</h3>
          <p>{flashcard.answer}</p>
        </div>
      ))}
      <a href={`/sets/${params.setID}/edit`}>Edit this set</a>
    </div>
  );
};

export default FlashcardSet;
