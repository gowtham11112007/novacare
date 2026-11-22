// Base URL of the NovaCare backend. Set VITE_API_URL in frontend/.env (e.g. http://localhost:5001).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
