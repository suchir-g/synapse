import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog";

import TodoItem from "./Todo";
import styles from "./ViewTodo.module.css";

const ViewTodo = () => {
  const { todoID } = useParams();
  const [todoList, setTodoList] = useState(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchTodoList = async () => {
      const docRef = doc(db, "todoLists", todoID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTodoList({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchTodoList();
  }, [todoID]);

  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    const todoToAdd = { text: newTodoText, completed: false };
    await updateDoc(doc(db, "todoLists", todoID), {
      todos: [...todoList.todos, todoToAdd],
    });
    setTodoList((prev) => ({
      ...prev,
      todos: [...prev.todos, todoToAdd],
    }));
    setNewTodoText("");
  };

  const toggleTodoCompletion = async (index) => {
    const newTodos = [...todoList.todos];
    newTodos[index].completed = !newTodos[index].completed;
    await updateDoc(doc(db, "todoLists", todoID), { todos: newTodos });
    setTodoList((prev) => ({
      ...prev,
      todos: newTodos,
    }));
  };

  const startEditing = (index) => {
    setIsEditing(index);
    setEditText(todoList.todos[index].text);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditText("");
  };

  const saveTodoEdit = async (index) => {
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

  if (!todoList) return <div>Loading...</div>;

  // Separating completed and uncompleted todos
  const completedTodos = todoList.todos.filter((todo) => todo.completed);
  const uncompletedTodos = todoList.todos.filter((todo) => !todo.completed);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{todoList.title}</h2>
      <h3>Uncompleted Todos</h3>
      <ul>
        {uncompletedTodos.map((todo, index) => (
          <TodoItem
            key={index}
            todo={todo}
            isEditing={isEditing}
            index={index}
            toggleTodoCompletion={toggleTodoCompletion}
            isEditingToggle={true}
            startEditing={startEditing}
            saveTodoEdit={saveTodoEdit}
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
            key={index + uncompletedTodos.length} // Ensure unique keys
            todo={todo}
            isEditing={isEditing}
            index={index + uncompletedTodos.length} // Adjust index for completed todos
            toggleTodoCompletion={toggleTodoCompletion}
            isEditingToggle={true}
            startEditing={startEditing}
            saveTodoEdit={saveTodoEdit}
            cancelEditing={cancelEditing}
            setEditText={setEditText}
            editText={editText}
          />
        ))}
      </ul>

      <Dialog>
        <DialogTrigger asChild>
          <button className={styles.button}>Add Todo</button>
        </DialogTrigger>
        <DialogContent className={styles.dialogContent}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Todo text"
          />
          <button onClick={addTodo}>Add Todo</button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewTodo;
