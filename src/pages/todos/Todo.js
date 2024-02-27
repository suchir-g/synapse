import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import * as Checkbox from "@radix-ui/react-checkbox";
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
  const todoItemClass = isEditingToggle ? `${styles.todoItem} ${styles.long}` : styles.todoItem;

  return (
    
    <li className={todoItemClass}>
      {isEditing === index ? (
        <>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button onClick={() => saveTodoEdit(index)}>Save</button>
          <button onClick={cancelEditing}>Cancel</button>
        </>
      ) : (
        <>
          <>
            <Checkbox.Root
              checked={todo.completed}
              onCheckedChange={() => toggleTodoCompletion(index)}
              className={styles.CheckboxRoot}
            >
              <Checkbox.Indicator className={styles.CheckboxIndicator}>
                <FontAwesomeIcon icon={faCheck} />
              </Checkbox.Indicator>
            </Checkbox.Root>
            {todo.text}
            {isEditingToggle && (
              <button onClick={() => startEditing(index)}>Edit</button>
            )}
          </>
        </>
      )}
    </li>
  );
};

export default TodoItem;
