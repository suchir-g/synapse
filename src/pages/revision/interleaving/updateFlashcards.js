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

      // Always update the flashcard's last revised date
      transaction.update(flashcardRef, { revised: actualRevisionDate });

      let revisionSchedule = scheduleDoc.data()?.revisionSchedule || [];
      let scheduleItem = revisionSchedule.find(
        (item) => item.flashcardId === flashcardId
      );

      if (!scheduleItem) {
        // If no schedule exists, create a new schedule item with the next revision date
        const nextRevisionDate = calculateNextRevisionDate(
          actualRevisionDate,
          1
        );
        scheduleItem = {
          flashcardId: flashcardId,
          revisionDates: [nextRevisionDate], // Start with the next revision date
          numberOfRevisions: 1,
        };
        revisionSchedule.push(scheduleItem);
      } else {
        // Check if actualRevisionDate is in the revisionDates array
        const revisionIndex = scheduleItem.revisionDates.findIndex((date) =>
          isSameDay(date, actualRevisionDate)
        );

        if (revisionIndex !== -1) {
          // If revised on a scheduled date, remove that date
          scheduleItem.revisionDates.splice(revisionIndex, 1);
        }

        // Regardless of whether a date was popped or not, calculate the next revision date
        // The calculation is based on the existing number of revisions plus one for the next step
        const nextRevisionDate = calculateNextRevisionDate(
          actualRevisionDate,
          scheduleItem.numberOfRevisions + 1
        );
        if (!scheduleItem.revisionDates.includes(nextRevisionDate)) {
          scheduleItem.revisionDates.push(nextRevisionDate);
        }

        // Adjust numberOfRevisions only if a date was popped
        if (revisionIndex !== -1) {
          scheduleItem.numberOfRevisions = Math.max(
            1,
            scheduleItem.numberOfRevisions
          );
        } else {
          // Increment if we're adding a new date not based on a pop
          scheduleItem.numberOfRevisions++;
        }
      }

      // Update the revision schedule with the new or modified schedule item
      transaction.set(userScheduleRef, { revisionSchedule }, { merge: true });
    });

    console.log("Successfully updated revision dates.");
  } catch (e) {
    console.error("Failed to update revision dates: ", e);
  }
};
