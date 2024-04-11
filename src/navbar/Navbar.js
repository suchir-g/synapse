import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  const [showDropdown, setShowDropdown] = useState(false);
  let timeoutId;

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
                      <Link className={styles.dropdownItem} to="/mystuff/flashcards">Flashcards</Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/mystuff/notes">Notes</Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/mystuff/whiteboards">Whiteboards</Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/tags">Tags</Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/timers">Timers</Link>
                    </li>
                    <li className={styles.dropdownTab}>
                      <Link className={styles.dropdownItem} to="/todos">Todos</Link>
                    </li>                  </ul>
                </div>
              )}
            </li>
            <button onClick={() => {navigate("/post")}} className={styles.postButton}>
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
