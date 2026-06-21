// File: client/src/components/TaskTable.jsx
// Purpose: Display tasks and provide action buttons for lifecycle operations

import React from 'react';
import api from '../services/api';

function fmtSeconds(sec) {
  if (!sec) return '00:00:00';
  const h = Math.floor(sec / 3600).toString().padStart(2, '0');
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function TaskTable({ tasks, refresh }) {
  async function action(id, verb) {
    try {
      await api.put(`/tasks/${id}/${verb}`);
      refresh();
    } catch (err) {
      alert(err?.response?.data?.error || 'Action failed');
    }
  }

  async function handleEdit(task) {
    const name = prompt('Task name', task.task_name);
    if (name == null) return;
    const comments = prompt('Comments', task.comments || '');
    if (comments == null) return;
    try {
      await api.put(`/tasks/${task.id}`, { task_name: name, comments });
      refresh();
    } catch (err) {
      alert(err?.response?.data?.error || 'Update failed');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      refresh();
    } catch (err) {
      alert('Delete failed');
    }
  }

  function computeDuration(task) {
    let total = task.total_work_seconds || 0;
    if (task.status === 'In Progress' && task.last_started_at) {
      const started = new Date(task.last_started_at);
      const now = new Date();
      const diff = Math.floor((now - started) / 1000);
      total += diff;
    }
    return total;
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Comments</th>
          <th>Expected</th>
          <th>Actual</th>
          <th>Within</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => {
          const duration = computeDuration(t);
          const expected = t.expected_seconds || 0;
          const within = expected === 0 ? '—' : (duration <= expected ? 'Within' : 'Exceeded');
          return (
            <tr key={t.id}>
              <td>{t.task_name}</td>
              <td>{t.status}</td>
              <td>{fmtSeconds(duration)}</td>
              <td>{t.comments}</td>
              <td>{fmtSeconds(expected)}</td>
              <td>{fmtSeconds(duration)}</td>
              <td>{within}</td>
              <td>
                {t.status !== 'In Progress' && (
                  <button onClick={() => action(t.id, 'start')}>Start</button>
                )}
                {t.status === 'In Progress' && (
                  <button onClick={() => action(t.id, 'hold')}>Hold</button>
                )}
                {t.status === 'Paused' && (
                  <button onClick={() => action(t.id, 'resume')}>Resume</button>
                )}
                {t.status !== 'Completed' && (
                  <button onClick={() => action(t.id, 'stop')}>Stop</button>
                )}
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
