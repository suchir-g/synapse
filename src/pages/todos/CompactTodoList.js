import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import TodoItem from "./Todo";
import styles from "./CompactTodoList.module.css";

const CompactTodoList = ({ todoID }) => {
  const [todoList, setTodoList] = useState({ todos: [] });
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchTodos = async () => {
      const docRef = doc(db, "todoLists", todoID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTodoList({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchTodos();
  }, [todoID]);

  const toggleTodoCompletion = async (index) => {
    const newTodos = [...todoList.todos];
    newTodos[index].completed = !newTodos[index].completed;
    await updateDoc(doc(db, "todoLists", todoID), { todos: newTodos });
    setTodoList((prev) => ({
      ...prev,
      todos: newTodos,
    }));
  };

  const saveTodoEdit = async (index) => {
    if (editText.trim() === "") {
      cancelEditing();
      return;
    }
    const newTodos = [...todoList.todos];
    newTodos[index].text = editText;
    await updateDoc(doc(db, "todoLists", todoID), { todos: newTodos });
    setTodoList((prev) => ({
      ...prev,
      todos: newTodos,
    }));
    setIsEditing(null);
    setEditText("");
  };

  const startEditing = (index) => {
    setIsEditing(index);
    setEditText(todoList.todos[index].text);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditText("");
  };

  // filter for uncompleted todos before rendering
  const uncompletedTodos = todoList.todos.filter((todo) => !todo.completed);

  if (!uncompletedTodos.length) return <div>No uncompleted tasks</div>;

  return (
    <div className={styles.container}>
      <h1>{todoList.title}</h1>
      <ul className={styles.todoList}>
        {uncompletedTodos.slice(0, 5).map((todo, index) => (
          <TodoItem
            key={index}
            todo={todo}
            isEditing={isEditing === index}
            index={index}
            toggleTodoCompletion={toggleTodoCompletion}
            isEditingToggle={false}
            startEditing={startEditing}
            saveTodoEdit={saveTodoEdit}
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
