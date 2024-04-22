import React from "react";
import styles from "./WebOnly.module.css";
const WebOnly = () => {
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.mainText}>Sorry, this feature isn't available for mobile just yet.</h1>
    </div>
  );
};

export default WebOnly;
