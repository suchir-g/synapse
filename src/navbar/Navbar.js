import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import React from "react";
import { query, collection, where, limit, getDocs } from "firebase/firestore";
import { auth, db } from "config/firebase";
function Navbar({ isAuth, setIsAuth }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mainTodoListId, setMainTodoListId] = useState("");
  let timeoutId;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const todoListsQuery = query(
          collection(db, "todoLists"),
          where("owner", "==", user.uid),
          where("main", "==", true),
        );
        const todoListsSnapshot = await getDocs(todoListsQuery);
        if (!todoListsSnapshot.empty) {
          setMainTodoListId(todoListsSnapshot.docs[0].id);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuth(localStorage.getItem("isAuth") === "true");
    };

    window.addEventListener("storage", handleAuthChange);

    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(timeoutId);
    setShowDropdown(true);
  };

  const handleDropdownMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setShowDropdown(false);
    }, 200); // 200 milliseconds delay
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <Link to="/" className={styles.navbar_brand}>
          <span>Synapse</span>
        </Link>
      </div>
      <ul className={styles.navbar_links}>
        {isAuth ? (
          <>
            <li
              className={styles.navbar_item}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className={styles.myStuffButton}>
                <Link to="/mystuff">My Stuff</Link>
              </span>
              {showDropdown && (
                <div
                  className={styles.dropdown}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <ul>
                    <li className={styles.dropdownTab}>
                      <Link
                        className={styles.dropdownItem}
                        to="/mystuff/flashcards"
                      >
                        Flashcards
                      </Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/mystuff/notes">
                        Notes
                      </Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link
                        className={styles.dropdownItem}
                        to="/mystuff/whiteboards"
                      >
                        Whiteboards
                      </Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/tags">
                        Tags
                      </Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/timers">
                        Timers
                      </Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to={`/todos/${mainTodoListId}`}>
                        Todos
                      </Link>
                    </li>{" "}
                  </ul>
                </div>
              )}
            </li>
            <button
              onClick={() => {
                navigate("/post");
              }}
              className={styles.postButton}
            >
              Post
            </button>
            <li>
              <Link to="/profile">
                <img src="./defaultprofileicon.png" alt="Profile icon" />
              </Link>
            </li>
          </>
        ) : (
          <>
            <Link to="/login">
              <li className={styles.loginButton}>Login</li>
            </Link>
            <Link to="/register">
              <li className={styles.registerButton}>Sign Up</li>
            </Link>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
