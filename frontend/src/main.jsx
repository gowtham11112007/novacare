import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#2d2638',
          border: '1px solid rgba(224, 93, 130, 0.2)',
          boxShadow: '0 10px 25px -5px rgba(224, 93, 130, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '16px',
          padding: '12px 18px',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
        },
        success: {
          iconTheme: {
            primary: '#e05d82',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ea384d',
            secondary: '#ffffff',
          },
        }
      }}
    />
  </React.StrictMode>,
)
