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
    // reference to the flashcard and user schedule in Firestore.
    const flashcardRef = doc(db, "flashcardSets", flashcardId);
    const userScheduleRef = doc(db, "revisionSchedules", auth.currentUser.uid);

    // transaction to update both documents atomically.
    await runTransaction(db, async (transaction) => {
      const flashcardDoc = await transaction.get(flashcardRef);
      const scheduleDoc = await transaction.get(userScheduleRef);

      if (!flashcardDoc.exists()) {
        throw "Document does not exist!";
      }

      const flashcardData = flashcardDoc.data();

      // check if the flashcard has already been revised today
      if (isSameDay(flashcardData.revised, actualRevisionDate)) {
        console.log(
          "Flashcard has already been revised today. No updates will be made."
        );
        return;
      }

      // update the revised date for the flashcard
      transaction.update(flashcardRef, {
        revised: actualRevisionDate,
      });

      let revisionSchedule = scheduleDoc.data()?.revisionSchedule || [];
      let scheduleItem = revisionSchedule.find(
        (item) => item.flashcardId === flashcardId
      );

      if (!scheduleItem) {
        // if the flashcard schedule does not exist, create a new one
        scheduleItem = {
          flashcardId: flashcardId,
          revisionDates: [actualRevisionDate],
          numberOfRevisions: 1,
        };
        revisionSchedule.push(scheduleItem);
      } else {
        // find if actualRevisionDate is on the revisionDates list
        const revisionIndex = scheduleItem.revisionDates.findIndex((date) =>
          isSameDay(date, actualRevisionDate)
        );

        if (revisionIndex !== -1) {
          // revision was made on the correct day, so increment numberOfRevisions and calculate next date.
          scheduleItem.numberOfRevisions++;
          const nextRevisionDate = calculateNextRevisionDate(
            actualRevisionDate,
            scheduleItem.numberOfRevisions
          );
          scheduleItem.revisionDates.push(nextRevisionDate);
        } else {
          // Revision was made early or late.
          scheduleItem.numberOfRevisions = scheduleItem.numberOfRevisions - 1;
          const nextRevisionDate = calculateNextRevisionDate(
            actualRevisionDate,
            scheduleItem.numberOfRevisions
          );
          scheduleItem.revisionDates = [nextRevisionDate];
        }
      }

      // update the revision schedule.
      transaction.set(userScheduleRef, { revisionSchedule }, { merge: true });
    });

    console.log("Successfully updated revision dates.");
  } catch (e) {
    console.error("Failed to update revision dates: ", e);
  }
};
