// File: client/src/pages/Dashboard.jsx
// Purpose: Main dashboard showing stats, task form and task table

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';
import Stats from '../components/Stats';

export default function Dashboard({ profile }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTasks() {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // poll every 10s to refresh timer-related info
    const id = setInterval(loadTasks, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Task Manager</h1>
        <div className="profile-summary">{profile.full_name} — {profile.designation}</div>
      </header>

      <Stats tasks={tasks} />

      <section className="controls">
        <TaskForm onCreated={loadTasks} />
      </section>

      <section>
        {loading ? <div>Loading tasks...</div> : <TaskTable tasks={tasks} refresh={loadTasks} />}
        {error && <div className="error">{error}</div>}
      </section>
    </div>
  );
}
