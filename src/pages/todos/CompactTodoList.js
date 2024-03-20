import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import TodoItem from "./Todo";
import styles from "./CompactTodoList.module.css";

const CompactTodoList = ({ todoID }) => {
  const [completedTodos, setCompletedTodos] = useState([]);
  const [uncompletedTodos, setUncompletedTodos] = useState([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [newTodoText, setNewTodoText] = useState(""); // State for new todo input
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // Define fetchTodos inside useEffect to ensure it's defined
    const fetchTodos = async () => {
      const docRef = doc(db, "todoLists", todoID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodoTitle(data.title);
        const todos = data.todos || [];
        setCompletedTodos(todos.filter((todo) => todo.completed));
        setUncompletedTodos(todos.filter((todo) => !todo.completed));
      } else {
        console.log("No such document!");
      }
    };

    fetchTodos();
  }, [todoID]);

  const updateTodos = async (newUncompletedTodos, newCompletedTodos) => {
    const updatedTodos = [...newUncompletedTodos, ...newCompletedTodos];
    await updateDoc(doc(db, "todoLists", todoID), { todos: updatedTodos });
    setUncompletedTodos(newUncompletedTodos);
    setCompletedTodos(newCompletedTodos);
  };

  const addNewTodo = async () => {
    if (!newTodoText.trim()) return;
    const newTodo = { text: newTodoText, completed: false };
    // Update the state directly instead of re-fetching from the database
    setUncompletedTodos((prevTodos) => [...prevTodos, newTodo]);
    setNewTodoText(""); // Clear the input after adding
    await updateDoc(doc(db, "todoLists", todoID), {
      todos: [...uncompletedTodos, newTodo, ...completedTodos],
    });
  };

  const toggleTodoCompletion = async (index) => {
    let newUncompletedTodos = [...uncompletedTodos];
    let todo = newUncompletedTodos.splice(index, 1)[0];
    todo.completed = !todo.completed;
    let newCompletedTodos = [todo, ...completedTodos];
    await updateTodos(newUncompletedTodos, newCompletedTodos);
  };

  const saveTodoEdit = async (index) => {
    if (editText.trim() === "") {
      cancelEditing();
      return;
    }
    let newUncompletedTodos = [...uncompletedTodos];
    newUncompletedTodos[index] = {
      ...newUncompletedTodos[index],
      text: editText,
    };
    await updateTodos(newUncompletedTodos, completedTodos);
    setIsEditing(null);
    setEditText("");
  };

  const startEditing = (index) => {
    setIsEditing(index);
    setEditText(uncompletedTodos[index].text);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditText("");
  };

  if (!uncompletedTodos.length) return <div>No uncompleted tasks</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.todoListTitle}>
        <Link to={`/todos/${todoID}`}>Todo List: </Link>
        <b className={styles.todoNameBold}>
          <Link to={`/todos/${todoID}`}>{todoTitle}</Link>
        </b>
      </h1>
      <div className={styles.addTodoSection}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="E.g. Maths HW  "
          className={styles.todoInput}
        />
        <button onClick={addNewTodo} className={styles.addTodo}>
          Add
        </button>
      </div>

      <ul className={styles.todoList}>
        {uncompletedTodos.slice(0, 5).map((todo, index) => (
          <TodoItem
            key={index}
            todo={todo}
            isEditing={isEditing === index}
            index={index}
            toggleTodoCompletion={() => toggleTodoCompletion(index)}
            isEditingToggle={false}
            startEditing={() => startEditing(index)}
            saveTodoEdit={() => saveTodoEdit(index)}
            cancelEditing={cancelEditing}
            setEditText={setEditText}
            editText={isEditing === index ? editText : ""}
          />
        ))}
      </ul>
    </div>
  );
};

export default CompactTodoList;
