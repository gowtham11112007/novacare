import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.access_token);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.access_token);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (token) => {
    try {
      const res = await fetch('https://novacare-scog.onrender.com/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      } else {
        // If the token is invalid or backend rejects, force sign out to prevent infinite hang
        console.error('Failed to fetch role:', await res.text());
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Network error fetching role:', error);
      // Optional: don't sign out on pure network errors, but we need to unblock UI
      // await supabase.auth.signOut();
    }
    setLoading(false);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          !session ? <Auth /> :
          role === 'admin' ? <Navigate to="/admin" /> :
          role === 'doctor' ? <Navigate to="/doctor" /> :
          role === 'patient' ? <Navigate to="/patient" /> :
          <div className="flex flex-col h-screen items-center justify-center gap-4 bg-[#FFF9F8]">
            <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
            <p className="text-gray-600 font-medium text-sm">Verifying role or connecting to backend...</p>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="mt-4 px-4 py-2 text-xs font-bold text-rose-500 bg-white border border-rose-200 rounded-lg shadow-sm hover:bg-rose-50"
            >
              Cancel & Sign Out
            </button>
          </div>
        } />
        <Route path="/admin" element={session && role === 'admin' ? <AdminDashboard token={session.access_token} /> : <Navigate to="/" />} />
        <Route path="/doctor" element={session && role === 'doctor' ? <DoctorDashboard token={session.access_token} /> : <Navigate to="/" />} />
        <Route path="/patient" element={session && role === 'patient' ? <PatientDashboard token={session.access_token} /> : <Navigate to="/" />} />
        <Route path="/profile" element={session && role === 'patient' ? <PatientProfile token={session.access_token} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
