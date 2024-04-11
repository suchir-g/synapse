import { db, auth } from "../../../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  runTransaction,
} from "firebase/firestore";

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

  const daysToAdd = fibonacci(numberOfRevisions + 1); // +1 because the sequence starts from 1, 1, 2...
  return addDays(new Date(lastRevisionDate), daysToAdd)
    .toISOString()
    .split("T")[0];
};

const isSameDay = (dateStr1, dateStr2) => {
  return (
    new Date(dateStr1).toDateString() === new Date(dateStr2).toDateString()
  );
};

export const updateRevisionDates = async (flashcardId, actualRevisionDate) => {
  try {
    const flashcardRef = doc(db, "flashcardSets", flashcardId);
    const userScheduleRef = doc(db, "revisionSchedules", auth.currentUser.uid);

    await runTransaction(db, async (transaction) => {
      const flashcardDoc = await transaction.get(flashcardRef);
      const scheduleDoc = await transaction.get(userScheduleRef);

      if (!flashcardDoc.exists()) throw "Document does not exist!";
      const flashcardData = flashcardDoc.data();

      if (isSameDay(flashcardData.revised, actualRevisionDate)) {
        console.log(
          "Flashcard has already been revised today. No updates will be made."
        );
        return;
      }

      // always update the flashcard's last revised date
      transaction.update(flashcardRef, { revised: actualRevisionDate });

      let revisionSchedule = scheduleDoc.data()?.revisionSchedule || [];
      let scheduleItem = revisionSchedule.find(
        (item) => item.flashcardId === flashcardId
      );

      if (!scheduleItem) {
        // if no schedule exists, create a new schedule item with the next revision date
        const nextRevisionDate = calculateNextRevisionDate(
          actualRevisionDate,
          1
        );
        scheduleItem = {
          flashcardId: flashcardId,
          revisionDates: [nextRevisionDate], // start with the next revision date
          numberOfRevisions: 1,
        };
        revisionSchedule.push(scheduleItem);
      } else {
        // check if actualRevisionDate is in the revisionDates array
        const revisionIndex = scheduleItem.revisionDates.findIndex((date) =>
          isSameDay(date, actualRevisionDate)
        );

        // remove the old revision date, if it exists
        if (revisionIndex !== -1) {
          scheduleItem.revisionDates.splice(revisionIndex, 1);
        }

        // calculate the next revision date
        const nextRevisionDate = calculateNextRevisionDate(
          actualRevisionDate,
          scheduleItem.numberOfRevisions + 1
        );

        // add the new revision date
        if (!scheduleItem.revisionDates.includes(nextRevisionDate)) {
          scheduleItem.revisionDates.push(nextRevisionDate);
        }

        // increment numberOfRevisions
        scheduleItem.numberOfRevisions++;
      }

      // update the revision schedule with the new or modified schedule item
      transaction.set(userScheduleRef, { revisionSchedule }, { merge: true });
    });

    console.log("Successfully updated revision dates.");
  } catch (e) {
    console.error("Failed to update revision dates: ", e);
  }
};
