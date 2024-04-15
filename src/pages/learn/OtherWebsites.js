import React from "react";
import styles from "./OtherWebsites.module.css";
import { Link } from "react-router-dom";

const OtherWebsites = () => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.flashcard}>
        <h1 className={styles.mainText}>Other tools and websites</h1>
        <p>
          <Link to="https://www.khanacademy.org/">
            <h1 className={styles.link}>Khan Academy</h1>
          </Link>
          - Offers comprehensive lessons on a wide range of subjects including
          maths, science, and economics. It provides practice exercises and
          instructional videos that are great for students of all levels.
        </p>
        <p>
          <Link to="https://www.physicsandmathstutor.com/">
            <h1 className={styles.link}>Physics and Maths Tutor</h1>
          </Link>
          - A specialized resource for students studying physics and
          mathematics. It includes revision notes, practice questions, and
          worksheets for GCSE, A-Level, and beyond.
        </p>
        <p>
          <Link to="https://www.wolframalpha.com/">
            <h1 className={styles.link}>Wolfram Alpha</h1>
          </Link>
          - Known as a computational knowledge engine, it provides answers to
          math problems, generates plots, and even solves equations. It’s an
          excellent tool for higher-level maths and science.
        </p>
        <p>
          <Link to="https://tutorial.math.lamar.edu/">
            <h1 className={styles.link}>Paul's Online Math Notes</h1>
          </Link>
          - Provides detailed notes and tutorials on mathematical topics,
          particularly useful for college-level students. It covers algebra,
          calculus, and differential equations.
        </p>
        <p>
          <Link to="https://www.coursera.org/">
            <h1 className={styles.link}>Coursera</h1>
          </Link>
          - While it offers a wide range of courses, you can find specific
          university-level courses in physics, mathematics, and other subjects.
          Many courses are free to audit.
        </p>
        <p>
          <Link to="https://www.bbc.co.uk/bitesize">
            <h1 className={styles.link}>BBC Bitesize</h1>
          </Link>
          - A useful resource for UK students, offering study guides, videos,
          and quizzes across a range of subjects including GCSE and A-Level
          curricula.
        </p>
        <p>
          <Link to="https://projecteuler.net/">
            <h1 className={styles.link}>Project Euler</h1>
          </Link>
          - A series of challenging mathematical/computer programming problems
          that require more than just mathematical insights to solve. Great for
          students looking to apply their knowledge in practical scenarios.
        </p>
        <p>
          <Link to="https://brilliant.org/">
            <h1 className={styles.link}>Brilliant.org</h1>
          </Link>
          - Focuses on problem-solving and critical thinking with courses in
          math, science, and computer science. It’s designed to help build
          quantitative skills in a fun and engaging way.
        </p>
        <p>
          <Link to="https://openstax.org/">
            <h1 className={styles.link}>OpenStax</h1>
          </Link>
          - Provides free, peer-reviewed, openly licensed textbooks, which are
          available in a digital format. The site covers subjects such as
          physics, mathematics, biology, and more.
        </p>
        <p>
          <Link to="https://ocw.mit.edu/">
            <h1 className={styles.link}>MIT OpenCourseWare</h1>
          </Link>
          - Offers a vast range of free course materials from a wide variety of
          courses taught at MIT, perfect for advanced learners looking to deepen
          their understanding in specific areas like physics and mathematics.
        </p>
        <p>
          <Link to="https://www.edx.org/">
            <h1 className={styles.link}>edX</h1>
          </Link>
          - Provides university-level courses in a wide range of disciplines
          from institutions around the world. Useful for students looking for
          structured learning in specific academic fields.
        </p>
        <p>
          <Link to="https://www.codecademy.com/">
            <h1 className={styles.link}>Codecademy</h1>
          </Link>
          - A platform that offers free coding classes in 12 different
          programming languages including Python, Java, JavaScript, Ruby, SQL,
          and more. Ideal for students interested in computer science and
          programming basics.
        </p>
        <p>
          <Link to="http://hyperphysics.phy-astr.gsu.edu/hbase/index.html">
            <h1 className={styles.link}>HyperPhysics</h1>
          </Link>
          - A comprehensive educational resource for physics topics, hosted by
          Georgia State University. It offers concept maps and easy-to-navigate
          information that covers a broad range of physics topics.
        </p>
      </div>
    </div>
  );
};

export default OtherWebsites;
