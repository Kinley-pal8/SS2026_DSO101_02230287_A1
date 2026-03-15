import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Fetch all todos on load
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(`${API}/todos`);
    setTodos(res.data);
  };

  // Add new todo
  const addTodo = async () => {
    if (!input.trim()) return;
    await axios.post(`${API}/todos`, { task: input });
    setInput("");
    fetchTodos();
  };

  // Toggle done/undone
  const toggleDone = async (todo) => {
    await axios.put(`${API}/todos/${todo.id}`, { done: !todo.done });
    fetchTodos();
  };

  // Start editing
  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.task);
  };

  // Save edit
  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    await axios.put(`${API}/todos/${id}`, { task: editText });
    setEditId(null);
    setEditText("");
    fetchTodos();
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await axios.delete(`${API}/todos/${id}`);
    fetchTodos();
  };

  const completedCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>ToDo List</h1>
        <div className="stats">
          <div className="stat-badge">
            <span className="count">{completedCount}</span>
            <span className="label">Completed</span>
          </div>
          <div className="stat-badge">
            <span className="count">{totalCount}</span>
            <span className="label">Total</span>
          </div>
        </div>
      </header>

      <section className="input-section">
        <div className="input-row">
          <input
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="add-button" onClick={addTodo}>
            Add
          </button>
        </div>
      </section>

      {totalCount === 0 ? (
        <div className="empty-state">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M30 50H70M50 30V70"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p>No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              {editId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(todo.id)}
                    autoFocus
                  />
                  <div className="todo-actions">
                    <button
                      className="btn-save"
                      onClick={() => saveEdit(todo.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleDone(todo)}
                  />
                  <span>{todo.task}</span>
                  <div className="todo-actions">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(todo)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
