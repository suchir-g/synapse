import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./MyStuffLoadingComponent.module.css";

const LoadingComponent = ({ flexSize = false }) => {
    return (
        <div className={`${styles.mainContainer} ${flexSize ? styles.fullHeight : styles.partialHeight}`}>
            <div className={styles.loadingIcon}></div>
            <h3 className={styles.mainText} >Loading revision material</h3>
        </div>
    );
};

export default LoadingComponent;
