import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { doc, getDoc, collection, updateDoc, setDoc } from "firebase/firestore";
import { flashcardsFromSet, usernameFromUserID } from "../../utilities";
import { sanitizeHTML } from "../../utilities";

import styles from "./FlashcardSet.module.css";

import Flashcard from "../revision/flashcards/Flashcard";
import LoadingComponent from "LoadingComponent";

const FlashcardSet = ({ isAuth }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owners, setOwners] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [isInterleavingEnabled, setIsInterleavingEnabled] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [tags, setTags] = useState([]);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const setRef = doc(db, "flashcardSets", params.setID);
        const setSnapshot = await getDoc(setRef);

        if (setSnapshot.exists()) {
          const setData = setSnapshot.data();
          setIsCurrentUserOwner(setData.owners.includes(user.uid));
        } else {
          setIsCurrentUserOwner(false);
        }
      } else {
        setIsCurrentUserOwner(false);
      }
    });

    const collectData = async () => {
      const setRef = doc(db, "flashcardSets", params.setID);
      const usersRef = collection(db, "users");
      const setSnapshot = await getDoc(setRef);

      if (setSnapshot.exists()) {
        const setData = setSnapshot.data();

        // this is making it so the last viewed time is set properly, but ONLY if the viewer is the owner.
        // this stops random people from setting the last viewed time.
        if (isAuth && setData.owners.includes(auth.currentUser.uid)) {
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
        // user does not have a revision schedule, but wants to enable interleaving
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

  const handleNextFlashcard = () => {
    setCurrentFlashcardIndex((prevIndex) =>
      prevIndex + 1 < flashcards.length ? prevIndex + 1 : 0
    );
  };

  const handlePreviousFlashcard = () => {
    setCurrentFlashcardIndex((prevIndex) =>
      prevIndex - 1 >= 0 ? prevIndex - 1 : flashcards.length - 1
    );
  };

  const copyLinkToClipboard = async () => {
    try {
      const url = window.location.href; // Gets the current URL
      await navigator.clipboard.writeText(url); // Copies the URL to the clipboard
      alert("Link copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy: ", err); // Log error if copying fails
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.ownerContainer}>
        {owners.map((owner, index) => (
          <i key={index} className={styles.owner}>
            {owner}
          </i>
        ))}
      </div>
      {tags.length > 0 && (
          <div className={styles.tags}>
          <strong>Tags: </strong>
          {tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              <Link to={`/tags/${tag.id}`} className={styles.tagLink}>
                {tag.name}
              </Link>
              {index < tags.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
        )}

      <hr />

      <div className={styles.flashcardCarousel}>
        <button onClick={handlePreviousFlashcard}>&lt;</button>
        {flashcards.length > 0 && (
          <Flashcard
            flashcard={flashcards[currentFlashcardIndex]}
            isQuestionFirst={true}
            size={{ width: "40vw", height: "24.72vw" }}
          />
        )}
        <button onClick={handleNextFlashcard}>&gt;</button>
      </div>
      <div className={styles.linksContainer}>
        {isCurrentUserOwner && <button
          className={styles.interleavingButton}
          onClick={handleInterleavingToggle}
        >
          {isInterleavingEnabled ? "Disable" : "Enable"} Interleaving
        </button>}
        <div className={styles.tagSection}>
          <button
            onClick={() => navigate(`/${params.setID}/flashcards`)}
            className={styles.tabButton}
          >
            Flashcards
          </button>
          <button
            onClick={() => navigate(`/${params.setID}/quiz`)}
            className={styles.tabButton}
          >
            Quiz
          </button>
          <button
            onClick={() => navigate(`/${params.setID}/study`)}
            className={styles.tabButton}
          >
            Memorise
          </button>
          <button
            onClick={() => navigate(`/${params.setID}/spacedRepetition`)}
            className={styles.tabButton}
          >
            Spaced repetition
          </button>
          <button
            onClick={() => navigate(`/${params.setID}/meteors`)}
            className={styles.tabButton}
          >
            Meteors
          </button>
        </div>
      </div>
      <div className={styles.linksContainerSecondary}>
        {isCurrentUserOwner && <button
          onClick={() => navigate(`/sets/${params.setID}/edit`)}
          className={styles.editButton}
        >
          &#x270E; {/* This is the Unicode character for a pencil */}
        </button>}
        <button
          onClick={copyLinkToClipboard}
          className={styles.shareButton}
          title="Share this set"
        >
          Share
        </button>
      </div>
      <hr />

      {flashcards.map((flashcard, index) => (
        <div key={index} className={styles.flashcard}>
          <h3 dangerouslySetInnerHTML={sanitizeHTML(flashcard.question)}></h3>
          <p dangerouslySetInnerHTML={sanitizeHTML(flashcard.answer)}></p>
        </div>
      ))}
    </div>
  );
};

export default FlashcardSet;
