import { db, auth } from "../../../config/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const fibonacci = (n) => {
  let a = 1,
    b = 1,
    temp;

  for (let i = 2; i < n; i++) {
    temp = a + b;
    a = b;
    b = temp;
  }

  return b;
};

export const calculateNextRevisionDate = (
  lastRevisionDate,
  numberOfRevisions
) => {
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // calculate the gap based on the number of revisions
  const daysToAdd = fibonacci(numberOfRevisions + 1); // +1 because the sequence starts from 1, 1, 2...
  const nextRevisionDate = addDays(new Date(lastRevisionDate), daysToAdd)
    .toISOString()
    .split("T")[0];

  return nextRevisionDate;
};

const isSameDay = (dateStr1, dateStr2) => {
  return dateStr1 === dateStr2;
};

export const updateRevisionDates = async (flashcardId, actualRevisionDate) => {
  const flashcardRef = doc(db, "flashcardSets", flashcardId);
  const flashcardSnap = await getDoc(flashcardRef);

  if (flashcardSnap.exists()) {
    const lastRevisedDateStr = flashcardSnap.data().revised;

    // if the flashcard was revised today, do not update revision dates
    if (isSameDay(lastRevisedDateStr, actualRevisionDate)) {
      console.log(
        "Flashcard was already revised today. No update to revision dates."
      );
      return;
    }
  }

  await updateDoc(flashcardRef, {
    revised: actualRevisionDate,
  });

  const userScheduleRef = doc(db, "revisionSchedules", auth.currentUser.uid);
  const docSnap = await getDoc(userScheduleRef);

  if (docSnap.exists() && docSnap.data().revisionSchedule) {
    let flashcardScheduleExists = false;
    const updatedSchedule = docSnap.data().revisionSchedule.map((item) => {
      if (item.flashcardId === flashcardId) {
        flashcardScheduleExists = true;
        // check if the revision is made on the same day
        if (
          isSameDay(
            item.revisionDates[item.revisionDates.length - 1],
            actualRevisionDate
          )
        ) {
          // do nothing if revising on the same day
          return item;
        } else {
          // check if the revision is made early
          const lastRevisionDate = new Date(
            item.revisionDates[item.revisionDates.length - 1]
          );
          const actualDate = new Date(actualRevisionDate);
          const differenceInDays =
            (actualDate - lastRevisionDate) / (1000 * 3600 * 24);
          let numberOfRevisions = item.numberOfRevisions;

          if (differenceInDays < fibonacci(numberOfRevisions + 1)) {
            // if the revision is made early, accelerate the schedule by one day
            numberOfRevisions += 1;
          }

          const nextRevisionDate = calculateNextRevisionDate(
            actualRevisionDate,
            numberOfRevisions
          );
          return {
            ...item,
            revisionDates: [...item.revisionDates, nextRevisionDate],
            numberOfRevisions: numberOfRevisions,
          };
        }
      }
      return item;
    });

    if (!flashcardScheduleExists) {
      // add the new flashcard to the schedule
      updatedSchedule.push({
        flashcardId: flashcardId,
        revisionDates: [calculateNextRevisionDate(actualRevisionDate, 1)],
        numberOfRevisions: 1,
      });
    }

    await setDoc(
      userScheduleRef,
      { revisionSchedule: updatedSchedule },
      { merge: true }
    );
  } else {
    // no schedule exists, create a new one
    const newSchedule = [
      {
        flashcardId: flashcardId,
        revisionDates: [calculateNextRevisionDate(actualRevisionDate, 1)],
        numberOfRevisions: 1,
      },
    ];

    await setDoc(userScheduleRef, { revisionSchedule: newSchedule });
  }
};
