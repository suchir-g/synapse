import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./Todo.module.css";

const TodoItem = ({
  todo,
  isEditing,
  index,
  toggleTodoCompletion,
  startEditing,
  saveTodoEdit,
  cancelEditing,
  setEditText,
  editText,
  isEditingToggle,
}) => {
  const todoItemClass = isEditingToggle
    ? `${styles.todoItem} ${styles.long}`
    : styles.todoItem;

  const handleCheckboxChange = () => {
    toggleTodoCompletion(index);
  };

  return (
    <li className={todoItemClass}>
      {isEditing === index ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={styles.editText}
          />
          <button onClick={() => saveTodoEdit(index)}>Save</button>
          <button onClick={cancelEditing}>Cancel</button>
        </>
      ) : (
        <>
          <input
            id={`checkbox-${index}`}
            type="checkbox"
            checked={todo.completed}
            onChange={handleCheckboxChange}
            className={styles.CheckboxInput}
          />
          <label htmlFor={`checkbox-${index}`} className={styles.CheckboxLabel}>
            {todo.completed && <FontAwesomeIcon icon={faCheck} />}
          </label>
          {todo.text}
          {isEditingToggle && (
            <button onClick={() => startEditing(index)}>Edit</button>
          )}
        </>
      )}
    </li>
  );
};

export default TodoItem;
