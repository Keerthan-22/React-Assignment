// File: client/src/components/TaskForm.jsx
// Purpose: Form to create normal or manual (completed) tasks

import React, { useState } from 'react';
import api from '../services/api';

export default function TaskForm({ onCreated }) {
  const [manual, setManual] = useState(false);
  const [form, setForm] = useState({
    task_name: '',
    comments: '',
    expected_minutes: '' ,
    start_time: '',
    end_time: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.task_name) return setError('Task name required');
    setLoading(true);
    try {
      const payload = {
        task_name: form.task_name,
        comments: form.comments,
        expected_minutes: form.expected_minutes || undefined
      };
      if (manual) {
        payload.start_time = form.start_time;
        payload.end_time = form.end_time;
      }
      await api.post('/tasks', payload);
      setForm({ task_name: '', comments: '', expected_minutes: '', start_time: '', end_time: '' });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card task-form">
      <h3>Create Task</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Task Name</label>
        <input name="task_name" value={form.task_name} onChange={handleChange} />

        <label>Comments</label>
        <input name="comments" value={form.comments} onChange={handleChange} />

        <label>Expected Time (minutes)</label>
        <input name="expected_minutes" value={form.expected_minutes} onChange={handleChange} />

        <label>
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} /> Manual Entry (completed)
        </label>

        {manual && (
          <>
            <label>Start Time</label>
            <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} />

            <label>End Time</label>
            <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} />
          </>
        )}

        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
      </form>
    </div>
  );
}
