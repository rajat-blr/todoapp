import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks'); // This will proxy to your backend
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!task || !deadline) return;

    try {
      const response = await axios.post('/api/tasks', {
        task,
        deadline,
      });
      setTasks([...tasks, { id: response.data.id, task, deadline, done: false }]);
      setTask('');
      setDeadline('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const markAsDone = async (taskId) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, {
        done: true,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, done: true } : task
        )
      );
    } catch (error) {
      console.error('Error marking task as done:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="container">
    <div className="App">
      <h1>To-Do List</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button className="button" onClick={addTask}>Add Task</button>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <span
              className={`task-title ${task.done ? 'done' : ''}`}
              onClick={() => markAsDone(task.id)}
            >
              {task.task}
            </span>
            <span className="task-deadline">{task.deadline}</span>
            {!task.done && (
              <button className="button" onClick={() => markAsDone(task.id)}>Mark as Done</button>
            )}
            <button  onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default App;
