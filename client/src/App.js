import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://surgeaina-todoapp.onrender.com'; // Update if backend is deployed

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch all tasks
  useEffect(() => {
    axios.get(API_URL).then(res => setTasks(res.data));
  }, []);

  // Add new task
  const handleAdd = async () => {
    if (!newTask.trim()) return;
    const res = await axios.post(API_URL, { title: newTask });
    setTasks([...tasks, res.data]);
    setNewTask('');
  };

  // Delete task
  const handleDelete = async id => {
    await axios.delete(`${API_URL}/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  // Start editing
  const startEdit = task => {
    setEditId(task._id);
    setEditText(task.title);
  };

  // Save edit
  const handleEdit = async id => {
    const res = await axios.put(`${API_URL}/${id}`, { title: editText });
    setTasks(tasks.map(t => (t._id === id ? res.data : t)));
    setEditId(null);
    setEditText('');
  };

  // Mark as complete
  const handleComplete = async id => {
    const res = await axios.put(`${API_URL}/${id}`, { completed: true });
    setTasks(tasks.map(t => (t._id === id ? res.data : t)));
  };

  return (
    <div className="todo-container">
      <h1 className="todo-title">📝 To-Do List</h1>
      <div className="todo-input-group">
        <input
          className="todo-input"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button className="todo-add-btn" onClick={handleAdd}>Add</button>
      </div>
      <ul className="todo-list">
        {tasks.map(task => (
          <li key={task._id} className={`todo-item${task.completed ? ' completed' : ''}`}>
            {editId === task._id ? (
              <>
                <input
                  className="todo-edit-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
                <button className="todo-save-btn" onClick={() => handleEdit(task._id)}>Save</button>
                <button className="todo-cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className="todo-text" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                <button className="todo-edit-btn" onClick={() => startEdit(task)}>Edit</button>
                <button className="todo-delete-btn" onClick={() => handleDelete(task._id)}>Delete</button>
                {!task.completed && (
                  <button className="todo-complete-btn" onClick={() => handleComplete(task._id)}>Complete</button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
