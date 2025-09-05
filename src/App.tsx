import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  editing?: boolean;
  originalTitle?: string; // 用來存原始標題，方便取消
}

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  // 查詢 Todo
  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos`);
      setTodos(res.data || []);
    } catch (err) {
      console.error(err);
      setTodos([]);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 新增 Todo
  const addTodo = async () => {
    if (!title) return;
    try {
      await axios.post(`${API_URL}/todos`, { title });
      setTitle("");
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // 刪除 Todo
  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // 編輯 Todo
  const startEditing = (id: string) => {
    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, editing: true, originalTitle: t.title } : t
      )
    );
  };

  const handleEditChange = (id: string, newTitle: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  const saveEdit = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await axios.put(`${API_URL}/todos/${id}`, { title: todo.title });
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, editing: false, originalTitle: undefined } : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = (id: string) => {
    setTodos(
      todos.map((t) =>
        t.id === id
          ? { ...t, editing: false, title: t.originalTitle!, originalTitle: undefined }
          : t
      )
    );
  };

  // 切換完成狀態
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await axios.put(`${API_URL}/todos/${id}`, { completed: !completed });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Todo App</h1>

      <div className="controls">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="輸入新的 Todo"
        />
        <button onClick={addTodo}>新增</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.editing ? (
              <>
                <input
                  type="text"
                  value={todo.title}
                  onChange={(e) => handleEditChange(todo.id, e.target.value)}
                />
                <div className="buttons">
                  <button onClick={() => saveEdit(todo.id)}>修改</button>
                  <button onClick={() => cancelEdit(todo.id)}>取消</button>
                </div>
              </>
            ) : (
              <>
                <span
                  className={todo.completed ? "completed" : ""}
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                >
                  {todo.title}
                </span>
                <div className="buttons">
                  <button onClick={() => startEditing(todo.id)}>編輯</button>
                  <button onClick={() => deleteTodo(todo.id)}>刪除</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
