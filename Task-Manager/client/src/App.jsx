// File: client/src/App.jsx
// Purpose: Root component - checks profile and shows Profile or Dashboard

import React, { useEffect, useState } from 'react';
import api from './services/api';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/profile');
        setProfile(res.data.profile);
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="center">Loading...</div>;
  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="app-container">
      {!profile ? (
        <Profile onCreated={(p) => setProfile(p)} />
      ) : (
        <Dashboard profile={profile} />
      )}
    </div>
  );
}
