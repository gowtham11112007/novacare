import { API_URL } from '../lib/api';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Stethoscope, Key, LogOut, Copy, Check, Plus, UserCheck, AlertTriangle, Activity, RefreshCw, X, Shield, UserPlus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = API_URL;

export default function AdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorKeys, setDoctorKeys] = useState([]);
  const [assigningPatient, setAssigningPatient] = useState(null);
  const [selectedDoctorForAssign, setSelectedDoctorForAssign] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchMetrics();
    fetchDoctors();
    fetchAllPatients();
  }, []);

  useEffect(() => {
    if (activeTab === 'patients') fetchAllPatients();
    if (activeTab === 'doctors') fetchDoctors();
    if (activeTab === 'keys') fetchDoctorKeys();
  }, [activeTab]);

  const fetchMetrics = async () => {
    const res = await fetch(`${BASE}/api/admin/dashboard`, { headers });
    if (res.ok) setMetrics(await res.json());
  };

  const fetchAllPatients = async () => {
    const res = await fetch(`${BASE}/api/admin/all-patients`, { headers });
    if (res.ok) setAllPatients(await res.json());
  };

  const fetchUnassignedPatients = async () => {
    const res = await fetch(`${BASE}/api/admin/all-patients`, { headers });
    if (res.ok) {
      const data = await res.json();
      setUnassigned(data.filter(p => !p.assigned_doctor_id));
    }
  };

  const fetchDoctors = async () => {
    const res = await fetch(`${BASE}/api/admin/doctors`, { headers });
    if (res.ok) setDoctors(await res.json());
  };

  const fetchDoctorKeys = async () => {
    const res = await fetch(`${BASE}/api/admin/doctor-keys`, { headers });
    if (res.ok) setDoctorKeys(await res.json());
  };

  const handleAutoAssign = async () => {
    await fetchUnassignedPatients();
    const pats = unassigned.length ? unassigned : (await fetch(`${BASE}/api/admin/all-patients`, { headers }).then(r => r.json())).filter(p => !p.assigned_doctor_id);
    if (!pats.length) { toast('All patients are already assigned!'); return; }
    for (const p of pats) {
      await fetch(`${BASE}/api/admin/auto-assign`, { method: 'POST', headers, body: JSON.stringify({ patientId: p.id }) });
    }
    toast.success(`Auto-assigned ${pats.length} patient(s) via Min-Heap`);
    fetchMetrics(); fetchAllPatients(); fetchDoctors();
  };

  const handleManualAssign = async () => {
    if (!assigningPatient || !selectedDoctorForAssign) return;
    setIsAssigning(true);
    const res = await fetch(`${BASE}/api/admin/assign-patient`, {
      method: 'POST', headers,
      body: JSON.stringify({ patientId: assigningPatient.id, doctorId: selectedDoctorForAssign })
    });
    if (res.ok) {
      toast.success(`${assigningPatient.users?.name} assigned successfully!`);
      setAssigningPatient(null);
      setSelectedDoctorForAssign('');
      fetchAllPatients(); fetchDoctors();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Assignment failed');
    }
    setIsAssigning(false);
  };

  const handleGenerateKey = async () => {
    const key = newKeyName.trim() || `doc-${Date.now().toString(36)}`;
    setIsGeneratingKey(true);
    const res = await fetch(`${BASE}/api/admin/generate-doctor-key`, {
      method: 'POST', headers, body: JSON.stringify({ passkey: key })
    });
    const data = await res.json();
    if (data.success || data.passkey) {
      toast.success(`Key "${key}" generated!`);
      setNewKeyName('');
      fetchDoctorKeys();
    } else {
      toast.error(data.error || 'Failed to generate key');
    }
    setIsGeneratingKey(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleLogout = () => supabase.auth.signOut();

  const DOCTOR_CAPACITY = 20; // matches the backend auto-assign limit
  const unassignedCount = allPatients.filter(p => !p.assigned_doctor_id).length;
  const riskTone = (s = 0) =>
    s >= 80 ? { label: 'Critical', bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700' }
    : s > 60 ? { label: 'High', bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' }
    : s >= 30 ? { label: 'Moderate', bar: 'bg-amber-400', chip: 'bg-amber-100 text-amber-700' }
    : { label: 'Low', bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' };
  const riskBuckets = [['Low', 0], ['Moderate', 40], ['High', 70], ['Critical', 90]].map(([label, sample]) => ({
    label, bar: riskTone(sample).bar, count: allPatients.filter(p => riskTone(p.risk_score).label === label).length,
  }));
  const recentPatients = [...allPatients].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'keys', label: 'Keys', icon: Key },
  ];

  const trimesterBadge = (t) => {
    const styles = { 1: 'bg-emerald-50 text-emerald-700 border-emerald-200', 2: 'bg-sky-50 text-sky-700 border-sky-200', 3: 'bg-purple-50 text-purple-700 border-purple-200' };
    return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[t] || 'bg-gray-100 text-gray-500'}`}>T{t || '?'}</span>;
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-gray-800 font-sans selection:bg-rose-100">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF69B4] to-[#DDA0DD] flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-gray-900 text-lg leading-tight">NovaCare Admin</h1>
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">System Overview</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1 pb-0 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#FF69B4] text-[#FF69B4]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Hero */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-rose-500">{greeting}</p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">System overview</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { fetchMetrics(); fetchDoctors(); fetchAllPatients(); toast.success('Data refreshed'); }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button
                  onClick={handleAutoAssign}
                  title="Assigns each unassigned patient to the least-loaded doctor (min-heap load balancer)"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF69B4] to-[#b57edc] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(255,105,180,0.55)] hover:-translate-y-0.5 transition"
                >
                  <UserCheck className="w-4 h-4" /> Auto-assign{unassignedCount ? ` (${unassignedCount})` : ''}
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Doctors', value: metrics?.totalDoctors ?? '—', icon: Stethoscope, tint: 'from-rose-100 to-pink-50 text-rose-500' },
                { label: 'Patients', value: metrics?.totalPatients ?? '—', icon: Users, tint: 'from-sky-100 to-blue-50 text-sky-500' },
                { label: 'Unassigned', value: unassignedCount, icon: UserPlus, tint: unassignedCount ? 'from-amber-100 to-yellow-50 text-amber-500' : 'from-emerald-100 to-teal-50 text-emerald-500' },
                { label: 'High risk', value: metrics?.highRiskPatients ?? '—', icon: AlertTriangle, tint: 'from-orange-100 to-amber-50 text-orange-500' },
              ].map(({ label, value, icon: Icon, tint }) => (
                <div key={label} className="card-warm p-5 flex items-center gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tint}`}><Icon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-2xl font-bold font-heading text-gray-900 leading-none">{value}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Doctor workload */}
              <div className="card-warm p-6 lg:col-span-3">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2"><Activity className="w-5 h-5 text-[#FF69B4]" /> Doctor workload</h3>
                  <span className="text-xs text-gray-400">Capacity {DOCTOR_CAPACITY} patients each</span>
                </div>
                {doctors.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No doctors registered yet. Generate a doctor key in the Keys tab to invite one.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...doctors].sort((a, b) => (b.current_load || 0) - (a.current_load || 0)).map(d => {
                      const pct = Math.min(100, ((d.current_load || 0) / DOCTOR_CAPACITY) * 100);
                      return (
                        <li key={d.id} className="flex items-center gap-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 font-heading font-bold text-rose-600">
                            {(d.users?.name || 'D').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-900 truncate">Dr. {d.users?.name || 'Unknown'}</span>
                              <span className="text-gray-500 shrink-0">{d.current_load || 0}/{DOCTOR_CAPACITY}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">{d.specialization || 'General'}</p>
                            <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-400' : 'bg-gradient-to-r from-[#FF69B4] to-[#b57edc]'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Risk distribution */}
              <div className="card-warm p-6 lg:col-span-2">
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-5">Patient risk</h3>
                <div className="space-y-4">
                  {riskBuckets.map(b => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5"><span>{b.label}</span><span>{b.count}</span></div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${b.bar} transition-all duration-700`} style={{ width: `${allPatients.length ? (b.count / allPatients.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent registrations */}
            <div className="card-warm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-[#FF69B4]" /> Recent registrations</h3>
                <button onClick={() => setActiveTab('patients')} className="text-xs font-semibold text-rose-600 hover:underline">View all</button>
              </div>
              {recentPatients.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No patients have registered yet.</p>
              ) : (
                <div className="divide-y divide-rose-50">
                  {recentPatients.map(p => {
                    const t = riskTone(p.risk_score);
                    return (
                      <div key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-100 to-pink-50 font-heading font-bold text-violet-600">
                          {(p.users?.name || 'P').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-[10rem]">
                          <p className="font-semibold text-gray-900">{p.users?.name || 'Unnamed patient'}</p>
                          <p className="text-xs text-gray-400">
                            {p.weeksPregnant != null ? `Week ${p.weeksPregnant}` : 'Due date not set'} · Joined {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${t.chip}`}>{t.label} · {p.risk_score ?? 0}</span>
                        {p.assigned_doctor_id ? (
                          <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">Dr. {p.doctors?.users?.name || 'Assigned'}</span>
                        ) : (
                          <button onClick={() => setAssigningPatient(p)} className="text-xs font-bold text-white bg-gradient-to-r from-[#FF69B4] to-[#b57edc] rounded-full px-3 py-1.5 hover:opacity-90 transition">
                            Assign doctor
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PATIENTS TAB ─── */}
        {activeTab === 'patients' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-gray-900">All Patients <span className="text-sm font-normal text-gray-400 ml-2">({allPatients.length})</span></h2>
              <button onClick={fetchAllPatients} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <div className="space-y-3">
              {allPatients.length === 0 && (
                <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No patients yet</p>
                </div>
              )}
              {allPatients.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#DDA0DD] text-white flex items-center justify-center font-bold font-heading text-lg shrink-0">
                      {(p.users?.name || 'P')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.users?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{p.users?.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-2">
                    {trimesterBadge(p.trimester)}
                    {p.weeksPregnant != null && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        {p.weeksPregnant} wks
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${p.risk_score >= 60 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      Risk: {p.risk_score ?? 0}
                    </span>
                  </div>

                  {/* Doctor assignment */}
                  <div className="flex items-center gap-2">
                    {p.doctors?.users?.name ? (
                      <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                        Dr. {p.doctors.users.name.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                        Unassigned
                      </span>
                    )}
                    <button
                      onClick={() => { setAssigningPatient(p); setSelectedDoctorForAssign(''); }}
                      className="text-xs font-bold text-white bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] px-3 py-1.5 rounded-xl hover:opacity-90 transition shadow-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── DOCTORS TAB ─── */}
        {activeTab === 'doctors' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-gray-900">Doctor Roster <span className="text-sm font-normal text-gray-400 ml-2">({doctors.length})</span></h2>
              <button onClick={fetchDoctors} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {doctors.length === 0 && (
              <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center text-gray-400">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No doctors registered yet</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map(doc => {
                const load = doc.actual_load || 0;
                const pct = Math.min(100, (load / 20) * 100);
                const loadColor = load < 5 ? 'bg-emerald-400' : load < 10 ? 'bg-amber-400' : 'bg-red-400';
                const status = load < 5 ? { label: 'Available', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' } : load < 15 ? { label: 'Moderate', cls: 'text-amber-700 bg-amber-50 border-amber-200' } : { label: 'At Capacity', cls: 'text-red-700 bg-red-50 border-red-200' };
                return (
                  <div key={doc.id} className="bg-white rounded-3xl border border-rose-100 p-6 shadow-[0_8px_30px_rgb(255,110,127,0.05)] flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center text-rose-600 font-bold text-lg font-heading">
                        {(doc.users?.name || 'D')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Dr. {doc.users?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{doc.specialization || 'OB/GYN'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-600">Patient Load</span>
                        <span className="text-gray-900">{load} / 20</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${loadColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border self-start ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── KEYS TAB ─── */}
        {activeTab === 'keys' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Generate key */}
            <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-[0_8px_30px_rgb(255,110,127,0.05)]">
              <h3 className="font-heading font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FF69B4]" /> Generate New Doctor Key
              </h3>
              <p className="text-xs text-gray-400 mb-5">Keys are single-use. Share with the doctor for registration.</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. dr-smith-2025 (optional)"
                  className="flex-1 rounded-2xl border-gray-200 border p-3 text-sm outline-none focus:border-[#FF69B4] focus:ring-1 focus:ring-[#FF69B4] bg-gray-50/50"
                />
                <button
                  onClick={handleGenerateKey}
                  disabled={isGeneratingKey}
                  className="bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white font-bold px-6 rounded-2xl shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:opacity-90 transition disabled:opacity-50 text-sm"
                >
                  {isGeneratingKey ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Admin key note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Admin registration key</p>
                <p className="text-xs text-amber-600">New administrators need the admin key stored in the <code>admin_keys</code> table of your database. Keep it private and rotate it regularly.</p>
              </div>
            </div>

            {/* Keys list */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-gray-800">Doctor Keys</h3>
              {doctorKeys.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                  <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">No keys found</p>
                  <p className="text-xs mt-1">Generate a key above to allow new doctor registrations.</p>
                </div>
              )}
              {doctorKeys.map((k, i) => (
                <div key={i} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${k.is_used ? 'border-gray-100 opacity-60' : 'border-rose-100'}`}>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-gray-800 truncate">{k.passkey_hash}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {k.is_used ? 'Used' : 'Available'} · Created {new Date(k.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!k.is_used && (
                    <button onClick={() => copyToClipboard(k.passkey_hash, k.id)} className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 hover:bg-rose-100 transition shrink-0">
                      {copiedKey === k.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      {/* ─── ASSIGN MODAL ─── */}
      <AnimatePresence>
        {assigningPatient && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setAssigningPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-rose-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-heading font-bold text-xl text-gray-900">Assign Doctor</h3>
                  <p className="text-sm text-gray-500 mt-1">Patient: <strong>{assigningPatient.users?.name}</strong></p>
                </div>
                <button onClick={() => setAssigningPatient(null)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                {doctors.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No doctors registered yet.</p>}
                {doctors.map(doc => {
                  const load = doc.actual_load || 0;
                  const isSel = selectedDoctorForAssign === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctorForAssign(doc.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition text-left ${isSel ? 'border-[#FF69B4] bg-rose-50 shadow-md' : 'border-gray-100 bg-gray-50/50 hover:border-rose-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-heading ${isSel ? 'bg-[#FF69B4]' : 'bg-gray-300'}`}>
                        {(doc.users?.name || 'D')[0]}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${isSel ? 'text-rose-700' : 'text-gray-800'}`}>Dr. {doc.users?.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialization || 'OB/GYN'} · {load} patients</p>
                      </div>
                      {isSel && <Check className="w-5 h-5 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleManualAssign}
                disabled={!selectedDoctorForAssign || isAssigning}
                className="w-full bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:opacity-90 transition disabled:opacity-40"
              >
                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
