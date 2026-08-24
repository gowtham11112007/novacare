import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Stethoscope, Key, LogOut, Copy, Check, Plus, UserCheck, AlertTriangle, Activity, RefreshCw, ChevronDown, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = 'https://novacare-sccg.onrender.com';

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

  const chartData = metrics ? [
    { name: 'Doctors', value: metrics.totalDoctors },
    { name: 'Patients', value: metrics.totalPatients },
    { name: 'High Risk', value: metrics.highRiskPatients },
  ] : [];

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
      
      {/* Floating Theme Elements */}
      <div className="floating-butterfly" style={{ top: '15%', left: '5%', animationDelay: '1s' }}></div>
      <div className="floating-flower" style={{ top: '65%', left: '90%', animationDelay: '3s' }}></div>
      <div className="floating-butterfly" style={{ top: '80%', left: '10%', animationDelay: '6s' }}></div>
      <div className="floating-flower" style={{ top: '25%', left: '85%', animationDelay: '8s' }}></div>

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
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Doctors', value: metrics?.totalDoctors ?? '—', icon: Stethoscope, color: 'rose', bg: 'from-rose-100 to-rose-50' },
                { label: 'Total Patients', value: metrics?.totalPatients ?? '—', icon: Users, color: 'sky', bg: 'from-sky-100 to-sky-50' },
                { label: 'High Risk Patients', value: metrics?.highRiskPatients ?? '—', icon: AlertTriangle, color: 'amber', bg: 'from-amber-100 to-amber-50' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-3xl border border-rose-100 p-6 shadow-[0_8px_30px_rgb(255,110,127,0.05)] flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.bg} flex items-center justify-center shrink-0`}>
                    <card.icon className={`w-7 h-7 text-${card.color}-500`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <p className="text-3xl font-bold font-heading text-gray-900 mt-0.5">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Auto-assign */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-[0_8px_30px_rgb(255,110,127,0.05)]">
                <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FF69B4]" /> System Overview
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #FFE4E1', boxShadow: '0 4px 20px rgba(255,111,97,0.1)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={['#FF69B4', '#DDA0DD', '#F97316'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-[0_8px_30px_rgb(255,110,127,0.05)] flex flex-col gap-4">
                <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#FF69B4]" /> Quick Actions
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">Auto-assign all unassigned patients to the least-loaded doctor using the Min-Heap load balancer.</p>
                <button
                  onClick={handleAutoAssign}
                  className="w-full mt-auto bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:shadow-[0_6px_20px_rgba(255,111,97,0.4)] transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Auto-Assign via Min-Heap
                </button>
                <button
                  onClick={() => { fetchMetrics(); fetchDoctors(); toast.success('Refreshed!'); }}
                  className="w-full border border-rose-200 text-rose-600 font-bold py-3 rounded-2xl hover:bg-rose-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh Data
                </button>
              </div>
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

            {/* Admin key reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Admin Key</p>
                <p className="text-xs text-amber-600">Use <strong>admin123</strong> to register new admin accounts.</p>
              </div>
              <button onClick={() => copyToClipboard('admin123', 'admin')} className="ml-auto p-2 bg-white border border-amber-200 rounded-xl text-amber-600 hover:bg-amber-100 transition shrink-0">
                {copiedKey === 'admin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
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
                      {k.is_used ? '✅ Used' : '🟢 Available'} · Created {new Date(k.created_at).toLocaleDateString()}
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
