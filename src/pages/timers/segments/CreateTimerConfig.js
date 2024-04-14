import React, { useState } from "react";
import { db, auth } from "../../../config/firebase"; // Import from your firebase configuration file
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import styles from "./CreateTimerConfig.module.css";

const CreateTimerConfig = () => {
  const [examName, setExamName] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [duration, setDuration] = useState("");

  const navigate = useNavigate();

  // handle change in section information
  const addSection = () => {
    if (!sectionTitle || !duration || duration == 0) {
      alert("Please fill in all fields with a non-zero value to add a section.");
      return;
    }
    const newSection = {
      title: sectionTitle,
      duration: parseInt(duration, 10),
    };
    setSections([...sections, newSection]);
    setSectionTitle("");
    setDuration("");
  };

  const deleteSection = (indexToDelete) => {
    setSections(sections.filter((_, index) => index !== indexToDelete));
  };

  // handle form submission to create a new exam configuration
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
      alert("You must be logged in to create an exam configuration.");
      return;
    }

    const examConfigsRef = collection(db, "examConfigs");

    try {
      await addDoc(examConfigsRef, {
        name: examName,
        sections,
        owner: auth.currentUser.uid,
        createdAt: serverTimestamp(), // use serverTimestamp for synchronization
      });
      alert("Exam configuration created successfully!");
      setExamName("");
      setSections([]);
      navigate(-1) // for now, make it navigate to the config timer page afterwards
    } catch (error) {
      console.error("Error creating exam configuration: ", error);
      alert("Failed to create exam configuration.");
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.flashcard}>
        <h2 className={styles.mainText}>Create Exam Configuration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Exam Name"
            required
            className={`${styles.input}`}
          />
          <hr />
          <div>
            <h4 className={styles.sectionText}>Sections</h4>
            {sections.map((section, index) => (
              <div key={index} className={styles.pair}>
                <p>{`${section.title}: ${section.duration} minutes`}</p>
                <button type="button" onClick={() => deleteSection(index)}>
                  Delete Section
                </button>
              </div>
            ))}
            <div className={styles.sectionSection}>
              <span>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Section Title"
                className={`${styles.input}`}
              />
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (minutes)"
                className={`${styles.input}`}
              />
              </span>
              <button type="button" onClick={addSection} className={`${styles.button} ${styles.addSection}`}>
                Add Section
              </button>
            </div>
          </div>
          <button type="submit" className={`${styles.button} ${styles.createExamConfigButton}`}>Create Exam Config</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTimerConfig;
