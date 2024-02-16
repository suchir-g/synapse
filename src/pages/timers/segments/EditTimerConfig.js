import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

const EditExamConfig = () => {
  const [examName, setExamName] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const { configID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!configID) {
        console.log(configID);
        console.error("No configID provided");
        navigate("/"); // redirect to a safe page if no configId is provided
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(db, "examConfigs", configID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // destructuring the fetched document data
          const { name, sections } = docSnap.data();
          setExamName(name); // set the name in state
          setSections(sections || []); // set the sections in state
        } else {
          console.log("No such document!");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
      setLoading(false);
    };

    fetchConfig();
  }, [configID, navigate]);

  const addSection = () => {
    if (!sectionTitle || !duration || duration === 0) {
      alert(
        "Please fill in all fields with a non-zero value to add a section."
      );
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "examConfigs", configID);
      await updateDoc(docRef, {
        name: examName,
        sections,
        // owner and createdAt fields are not updated
      });
      alert("Exam configuration updated successfully!");
      navigate("/timers");
    } catch (error) {
      console.error("Error updating exam configuration: ", error);
      alert("Failed to update exam configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this config?"
    );
    if (confirmDelete) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "examConfigs", configID));
        navigate("/timers");
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Error deleting config.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Edit Exam Configuration</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Exam Name"
          required
        />
        <div>
          <h4>Sections</h4>
          {sections.map((section, index) => (
            <div key={index}>
              <p>{`${section.title}: ${section.duration} minutes`}</p>
              <button type="button" onClick={() => deleteSection(index)}>
                Delete Section
              </button>
            </div>
          ))}
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Section Title"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
          />
          <button type="button" onClick={addSection}>
            Add Section
          </button>
        </div>
        <button type="submit" disabled={loading}>
          Update Exam Config
        </button>
        <button type="button" onClick={handleDelete} disabled={loading}>
          Delete Config
        </button>
      </form>
    </div>
  );
};

export default EditExamConfig;
