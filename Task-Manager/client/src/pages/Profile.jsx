// File: client/src/pages/Profile.jsx
// Purpose: Show profile creation form when no profile exists

import React, { useState } from 'react';
import api from '../services/api';

export default function Profile({ onCreated }) {
  const [form, setForm] = useState({
    full_name: '',
    designation: '',
    employee_id: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    // basic validation
    if (!form.full_name || !form.designation || !form.employee_id || !form.email || !form.phone) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/profile', form);
      onCreated(res.data.profile);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-form card">
      <h2>Create Profile</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} />

        <label>Designation</label>
        <input name="designation" value={form.designation} onChange={handleChange} />

        <label>Employee ID</label>
        <input name="employee_id" value={form.employee_id} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
      </form>
    </div>
  );
}
