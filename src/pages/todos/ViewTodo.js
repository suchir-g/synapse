import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import TodoItem from "./Todo";
import styles from "./ViewTodo.module.css";
import LoadingComponent from "LoadingComponent";

const ViewTodo = () => {
  const { todoID } = useParams();
  const [completedTodos, setCompletedTodos] = useState([]);
  const [uncompletedTodos, setUncompletedTodos] = useState([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [newTodoText, setNewTodoText] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchTodoList = async () => {
      const docRef = doc(db, "todoLists", todoID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTodoTitle(data.name);
        const todos = data.todos || [];
        setCompletedTodos(todos.filter((todo) => todo.completed));
        setUncompletedTodos(todos.filter((todo) => !todo.completed));
      } else {
        console.log("No such document!");
      }
    };

    fetchTodoList();
  }, [todoID]);

  const deleteTodo = async (todo) => {
    const updatedTodos = [...uncompletedTodos, ...completedTodos].filter(
      (t) => t !== todo
    );
    await updateTodos(updatedTodos);
  };

  const updateTodos = async (todos) => {
    await updateDoc(doc(db, "todoLists", todoID), { todos });
    setCompletedTodos(todos.filter((todo) => todo.completed));
    setUncompletedTodos(todos.filter((todo) => !todo.completed));
  };

  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    const todoToAdd = { text: newTodoText, completed: false };
    const updatedTodos = [...uncompletedTodos, todoToAdd];
    await updateTodos([...updatedTodos, ...completedTodos]);
    setNewTodoText("");
  };

  const toggleTodoCompletion = async (todo, isCompleted) => {
    const updatedTodo = { ...todo, completed: !isCompleted };
    const updatedTodos = isCompleted
      ? [...uncompletedTodos, updatedTodo].concat(
          completedTodos.filter((t) => t !== todo)
        )
      : [...completedTodos, updatedTodo].concat(
          uncompletedTodos.filter((t) => t !== todo)
        );
    await updateTodos(updatedTodos);
  };

  const startEditing = (todo) => {
    setIsEditing(todo);
    setEditText(todo.text);
  };

  const saveTodoEdit = async (todo, isCompleted) => {
    const newTodos = (isCompleted ? completedTodos : uncompletedTodos).map(
      (t) => (t === todo ? { ...t, text: editText } : t)
    );
    await updateTodos([
      ...newTodos,
      ...(isCompleted ? uncompletedTodos : completedTodos),
    ]);
    cancelEditing();
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditText("");
  };

  if (!todoTitle) return <LoadingComponent />;

  return (
    <div>
      <div className={styles.mainContainer}>
        <Link to="/todos"><div className={styles.allTodos}>All todo lists</div></Link>
        <div className={styles.postFlashcardsContainer}>
          <h1 className={styles.postFlashcards}>{todoTitle}</h1>
          <p className={styles.mutedText}>
            Go to{" "}
            <Link className={styles.learnLink} to="/learn/revise">
              this page
            </Link>{" "}
            to learn how to effectively organise material.
          </p>
        </div>
        <div className={styles.mainContent}>
          <h3>Uncompleted Todos</h3>
          <ul>
            {uncompletedTodos.map((todo, index) => (
              <TodoItem
                key={index}
                todo={todo}
                isEditing={isEditing === todo}
                index={index}
                toggleTodoCompletion={() => toggleTodoCompletion(todo, false)}
                startEditing={() => startEditing(todo)}
                saveTodoEdit={() => saveTodoEdit(todo, false)}
                cancelEditing={cancelEditing}
                setEditText={setEditText}
                editText={editText}
                deleteTodo={() => deleteTodo(todo)}
                isCompleted={false}
              />
            ))}
          </ul>
          <div className={styles.addTodoSection}>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Todo text"
              className={styles.input}
            />
            <button onClick={addTodo} className={styles.addTodoButton}>
              Add Todo
            </button>
          </div>
          <h3>Completed Todos</h3>
          <ul>
            {completedTodos.map((todo, index) => (
              <TodoItem
                key={index}
                todo={todo}
                isEditing={isEditing === todo}
                index={index}
                toggleTodoCompletion={() => toggleTodoCompletion(todo, true)}
                startEditing={() => startEditing(todo)}
                saveTodoEdit={() => saveTodoEdit(todo, true)}
                cancelEditing={cancelEditing}
                setEditText={setEditText}
                editText={editText}
                deleteTodo={() => deleteTodo(todo)}
                isCompleted={true}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewTodo;
