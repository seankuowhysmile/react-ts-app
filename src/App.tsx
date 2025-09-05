import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  editing?: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  // 查詢 Todo
  const fetchTodos = async () => {
    try {
      const res = await axios.get("nodejs-app.zeabur.app/todos");

      // 如果後端回傳的是 { todos: [...] }
      setTodos(res.data.todos || []); 
    } catch (err) {
      console.error(err);
      setTodos([]); // 保險起見
    }
  };


  useEffect(() => {
    fetchTodos();
  }, []);

  // 新增 Todo
  const addTodo = async () => {
    if (!title) return;
    try {
      await axios.post("nodejs-app.zeabur.app/todos", { title });
      setTitle("");
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // 刪除 Todo
  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`nodejs-app.zeabur.app/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  // 編輯 Todo
  const startEditing = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, editing: true } : t));
  };

  const handleEditChange = (id: string, newTitle: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const saveEdit = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      await axios.put(`nodejs-app.zeabur.app/todos/${id}`, { title: todo.title });
      setTodos(todos.map(t => t.id === id ? { ...t, editing: false } : t));
    } catch (err) {
      console.error(err);
    }
  };

  // 切換完成狀態
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await axios.put(`nodejs-app.zeabur.app/todos/${id}`, { completed: !completed });
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
        <button onClick={fetchTodos}>查詢</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.editing ? (
              <input
                type="text"
                value={todo.title}
                onChange={(e) => handleEditChange(todo.id, e.target.value)}
                onBlur={() => saveEdit(todo.id)}
              />
            ) : (
              <span
                className={todo.completed ? "completed" : ""}
                onClick={() => toggleTodo(todo.id, todo.completed)}
              >
                {todo.title}
              </span>
            )}
            <div className="buttons">
              {!todo.editing && <button onClick={() => startEditing(todo.id)}>編輯</button>}
              <button onClick={() => deleteTodo(todo.id)}>刪除</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
