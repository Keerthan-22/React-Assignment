// File: client/src/main.jsx
// Purpose: App entry - render React app

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './css/styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
