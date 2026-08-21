import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import authBg from '../assets/auth-bg.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [passkey, setPasskey] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        else toast.success('Logged in successfully');
      } else {
        let keyId = null;
        if (role !== 'patient') {
          const verifyRes = await fetch('http://localhost:5001/api/auth/verify-passkey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passkey, role })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            toast.error(verifyData.error || 'Invalid passkey');
            return;
          }
          keyId = verifyData.keyId;
        }

        // Bypass Supabase frontend signup completely to avoid email rate limits
        const completeRes = await fetch('http://localhost:5001/api/auth/complete-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name,
            role,
            keyId,
            specialization
          })
        });
        
        const completeData = await completeRes.json();
        if (completeData.success) {
          toast.success('Account created successfully');
          // Automatically sign in the user after the backend creates their account
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) toast.error('Login failed after signup: ' + signInError.message);
        } else {
          const errorMsg = completeData.error || 'Failed to complete setup';
          // If the email is already registered, switch to login view
          if (errorMsg.toLowerCase().includes('already') && errorMsg.toLowerCase().includes('registered')) {
            toast.error('This email is already registered. Please sign in instead.');
            setIsLogin(true);
          } else {
            toast.error(errorMsg);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Left Panel - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <img 
          src={authBg} 
          alt="Maternal care illustration" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent" />
      </div>

      {/* Right Panel - Auth Form */}
      <div 
        className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-[#FFF9F8] p-4 sm:p-8 relative"
        style={{
          backgroundImage: `url(${authBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Mobile background overlay for readability */}
        <div className="absolute inset-0 bg-[#FFF9F8]/90 lg:bg-[#FFF9F8] backdrop-blur-sm lg:backdrop-blur-none" />

        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_8px_40px_rgba(255,111,97,0.08)] border border-rose-100/50 p-8 sm:p-10 relative z-10">
        
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6F61] via-[#FF8E72] to-[#FFA07A] p-0.5 shadow-md shadow-rose-500/20 mb-4">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                🤰
              </div>
            </div>
            <h2 className="text-3xl font-bold font-heading text-gray-900">NovaCare</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{isLogin ? 'Welcome back to your portal' : 'Join our maternal care family'}</p>
          </div>

        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-gray-50/50 transition cursor-pointer"
                >
                  <option value="patient">Expectant Mother (Patient)</option>
                  <option value="doctor">Medical Specialist (Doctor)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" required 
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="block w-full rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-gray-50/50 transition"
                />
              </div>

              {role !== 'patient' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                    {role === 'doctor' ? 'Doctor Verification Code' : 'Admin Verification Code'}
                  </label>
                  <input 
                    type="password" required 
                    value={passkey} onChange={e => setPasskey(e.target.value)}
                    placeholder="Enter security passkey"
                    className="block w-full rounded-2xl border-rose-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-rose-50/30 transition"
                  />
                  <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 shadow-sm space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <span>⚠️</span>
                      <span>Prototype — use these demo keys:</span>
                    </p>
                    {role === 'doctor' && (
                      <p className="pl-6 font-mono tracking-wide">
                        <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold text-amber-900 mr-1">doc1</span>
                        <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold text-amber-900 mr-1">doc2</span>
                        <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold text-amber-900">doc3</span>
                      </p>
                    )}
                    {role === 'admin' && (
                      <p className="pl-6 font-mono tracking-wide">
                        <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold text-amber-900">admin123</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {role === 'doctor' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Specialization</label>
                  <input 
                    type="text" required 
                    value={specialization} onChange={e => setSpecialization(e.target.value)}
                    placeholder="e.g. OB/GYN"
                    className="block w-full rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-gray-50/50 transition"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
            <input 
              type="email" required 
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="block w-full rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-gray-50/50 transition"
            />
          </div>

          <div className="pb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" required 
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-gray-50/50 transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:shadow-[0_6px_20px_rgba(255,111,97,0.4)] text-white font-bold py-3.5 px-4 rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-semibold text-gray-500 hover:text-[#FF6F61] transition">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
