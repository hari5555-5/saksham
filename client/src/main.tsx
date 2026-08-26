import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.tsx'
import './index.css'

// Set base URL for production (Vite proxy handles dev automatically)
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
