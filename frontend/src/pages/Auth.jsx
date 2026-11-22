import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, HeartPulse, Footprints, Stethoscope, ShieldCheck, Baby, Mail, Lock, User,
  KeyRound, Eye, EyeOff, Loader2, ArrowRight, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';

const ROLES = [
  { id: 'patient', label: 'Mother', hint: 'Track my pregnancy', icon: Baby },
  { id: 'doctor', label: 'Doctor', hint: 'Care for patients', icon: Stethoscope },
  { id: 'admin', label: 'Admin', hint: 'Manage the system', icon: ShieldCheck },
];

// Sample accounts for presentations. They contain mock data only.
const DEMO_PASSWORD = 'NovaDemo@2026';
const DEMO_ACCOUNTS = [
  { email: 'ananya.demo@novacare.app', name: 'Ananya Sharma', role: 'Patient', detail: 'Week 34 · high risk', icon: Baby },
  { email: 'kavya.demo@novacare.app', name: 'Kavya Iyer', role: 'Patient', detail: 'Week 22 · moderate', icon: Baby },
  { email: 'riya.demo@novacare.app', name: 'Riya Patel', role: 'Patient', detail: 'Week 10 · low risk', icon: Baby },
  { email: 'dr.meera.demo@novacare.app', name: 'Dr. Meera Rao', role: 'Doctor', detail: 'Obstetrics', icon: Stethoscope },
  { email: 'dr.arjun.demo@novacare.app', name: 'Dr. Arjun Menon', role: 'Doctor', detail: 'Maternal-fetal medicine', icon: Stethoscope },
  { email: 'admin.demo@novacare.app', name: 'Priya Nair', role: 'Admin', detail: 'System administrator', icon: ShieldCheck },
];

const FEATURES = [
  { icon: HeartPulse, title: 'Smart risk monitoring', text: 'Symptoms and vitals are scored continuously so concerns surface early.' },
  { icon: Footprints, title: 'Daily tracking, simplified', text: 'Kicks, mood, hydration and medication in one calm place.' },
  { icon: Stethoscope, title: 'Connected to your doctor', text: 'Guidance and appointments arrive in real time.' },
];

