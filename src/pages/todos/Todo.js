import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTrash,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Todo.module.css";
import React from "react";

const TodoItem = ({
  todo,
  isEditing,
  toggleTodoCompletion,
  startEditing,
  saveTodoEdit,
  cancelEditing,
  setEditText,
  editText,
  deleteTodo,
  isCompleted
}) => {
  const handleCheckboxChange = () => {
    toggleTodoCompletion(todo, !todo.completed);
  };

  return (
    <li className={`${styles.todoItem} ${isCompleted ? styles.completedInput : styles.notCompletedInput}`}>
      {isEditing === todo ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={styles.editText}
          />
          <button onClick={() => saveTodoEdit(todo, todo.completed)}>
            Save
          </button>
          <button onClick={cancelEditing}>Cancel</button>
          <button onClick={() => deleteTodo(todo)}>
            <FontAwesomeIcon icon={faTrash} />{" "}
            {/* Use the trash icon for delete */}
          </button>
        </>
      ) : (
        <>
          <input
            id={`checkbox-${todo.text}`}
            type="checkbox"
            checked={todo.completed}
            onChange={handleCheckboxChange}
            className={`${styles.CheckboxInput} `}
          />
          <p className={`${styles.todoText} ${isCompleted ? styles.completed : styles.notCompleted}`}>{todo.text}</p>
          <span className={styles.buttons}>
            {editText && <button
              onClick={() => startEditing(todo)}
              className={`${styles.button} ${styles.edit}`}
            >
              <FontAwesomeIcon icon={faPencilAlt} />{" "}
            </button>}
            {deleteTodo && (
              <button
                onClick={() => deleteTodo(todo)}
                className={`${styles.button} ${styles.remove}`}
              >
                <FontAwesomeIcon icon={faTrash} />{" "}
              </button>
            )}
          </span>
        </>
      )}
    </li>
  );
};

export default TodoItem;
