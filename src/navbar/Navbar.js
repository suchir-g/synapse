import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Navbar.module.css";
function Navbar() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));

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
            <li className={styles.myStuffButton}>
              <Link to="/mystuff">My Stuff</Link>
            </li>
            <li className={styles.postButton}>
              <Link to="/post">Post</Link>
            </li>
            <Link to="/profile">
              <img src="./defaultprofileicon.png" alt="Profile icon" />
            </Link>
          </>
        ) : (
          <>
            <li className={styles.loginButton}>
              <Link to="/login">Login</Link>
            </li>
            <li className={styles.registerButton}>
              <Link to="/register">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
