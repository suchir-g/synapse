import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./LoadingComponent.module.css";

const LoadingComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [quote, setQuote] = useState(null);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await axios.get('https://type.fit/api/quotes');
                const data = response.data;
                const randomIndex = Math.floor(Math.random() * data.length);
                setQuote(data[randomIndex]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching quote:', error);
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, []);


    if (!quote) {
        return (<div className={styles.mainContainer}>
            <div className={styles.loadingIcon}></div>
            <div className={styles.quoteSection}>
                {!isLoading && <><p className={styles.quoteText}>"You have network connectivity issues"</p>
                    <p>- Suchir Gupta</p></>}
            </div>
        </div>)
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.loadingIcon}></div>
            <div className={styles.quoteSection}>
                {!isLoading && <><p className={styles.quoteText}>"{quote.text}"</p>
                    <p>- {quote.author ? quote.author : "Unknown"}</p></>}
            </div>
        </div>
    );
};

export default LoadingComponent;
