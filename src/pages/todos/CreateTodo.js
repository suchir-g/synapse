import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CreateTodoList = ({ isAuth }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  const todoListsRef = collection(db, "todoLists");

  const [listName, setListName] = useState(""); // state to hold the name of the todo list
  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useState([]);

  const addTodo = () => {
    if (!todoText.trim()) return;
    setTodos([...todos, { text: todoText, completed: false }]);
    setTodoText(""); // clear input after adding
  };

  const handleCreateList = async (e) => {
    e.preventDefault();

    if (!listName.trim()) {
      console.error("A name for the todo list is required");
      return;
    }

    if (todos.length === 0) {
      console.error("At least one todo is required");
      return;
    }

    try {
      await addDoc(todoListsRef, {
        name: listName, // add the list name here
        owner: auth.currentUser.uid,
        todos: todos,
        createdAt: serverTimestamp(),
        main: true, // set the "main" field to true for the new todo list
      });

      navigate("/todos");
    } catch (error) {
      console.error("Error creating todo list: ", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateList}>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="List Name"
        />
        <input
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          placeholder="Add Todo"
        />
        <button type="button" onClick={addTodo}>
          Add Todo
        </button>

        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{todo.text}</li>
          ))}
        </ul>

        <button type="submit">Create Todo List</button>
      </form>
    </div>
  );
};

export default CreateTodoList;
