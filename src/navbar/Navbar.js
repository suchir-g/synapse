import { Link } from "react-router-dom";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import logo from "../assets/logos/whiteTelescope.png";
import styles from "./Navbar.module.css";
import profileIcon from "../assets/icons/default-ison.png"; // Path to your default profile icon

function Navbar() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));
  // Assuming you have a way to get the profile picture URL. Use a default icon if not available.
  const [profilePicUrl, setProfilePicUrl] = useState(profileIcon);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <Link to="/" className={styles.navbar_brand}>
          <img src={logo} alt="Synapse Logo" />
          <span>Synapse</span>
        </Link>
      </div>
      <ul className={styles.navbar_links}>
        <li>
          <Link to="/post">Post</Link>
        </li>
        {isAuth ? (
          <>
            <li>
              <Link to="/mystuff">My Stuff</Link>
            </li>
            <li>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <a href="#" className={styles.dropdownTrigger}>
                    <img
                      src={profilePicUrl}
                      alt="Profile"
                      className={styles.profilePic}
                    />
                  </a>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className={styles.dropdownContent}>
                  <DropdownMenu.Item className={styles.dropdownItem}>
                    <Link to="/profile">View Profile</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.dropdownItem}>
                    <button
                      onClick={() => setIsAuth(false)}
                      className={styles.dropdownButton}
                    >
                      Logout
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
