import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import TodoItem from "./Todo";
import styles from "./ViewTodo.module.css";

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
        setTodoTitle(data.title);
        const todos = data.todos || [];
        setCompletedTodos(todos.filter((todo) => todo.completed));
        setUncompletedTodos(todos.filter((todo) => !todo.completed));
      } else {
        console.log("No such document!");
      }
    };

    fetchTodoList();
  }, [todoID]);

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

  if (!todoTitle) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{todoTitle}</h2>
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
          />
        ))}
      </ul>

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
          />
        ))}
      </ul>

      <button className={styles.button}>Add Todo</button>
      <input
        type="text"
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        placeholder="Todo text"
      />
      <button onClick={addTodo}>Add Todo</button>
    </div>
  );
};

export default ViewTodo;
