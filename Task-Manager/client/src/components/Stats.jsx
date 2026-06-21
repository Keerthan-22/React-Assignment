// File: client/src/components/Stats.jsx
// Purpose: Compute and display simple stats: productive time, break time, expected vs actual

import React from 'react';

function fmt(sec) {
  if (!sec) return '00:00:00';
  const h = Math.floor(sec / 3600).toString().padStart(2, '0');
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function Stats({ tasks }) {
  // Filter tasks relevant to today
  const today = new Date();
  const isToday = (dStr) => {
    if (!dStr) return false;
    const d = new Date(dStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const todays = tasks.filter(t => isToday(t.created_at) || isToday(t.updated_at));

  let productive = 0;
  let expected = 0;
  let earliest = null;
  let latest = null;

  todays.forEach(t => {
    let total = t.total_work_seconds || 0;
    if (t.status === 'In Progress' && t.last_started_at) {
      total += Math.floor((new Date() - new Date(t.last_started_at)) / 1000);
    }
    productive += total;
    expected += t.expected_seconds || 0;
    const c = new Date(t.created_at);
    const u = new Date(t.updated_at || t.created_at);
    if (!earliest || c < earliest) earliest = c;
    if (!latest || u > latest) latest = u;
  });

  let breakTime = 0;
  if (earliest && latest) {
    const span = Math.floor((latest - earliest) / 1000);
    breakTime = Math.max(0, span - productive);
  }

  return (
    <div className="stats card">
      <div className="stat-item">
        <strong>Productive Today:</strong> {fmt(productive)}
      </div>
      <div className="stat-item">
        <strong>Break Today (approx):</strong> {fmt(breakTime)}
      </div>
      <div className="stat-item">
        <strong>Expected vs Actual:</strong> {fmt(expected)} expected / {fmt(productive)} actual
      </div>
    </div>
  );
}
