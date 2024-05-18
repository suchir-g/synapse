import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

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
    <div>
      <h2>My Todo Lists</h2>
      <ul>
        {todoLists.map((list, index) => (
          <li key={index}>
            {/* link to the detailed view of the todo list */}
            <Link to={`/todos/${list.id}`}>
              {list.title || "Untitled List"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowTodos;
