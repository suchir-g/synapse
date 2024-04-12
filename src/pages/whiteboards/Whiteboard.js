import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line, Image as KonvaImage, Rect } from "react-konva";
import { auth, db } from "../../config/firebase";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { deleteObject } from "firebase/storage";
import {
  getStorage,
  ref as firebaseStorageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Text } from "react-konva";
import LoadingComponent from "LoadingComponent";

import styles from "./Whiteboard.module.css";

const Whiteboard = ({ whiteboardID }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tool, setTool] = useState("pen"); // 'pen', 'eraser', 'pencil'
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [penSize, setPenSize] = useState(5);
  const [color, setColor] = useState("#000000");
  const [title, setTitle] = useState("Untitled");
  const isDrawing = useRef(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [image, setImage] = useState(null);
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedTextBoxId, setSelectedTextBoxId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [backgroundType, setBackgroundType] = useState("plain");
  const [backgroundShapes, setBackgroundShapes] = useState([]);
  const [opacity, setOpacity] = useState(1); // opacity range between 0 (transparent) and 1 (opaque)

  const stageRef = useRef();
  const navigate = useNavigate();

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
  }, [lines, history]); // depend on lines and history to ensure they are up-to-date

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // set the crossOrigin attribute
    img.onload = () => setImage(img);
    img.src = backgroundImage; // the URL of the image
  }, [backgroundImage]); // depend on backgroundImage to re-run effect

  useEffect(() => {
    // auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
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
    // async function to load the whiteboard data
    const loadWhiteboard = async (whiteboardID) => {
      if (!whiteboardID) {
        setTitle(""); // No title for a new/empty whiteboard
        setBackgroundImage(null); // No background image
        setIsLoading(false);
        return
      }

      const docRef = doc(db, "whiteboards", whiteboardID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const whiteboardData = docSnap.data();

        setTitle(whiteboardData.title);
        setBackgroundImage(whiteboardData.downloadURL);
        setIsLoading(false);
      }
    };

    loadWhiteboard();
  }, [whiteboardID]);

  useEffect(() => {
    updateBackgroundShapes();
  }, [backgroundType]); // depend on backgroundType to re-generate shapes

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
    setHistory([...history, [...lines]]);
  };

  const addLine = (point) => {
    const newLines = [
      ...lines,
      { tool, points: [point.x, point.y], penSize, color, opacity },
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

  const updateBackgroundShapes = () => {
    const width = window.innerWidth - 100;
    const height = window.innerHeight;
    const lineSpacing = 50; // adjust as needed

    let shapes = [];

    if (backgroundType === "lined") {
      for (let i = 0; i < height / lineSpacing; i++) {
        shapes.push({ type: "Line", y: i * lineSpacing });
      }
    } else if (backgroundType === "squared") {
      for (let i = 0; i < width / lineSpacing; i++) {
        for (let j = 0; j < height / lineSpacing; j++) {
          shapes.push({ type: "Rect", x: i * lineSpacing, y: j * lineSpacing });
        }
      }
    }

    setBackgroundShapes(shapes);
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
    if (history.length === 0) return; // exit if there's nothing to undo

    const previousState = history[history.length - 2]; // get the state before the last action
    setLines(previousState || []); // revert to the previous state, or empty if none exists
    setHistory(history.slice(0, history.length - 1)); // remove the last action from history
  };

  const resetDrawing = () => {
    // reset React state variables
    setLines([]);
    setHistory([]);
    setBackgroundImage(null); // reset background image state if necessary

    // access the Konva Stage and iterate over all layers to clear
    const stage = stageRef.current;
    if (stage) {
      const layers = stage.getLayers();
      layers.forEach((layer) => {
        layer.removeChildren(); // removes all shapes from the layer
        layer.draw(); // redraw the layer to reflect changes
      });
    }
  };

  const deleteDrawingFromStorage = async () => {
    if (!whiteboardID || !auth.currentUser) {
      console.log("No whiteboard ID provided or user is not authenticated");
      return;
    }

    const storage = getStorage(); // ensure you have initialized Firebase Storage
    const filePath = `drawings/${auth.currentUser.uid}/${whiteboardID}.png`;
    const storageRef = firebaseStorageRef(storage, filePath);
    console.log("Deleting file at path:", filePath);
    try {
      await deleteObject(storageRef);
      console.log("File deleted successfully from storage");
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  };

  const deleteDrawingFromFirestore = async () => {
    if (!whiteboardID) {
      console.log("No whiteboard ID provided");
      return;
    }

    const docRef = doc(db, "whiteboards", whiteboardID);

    try {
      await deleteDoc(docRef);
      console.log("Document deleted successfully from Firestore");
    } catch (error) {
      console.error("Error deleting document from Firestore:", error);
    }
  };

  const deleteDrawing = async () => {
    if (!whiteboardID || !auth.currentUser) {
      console.log("No whiteboard ID provided or user is not authenticated");
      return;
    }

    await deleteDrawingFromStorage();
    await deleteDrawingFromFirestore();

    setLines([]);
    setHistory([]);
    setBackgroundImage(null);
    navigate("/mystuff/whiteboards");
  };

  const addTextBox = () => {
    const newText = {
      x: 50, // default position
      y: 50, // default position
      text: "New Text",
      fontSize: 20,
      color: "#000000",
      id: textBoxes.length + 1, // simple ID assignment
    };
    setTextBoxes([...textBoxes, newText]);
  };

  const lineSpacing = 50;
  const stageWidth = window.innerWidth - 100; // match the container width

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginRight: "10px" }}>
        <input
          type="text"
          placeholder="Enter drawing title"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // update title state when input changes
        />
        <div>
          {/* background selection UI */}
          <button
            className={`${styles.button}`}
            onClick={() => setBackgroundType("plain")}
          >
            Plain Background
          </button>
          <button
            className={`${styles.button}`}
            onClick={() => setBackgroundType("lined")}
          >
            Lined Background
          </button>
          <button
            className={`${styles.button}`}
            onClick={() => setBackgroundType("squared")}
          >
            Squared Background
          </button>
        </div>
        <button className={`${styles.button}`} onClick={() => setTool("pen")}>
          Pen
        </button>
        <button
          className={`${styles.button}`}
          onClick={() => setTool("pencil")}
        >
          Pencil
        </button>
        <button
          className={`${styles.button}`}
          onClick={() => setTool("eraser")}
        >
          Eraser
        </button>
        <button className={`${styles.button}`} onClick={addTextBox}>
          Add Text Box
        </button>
        <br />
        <button onClick={resetDrawing}>Reset</button> <br />
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
        <br />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
        <br />
        {isEditing && (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                // update the text of the selected textbox and close the editor
                const updatedTextBoxes = textBoxes.map((box) =>
                  box.id === selectedTextBoxId
                    ? { ...box, text: editText }
                    : box
                );
                setTextBoxes(updatedTextBoxes);
                setIsEditing(false);
                setSelectedTextBoxId(null);
              }
            }}
          />
        )}
      </div>
      <div
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: window.innerWidth - 100,
          height: window.innerHeight,
        }}
      >
        <Stage
          width={window.innerWidth - 100}
          height={window.innerHeight} //
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {backgroundShapes.map((shape, i) => {
              if (shape.type === "Line") {
                return (
                  <Line
                    key={i}
                    points={[0, shape.y, stageWidth, shape.y]}
                    strokeWidth={1}
                  />
                );
              } else if (shape.type === "Rect") {
                return (
                  <Rect
                    key={i}
                    x={shape.x}
                    y={shape.y}
                    width={lineSpacing}
                    height={lineSpacing}
                    stroke="#ddd"
                    strokeWidth={1}
                  />
                );
              }
              return null;
            })}
          </Layer>
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
                stroke={line.color}
                strokeWidth={line.penSize}
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
                tension={0.5}
                lineCap="round"
                opacity={line.opacity}
              />
            ))}

            {textBoxes.map((box, i) => (
              <Text
                key={i}
                x={box.x}
                y={box.y}
                text={box.text}
                fontSize={box.fontSize}
                fill={box.color}
                draggable
                onDragEnd={(e) => {
                  // update position in the state
                  const updatedTextBoxes = textBoxes.slice();
                  updatedTextBoxes[i] = {
                    ...box,
                    x: e.target.x(),
                    y: e.target.y(),
                  };
                  setTextBoxes(updatedTextBoxes);
                }}
                onDblClick={() => {
                  setSelectedTextBoxId(box.id);
                  setEditText(box.text);
                  setIsEditing(true);
                }}
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
      <button
        onClick={deleteDrawing}
        style={{ position: "absolute", right: 20, top: 35 }}
      >
        Delete Drawing
      </button>
    </div>
  );
};

export default Whiteboard;
