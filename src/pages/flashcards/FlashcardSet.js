import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { db, auth } from "../../config/firebase";

import { doc, getDoc, collection, updateDoc, setDoc } from "firebase/firestore";

import { flashcardsFromSet, usernameFromUserID } from "../../utilities";

import { sanitizeHTML } from "../../utilities";

const FlashcardSet = ({ isAuth }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owners, setOwners] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [isInterleavingEnabled, setIsInterleavingEnabled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [tags, setTags] = useState([]);

  useEffect(() => {
    const collectData = async () => {
      if (!isAuth) {
        navigate("/");
      }
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

        setIsInterleavingEnabled(setData.interleaving || false);

        setOwners(usernames);

        const newFlashcards = await flashcardsFromSet(setRef);
        setFlashcards(newFlashcards);

        if (setData.tags) {
          console.log(setData.tags);
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

  const handleInterleavingToggle = async () => {
    const newInterleavingStatus = !isInterleavingEnabled;

    const confirmToggle = window.confirm(
      "Are you sure you want to toggle interleaving for this set? This will wipe all interleaving data you have so far on this set."
    );
    if (!confirmToggle) {
      return; // exit if the user cancels the action
    }

    setIsInterleavingEnabled(newInterleavingStatus);
    const setRef = doc(db, "flashcardSets", params.setID);

    try {
      await updateDoc(setRef, {
        interleaving: newInterleavingStatus,
      });

      const userScheduleRef = doc(
        db,
        "revisionSchedules",
        auth.currentUser.uid
      );
      const docSnap = await getDoc(userScheduleRef);

      if (docSnap.exists()) {
        let schedule = docSnap.data().revisionSchedule || [];

        if (newInterleavingStatus) {
          // enable interleaving
          const today = new Date().toISOString().split("T")[0]; // get today's date as string
          if (!schedule.some((entry) => entry.flashcardId === params.setID)) {
            schedule.push({
              flashcardId: params.setID,
              numberOfRevisions: 0,
              revisionDates: [today],
            });
          }
        } else {
          // disable interleaving
          schedule = schedule.filter(
            (entry) => entry.flashcardId !== params.setID
          );
        }

        await updateDoc(userScheduleRef, {
          revisionSchedule: schedule,
        });
      } else if (newInterleavingStatus) {
        // User does not have a revision schedule, but wants to enable interleaving
        const today = new Date().toISOString().split("T")[0];
        await setDoc(userScheduleRef, {
          revisionSchedule: [
            {
              flashcardId: params.setID,
              numberOfRevisions: 0,
              revisionDates: [today],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error updating interleaving status:", error);
      setIsInterleavingEnabled(isInterleavingEnabled); // revert state if update failed
    }
  };

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
      <button onClick={handleInterleavingToggle}>
        {isInterleavingEnabled ? "Disable" : "Enable"} Interleaving
      </button>

      <hr />
      {flashcards.map((flashcard, index) => (
        <div key={index}>
          <h3 dangerouslySetInnerHTML={sanitizeHTML(flashcard.question)}></h3>
          <p dangerouslySetInnerHTML={sanitizeHTML(flashcard.answer)}></p>
        </div>
      ))}

      <div>
        <Link to={`/${params.setID}/flashcards`}>Flashcards</Link>
        <br />
        <Link to={`/${params.setID}/quiz`}>Take a Quiz</Link>
      </div>

      <a href={`/sets/${params.setID}/edit`}>Edit this set</a>
    </div>
  );
};

export default FlashcardSet;
