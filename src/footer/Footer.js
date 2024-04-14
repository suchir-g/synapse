import React from "react";

import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
export function Footer() {
  return (
    <div className={styles.mainContainer}>
      <ul className={styles.aboutUs}>
        <li className={`${styles.header} ${styles.item}`}>About us</li>
        <Link to="/aboutus">
          <li className={styles.item}>About Synapse</li>
        </Link>
        <Link to="/aboutme">
          <li className={styles.item}>About Me</li>
        </Link>
        <Link to="https://github.com/suchir-g/synapse">
          <li className={styles.item}>Documentation</li>
        </Link>
      </ul>
      <ul className={styles.contactUs}>
        <li className={`${styles.header} ${styles.item}`}>Contact Us</li>
        <Link to="mailto:18sgupta@heckgrammar.co.uk">
          <li className={styles.item}>Email</li>
        </Link>
        <Link to="https://www.linkedin.com/in/suchirgpta/">
          <li className={styles.item}>LinkedIn</li>
        </Link>
      </ul>
      <ul className={styles.resources}>
        <li className={`${styles.header} ${styles.item}`}>Resources</li>
        <Link to="/toptips">
          <li className={styles.item}>How to revise</li>
        </Link>
        <Link to="https://1drv.ms/w/s!AnzR4qFMVVLAgi0dSj3CM9SVI8Vn?e=IQF5PK">
          <li className={styles.item}>Study Research</li>
        </Link>
        <Link to="/othertools">
          <li className={styles.item}>Other tools</li>
        </Link>
      </ul>

    </div>
  );
}
