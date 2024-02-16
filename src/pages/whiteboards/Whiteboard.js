import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import { auth, db } from "../../config/firebase";
import { addDoc, collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import useImage from "use-image";

import {
  getStorage,
  ref as firebaseStorageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const Whiteboard = ({ whiteboardID }) => {
  const [tool, setTool] = useState("pen"); // 'pen', 'eraser', 'pencil'
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [penSize, setPenSize] = useState(5);
  const [color, setColor] = useState("#000000");
  const [title, setTitle] = useState("Title");
  const isDrawing = useRef(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [image, setImage] = useState(null);
  const stageRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "z") {
        undoLastAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lines, history]); // Depend on lines and history to ensure they are up-to-date

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Set the crossOrigin attribute
    img.onload = () => setImage(img);
    img.src = backgroundImage; // The URL of the image
  }, [backgroundImage]); // Depend on backgroundImage to re-run effect

  useEffect(() => {
    // auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // user is signed in, you can now use `user` object to perform actions
        console.log("User is signed in", user);
      } else {
        // user is signed out
        console.log("User is signed out");
      }
    });

    // cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Define an async function to load the whiteboard data
    const loadWhiteboard = async () => {
      if (!whiteboardID) return;
      const docRef = doc(db, "whiteboards", whiteboardID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const whiteboardData = docSnap.data();

        setBackgroundImage(whiteboardData.downloadURL);
        console.log(image);
        console.log("No such whiteboard!");
      }
    };

    // Call the loadWhiteboard function defined above
    loadWhiteboard();

    // The useEffect hook's dependency array includes whiteboardID,
    // which means this hook will rerun if the whiteboardID prop changes,
    // ensuring that the component can respond to changes in the whiteboardID prop dynamically.
  }, [whiteboardID]); // Dependency array with whiteboardID

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    addLine(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    updateLine(point);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    setHistory([...history, lines]);
  };

  const addLine = (point) => {
    const newLines = [
      ...lines,
      { tool, points: [point.x, point.y], penSize, color },
    ];
    setLines(newLines);
  };

  const updateLine = (point) => {
    const lastLine = lines[lines.length - 1];
    const newPoints = lastLine.points.concat([point.x, point.y]);
    const updatedLines = lines
      .slice(0, lines.length - 1)
      .concat([{ ...lastLine, points: newPoints }]);
    setLines(updatedLines);
  };

  const saveDrawing = async () => {
    const dataURL = stageRef.current.toDataURL();
    const blob = await (await fetch(dataURL)).blob();
    const user = auth.currentUser;

    if (user) {
      const storage = getStorage();
      let docRef;
      let isNewDocument = false;

      if (whiteboardID) {
        // update existing document
        docRef = doc(db, "whiteboards", whiteboardID);
      } else {
        // create new document and get the reference
        docRef = await addDoc(collection(db, `whiteboards`), {
          title: title || "Untitled",
          author: user.uid,
          createdAt: new Date(),
        });
        isNewDocument = true;
      }

      const storagePath = `drawings/${user.uid}/${docRef.id}.png`;
      const fileRef = firebaseStorageRef(storage, storagePath);

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      if (isNewDocument) {
        await updateDoc(docRef, { downloadURL: downloadURL });
      } else {
        // update the existing document's downloadURL and title
        await updateDoc(docRef, { downloadURL: downloadURL, title: title });
      }

      console.log("Drawing saved with ID: ", docRef.id);
    } else {
      console.log("User is not authenticated");
    }
  };

  const undoLastAction = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setLines(previousState);
      setHistory(history.slice(0, history.length - 1));
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginRight: "10px" }}>
        <input
          type="text"
          placeholder="Enter drawing title"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Update title state when input changes
        />
        <button onClick={() => setTool("pen")}>Pen</button>
        <button onClick={() => setTool("pencil")}>Pencil</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>
        <br />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <br />
        <input
          type="range"
          min="1"
          max="30"
          value={penSize}
          onChange={(e) => setPenSize(parseInt(e.target.value))}
        />
      </div>
      <div
        style={{
          backgroundSize: "cover", // Cover the entire area of the div
          backgroundPosition: "center", // Center the background image
          width: window.innerWidth - 100, // Adjust width as needed
          height: window.innerHeight, // Adjust height as needed
        }}
      >
        <Stage
          width={window.innerWidth - 100} // Match the container width
          height={window.innerHeight} // Match the container height
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={window.innerWidth - 100}
                height={window.innerHeight}
              />
            )}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === "eraser" ? "#FFFFFF" : line.color}
                strokeWidth={line.penSize}
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
                tension={0.5}
                lineCap="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <button
        onClick={saveDrawing}
        style={{ position: "absolute", right: 20, top: 10 }}
      >
        Save Drawing
      </button>
    </div>
  );
};

export default Whiteboard;