function Field({ id, label, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FF69B4] transition-colors pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

const inputClass =
  'block w-full rounded-2xl border border-gray-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-[#FF69B4] focus:bg-white focus:ring-4 focus:ring-pink-100';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [passkey, setPasskey] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleDemoLogin = async (account) => {
    setIsLogin(true);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setDemoLoading(account.email);
    const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: DEMO_PASSWORD });
    if (error) toast.error(`Demo sign-in failed: ${error.message}`);
    else toast.success(`Signed in as ${account.name}`);
    setDemoLoading(null);
  };

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
          const verifyRes = await fetch(`${API_URL}/api/auth/verify-passkey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passkey, role }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            toast.error(verifyData.error || 'Invalid passkey');
            return;
          }
          keyId = verifyData.keyId;
        }

        // Account creation goes through the backend to avoid email rate limits
        const completeRes = await fetch(`${API_URL}/api/auth/complete-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role, keyId, specialization }),
        });

        const completeData = await completeRes.json();
        if (completeData.success) {
          toast.success('Account created successfully');
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) toast.error('Login failed after signup: ' + signInError.message);
        } else {
          const errorMsg = completeData.error || 'Failed to complete setup';
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
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 text-white bg-gradient-to-br from-[#e0457f] via-[#c9559f] to-[#8b5fbf]">
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/40">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight">NovaCare</span>
        </div>

        <div className="relative max-w-xl">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-wide ring-1 ring-white/30 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Maternal care, reimagined
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-heading text-4xl xl:text-5xl font-bold leading-[1.1]">
            Gentle, intelligent care from the very first heartbeat.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 text-base xl:text-lg text-white/85 leading-relaxed">
            One connected space for expectant mothers, doctors and administrators, so every week of the journey is supported.
          </motion.p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <motion.li key={title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/75 leading-snug">{text}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/70">
          <ShieldCheck className="h-4 w-4" /> Your health data is private and protected.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center bg-gradient-to-b from-[#fff5f8] to-[#f6efff] px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl lg:hidden" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative w-full max-w-md rounded-[28px] border border-white bg-white/80 p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(201,85,159,0.25)] backdrop-blur-xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#FF69B4] to-[#DDA0DD] text-white shadow-lg shadow-pink-300/40 lg:hidden">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-gray-900">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-1.5 text-sm text-gray-500">{isLogin ? 'Sign in to continue to your portal' : 'Join the NovaCare family in under a minute'}</p>
          </div>

          <div role="tablist" aria-label="Authentication mode" className="mb-6 grid grid-cols-2 rounded-2xl bg-gray-100/80 p-1 text-sm font-semibold">
            {[['Sign in', true], ['Create account', false]].map(([label, val]) => (
              <button key={label} type="button" role="tab" aria-selected={isLogin === val} onClick={() => setIsLogin(val)}
                className={`rounded-xl py-2.5 transition ${isLogin === val ? 'bg-white text-[#d6457f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden px-1 -mx-1">
                  <fieldset>
                    <legend className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">I am a</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map(({ id, label, hint, icon: Icon }) => (
                        <button key={id} type="button" onClick={() => setRole(id)} aria-pressed={role === id} title={hint}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold transition ${
                            role === id ? 'border-[#FF69B4] bg-pink-50 text-[#d6457f] ring-4 ring-pink-100' : 'border-gray-200 bg-white/70 text-gray-500 hover:border-pink-200 hover:text-gray-700'}`}>
                          <Icon className="h-5 w-5" />{label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <Field id="name" label="Full name" icon={User}>
                    <input id="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" className={inputClass} />
                  </Field>

                  {role !== 'patient' && (
                    <Field id="passkey" label={role === 'doctor' ? 'Doctor verification code' : 'Admin verification code'} icon={KeyRound}>
                      <input id="passkey" type="password" required autoComplete="off" value={passkey} onChange={(e) => setPasskey(e.target.value)} placeholder="Enter your security passkey" className={inputClass} />
                    </Field>
                  )}

                  {role === 'doctor' && (
                    <Field id="specialization" label="Specialization" icon={Stethoscope}>
                      <input id="specialization" type="text" required value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. OB/GYN" className={inputClass} />
                    </Field>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Field id="email" label="Email address" icon={Mail}>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
            </Field>

            <Field id="password" label="Password" icon={Lock}>
              <input id="password" type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:text-[#FF69B4]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            <button type="submit" disabled={isLoading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF69B4] to-[#b57edc] px-4 py-3.5 font-bold text-white shadow-[0_8px_24px_-6px_rgba(255,105,180,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(255,105,180,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
              {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Please wait</>) : (<>{isLogin ? 'Sign in securely' : 'Create account'}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            {isLogin ? "New to NovaCare? " : 'Already registered? '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-semibold text-[#d6457f] hover:underline">
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          {/* Demo accounts for presenting */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Demo accounts</p>
              <p className="text-[11px] text-gray-400">One click · mock data</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const tint = acc.role === 'Patient' ? 'bg-pink-50 text-[#d6457f]' : acc.role === 'Doctor' ? 'bg-sky-50 text-sky-600' : 'bg-violet-50 text-violet-600';
                return (
                  <button key={acc.email} type="button" onClick={() => handleDemoLogin(acc)} disabled={!!demoLoading}
                    className="group flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white/70 p-2.5 text-left transition hover:border-pink-200 hover:bg-pink-50/40 hover:shadow-sm disabled:opacity-60">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}>
                      {demoLoading === acc.email ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-gray-800">{acc.name}</span>
                      <span className="block truncate text-[10px] text-gray-500">{acc.role} · {acc.detail}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">Password for all demo accounts: <span className="font-mono font-semibold text-gray-500">{DEMO_PASSWORD}</span></p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
