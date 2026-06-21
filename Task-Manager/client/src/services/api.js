// File: client/src/services/api.js
// Purpose: Axios instance for API calls with credentials enabled

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
