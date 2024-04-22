import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import styles from "./ShowTodos.module.css";

const ShowTodos = () => {
  const [todoLists, setTodoLists] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchTodoLists = async () => {
          const q = query(
            collection(db, "todoLists"),
            where("owner", "==", user.uid)
          );

          const querySnapshot = await getDocs(q);
          const listsArray = [];

          querySnapshot.forEach((doc) => {
            // push the entire document, including its Firestore ID
            listsArray.push({ id: doc.id, ...doc.data() });
          });

          setTodoLists(listsArray);
        };

        fetchTodoLists();
      } else {
        // user is signed out
        setTodoLists([]); // clear todo lists when user signs out
      }
    });

    return () => unsubscribe(); // clean up subscription on component unmount
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postFlashcardsContainer}>
        <h1 className={styles.postFlashcards}>My Todo Lists</h1>
        <p className={styles.mutedText}>Try use different todo lists for different projects to keep organised.</p>

      </div>
      <div className={styles.mainContent}>
        <ul>
          {todoLists.map((list, index) => (
            <Link to={`/todos/${list.id}`}>
              <li key={index} className={styles.todoList}>
                {list.name || "Untitled List"}
              </li>
            </Link>
          ))}
        </ul>
          <Link to="/todos/post"><div className={styles.postButton}>Create new todo list</div></Link>
      </div>
    </div>
  );
};

export default ShowTodos;
