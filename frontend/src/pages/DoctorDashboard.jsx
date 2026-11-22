import { MoodIcon } from '../components/MoodIcon';
import { API_URL } from '../lib/api';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Search, Activity, AlertCircle, HeartPulse, Sparkles, Filter, Undo2,
  Stethoscope, LogOut, ChevronRight, Menu, Calendar, Edit2, Check, X,
  Clock, TrendingUp, Droplets, Weight, Heart, Baby, CheckCircle, Users, ShieldAlert, Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import RiskGauge from '../components/RiskGauge';
import BabyDevelopment from '../components/BabyDevelopment';

const BASE = API_URL;

const DAY = 864e5;
const riskTone = (s = 0) =>
  s >= 80 ? { label: 'Critical', text: 'text-rose-600', chip: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' }
  : s > 60 ? { label: 'High', text: 'text-orange-600', chip: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' }
  : s >= 30 ? { label: 'Moderate', text: 'text-amber-600', chip: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400' }
  : { label: 'Low', text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' };
const gestWeek = (due) => (due ? Math.max(0, Math.floor((Date.now() - (new Date(due).getTime() - 280 * DAY)) / (7 * DAY))) : null);
const moodTint = {
  great: 'from-rose-100 to-pink-50 text-rose-500',
  good: 'from-emerald-100 to-teal-50 text-emerald-500',
  okay: 'from-amber-100 to-yellow-50 text-amber-500',
  sad: 'from-sky-100 to-blue-50 text-sky-500',
  anxious: 'from-violet-100 to-purple-50 text-violet-500',
};
const DEFAULT_TINT = 'from-rose-100 to-pink-50 text-rose-500';

export default function DoctorDashboard({ token }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [wellnessData, setWellnessData] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [moodTrend, setMoodTrend] = useState([]);
  const [adviceList, setAdviceList] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [adviceMsg, setAdviceMsg] = useState('');
  const [adviceCategory, setAdviceCategory] = useState('General');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('wellness');

  // Edit patient state
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editMode, setEditMode] = useState('lmp'); // 'lmp' or 'edd'
  const [editLmpDate, setEditLmpDate] = useState('');
  const [editEddDate, setEditEddDate] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    const patientSub = supabase.channel('patient-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, () => fetchPatients())
      .subscribe();
    return () => supabase.removeChannel(patientSub);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) searchTrie();
    else setSearchResults([]);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedPatient) {
      fetchWellness(selectedPatient.id);
      fetchAdvice(selectedPatient.id);
      fetchVitals(selectedPatient.id);
      fetchMoodTrend(selectedPatient.id);
      setIsSidebarOpen(false);
      setIsEditingPatient(false);
      setActiveDetailTab('wellness');
      // Pre-fill edit fields
      if (selectedPatient.due_date) {
        setEditEddDate(selectedPatient.due_date);
        // Derive LMP from EDD
        const edd = new Date(selectedPatient.due_date);
        const lmp = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
        setEditLmpDate(lmp.toISOString().split('T')[0]);
      }
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    const res = await fetch(`${BASE}/api/doctor/patients`, { headers });
    if (res.ok) setPatients(await res.json());
  };

  const fetchAppointments = async () => {
    const res = await fetch(`${BASE}/api/doctor/appointments`, { headers });
    if (res.ok) setAppointments(await res.json());
  };

  const fetchWellness = async (id) => {
    const res = await fetch(`${BASE}/api/doctor/patient/${id}/wellness`, { headers });
    if (res.ok) setWellnessData(await res.json());
  };

  const fetchVitals = async (id) => {
    const res = await fetch(`${BASE}/api/doctor/patient/${id}/vitals`, { headers });
    if (res.ok) setVitalsHistory(await res.json());
  };

  const fetchMoodTrend = async (id) => {
    const res = await fetch(`${BASE}/api/doctor/patient/${id}/mood-trend`, { headers });
    if (res.ok) setMoodTrend(await res.json());
  };

  const fetchAdvice = async (id) => {
    const res = await fetch(`${BASE}/api/doctor/patient/${id}/advice`, { headers });
    if (res.ok) setAdviceList(await res.json());
  };

  const searchTrie = async () => {
    const res = await fetch(`${BASE}/api/doctor/search?q=${searchQuery}`, { headers });
    if (res.ok) setSearchResults(await res.json());
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    const body = editMode === 'lmp'
      ? { lmpDate: editLmpDate }
      : { dueDate: editEddDate };
    const res = await fetch(`${BASE}/api/doctor/patient/${selectedPatient.id}/update`, {
      method: 'PUT', headers, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Patient record updated');
      setIsEditingPatient(false);
      fetchPatients();
      setSelectedPatient({ ...selectedPatient, due_date: data.due_date || editEddDate, trimester: data.trimester });
    } else {
      toast.error(data.error || 'Update failed');
    }
  };

  const handleAddAdvice = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const res = await fetch(`${BASE}/api/doctor/advice`, {
      method: 'POST', headers,
      body: JSON.stringify({ patientId: selectedPatient.id, message: adviceMsg, category: adviceCategory })
    });
    if (res.ok) {
      toast.success('Advice added to patient timeline');
      setAdviceMsg('');
      fetchAdvice(selectedPatient.id);
    } else toast.error('Failed to add advice');
  };

  const handleUndo = async () => {
    const res = await fetch(`${BASE}/api/doctor/undo-advice`, { method: 'POST', headers });
    if (res.ok) {
      toast.success('Last advice undone');
      if (selectedPatient) fetchAdvice(selectedPatient.id);
    } else {
      const d = await res.json();
      toast.error(d.error || 'Nothing to undo');
    }
  };

  const displayList = (searchQuery ? searchResults : patients).filter(p => showFlaggedOnly ? p.risk_score > 60 : true);

  const highRiskCount = patients.filter(p => p.risk_score > 60).length;
  const avgRisk = patients.length ? Math.round(patients.reduce((a, p) => a + (p.risk_score || 0), 0) / patients.length) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const riskBuckets = [['Low', 0], ['Moderate', 40], ['High', 70], ['Critical', 90]].map(([label, sample]) => ({
    label, bar: riskTone(sample).bar, count: patients.filter(p => riskTone(p.risk_score).label === label).length,
  }));

  const moodEmoji = (mood) => <MoodIcon mood={mood} className="w-6 h-6 text-rose-500" />;

  const categoryStyle = (cat) => ({
    Emergency: 'bg-red-50 text-red-600 border-red-100',
    Prescription: 'bg-blue-50 text-blue-600 border-blue-100',
    'Lab Order': 'bg-purple-50 text-purple-600 border-purple-100',
    Diet: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }[cat] || 'bg-white text-rose-600 border-rose-100');

  const detailTabs = [
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'mood', label: 'Mood Trend', icon: TrendingUp },
    { id: 'advice', label: 'Advice', icon: Sparkles },
    { id: 'baby', label: 'Development', icon: Baby },
  ];

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex text-[#2D2638] font-sans selection:bg-rose-100 selection:text-rose-900 overflow-hidden">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ─── SIDEBAR ─── */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 md:relative md:w-1/3 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white/95 backdrop-blur-md border-r border-rose-100 h-screen overflow-y-auto p-6 flex flex-col shadow-[4px_0_24px_rgba(255,111,97,0.04)]`}>

        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#FF69B4] to-[#b57edc] text-white shadow-md shadow-pink-300/40">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-gray-900 leading-tight">My Patients</h2>
              <p className="text-[11px] text-gray-400 font-medium" title="Patients are ordered by a min-heap priority queue on risk score">Sorted by risk priority</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} aria-label="Sign out" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Patients', value: patients.length, tone: 'text-gray-900' },
            { label: 'High risk', value: highRiskCount, tone: highRiskCount ? 'text-rose-600' : 'text-gray-900' },
            { label: 'Avg score', value: avgRisk, tone: riskTone(avgRisk).text },
          ].map(k => (
            <div key={k.label} className="rounded-2xl bg-gradient-to-b from-white to-rose-50/40 border border-rose-100 px-3 py-2.5 text-center">
              <p className={`text-xl font-bold font-heading ${k.tone}`}>{k.value}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search" placeholder="Search patients by name" aria-label="Search patients" title="Prefix search powered by a Trie"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm p-2.5 border outline-none focus:border-[#FF69B4] focus:ring-1 focus:ring-[#FF69B4] text-sm bg-white transition"
            />
          </div>
          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold border transition ${showFlaggedOnly ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            {showFlaggedOnly ? 'Showing High Risk (>60)' : 'Filter High Risk'}
          </button>
        </div>

        {/* Patient list */}
        <div className="flex-1">
          <AnimatePresence>
            {displayList.map(p => (
              <motion.div
                key={p.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedPatient(p)}
                className={`p-4 mb-3 rounded-2xl border cursor-pointer transition-all group ${
                  selectedPatient?.id === p.id
                    ? 'border-[#FF69B4] bg-rose-50/50 shadow-md shadow-rose-500/10 scale-[1.02]'
                    : 'bg-white border-rose-100 hover:border-[#FF69B4]/50 hover:shadow-sm'
                } ${p.risk_score >= 80 && selectedPatient?.id !== p.id ? 'border-l-4 border-l-rose-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 shrink-0 rounded-full bg-gradient-to-br ${moodTint[p.recent_mood] || DEFAULT_TINT} flex items-center justify-center shadow-inner border border-white group-hover:scale-110 transition-transform`}
                      title={p.recent_mood ? `Latest mood: ${p.recent_mood}` : 'No mood check-in yet'}>
                      <MoodIcon mood={p.recent_mood} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold font-heading text-sm ${selectedPatient?.id === p.id ? 'text-rose-700' : 'text-gray-800'}`}>
                        {p.users?.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {gestWeek(p.due_date) !== null && <span className="font-semibold text-gray-600">Week {gestWeek(p.due_date)} ·</span>}
                        EDD {p.due_date ? new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-lg font-bold font-heading leading-none ${riskTone(p.risk_score).text}`}>{p.risk_score ?? 0}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${riskTone(p.risk_score).chip}`}>{riskTone(p.risk_score).label}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {displayList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
              <Search className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-600">No patients found.</p>
            </div>
          )}
        </div>

        {/* Today's Appointments mini-list */}
        {appointments.length > 0 && (
          <div className="mt-6 border-t border-rose-50 pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Today's Schedule
            </h4>
            <div className="space-y-2">
              {appointments.slice(0, 3).map((apt, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                  <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{apt.patients?.users?.name || 'Patient'}</p>
                    <p className="text-[10px] text-gray-500">{apt.slot_time ? new Date(apt.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : apt.time || '—'}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="w-full md:w-2/3 p-4 md:p-8 flex flex-col h-screen overflow-y-auto">
        {/* Mobile menu */}
        <div className="flex items-center mb-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-rose-500 rounded-xl bg-white border border-rose-100 shadow-sm mr-4 hover:bg-rose-50 transition">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-heading text-gray-800">Doctor Dashboard</h2>
        </div>

        {selectedPatient ? (
          <div className="flex-1 flex flex-col gap-6 pb-12">
            <button onClick={() => setSelectedPatient(null)} className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 transition">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to overview
            </button>

            {/* ── Patient Header Card ── */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] p-6 flex justify-between items-start">
              <div className="flex gap-4 items-center flex-wrap">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF69B4] via-[#DDA0DD] to-[#E6E6FA] p-0.5 shadow-md shadow-rose-500/20 hidden sm:block">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                    {moodEmoji(selectedPatient.recent_mood)}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-gray-900">{selectedPatient.users?.name}</h2>
                  {isEditingPatient ? (
                    <form onSubmit={handleUpdatePatient} className="mt-2 space-y-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                      {/* Toggle LMP / EDD */}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditMode('lmp')} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg transition ${editMode === 'lmp' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                          LMP Date
                        </button>
                        <button type="button" onClick={() => setEditMode('edd')} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg transition ${editMode === 'edd' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                          EDD Direct
                        </button>
                      </div>
                      {editMode === 'lmp' ? (
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase">Last Menstrual Period</label>
                          <div className="flex gap-2 mt-1">
                            <input type="date" value={editLmpDate} onChange={e => setEditLmpDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-rose-400 bg-white flex-1" required />
                            <button type="submit" className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setIsEditingPatient(false)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                          {editLmpDate && (() => {
                            const lmp = new Date(editLmpDate);
                            const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
                            const days = Math.floor((new Date() - lmp) / (1000 * 60 * 60 * 24));
                            const wks = Math.floor(days / 7);
                            return <p className="text-[10px] text-rose-600 mt-1">→ EDD: {edd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {wks} wks pregnant</p>;
                          })()}
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase">Estimated Due Date</label>
                          <div className="flex gap-2 mt-1">
                            <input type="date" value={editEddDate} onChange={e => setEditEddDate(e.target.value)} className="text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-rose-400 bg-white flex-1" required />
                            <button type="submit" className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setIsEditingPatient(false)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs items-center">
                      <span className="flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full text-rose-700 border border-rose-100">
                        <HeartPulse className="w-3.5 h-3.5" /> Trimester {selectedPatient.trimester || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full text-orange-700 border border-orange-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                        EDD: {selectedPatient.due_date ? new Date(selectedPatient.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                      </span>
                      <button onClick={() => setIsEditingPatient(true)} className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 rounded-lg transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <RiskGauge score={selectedPatient.risk_score} size={80} />
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Risk Score</span>
              </div>
            </div>

            {/* ── Detail Sub-tabs ── */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar bg-white rounded-2xl border border-rose-100 p-1.5 shadow-sm">
              {detailTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeDetailTab === tab.id
                      ? 'bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* ── WELLNESS TAB ── */}
            {activeDetailTab === 'wellness' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] p-6 space-y-4">
                <h3 className="font-bold font-heading text-lg text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Latest Wellness Snapshot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kick Count */}
                  <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100">
                    <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1">Kick Count</p>
                    <p className="text-2xl font-bold font-heading text-gray-900">
                      {wellnessData?.latestKick?.kick_count ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {wellnessData?.latestKick?.recorded_at
                        ? new Date(wellnessData.latestKick.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'No data logged'}
                    </p>
                  </div>
                  {/* Latest Mood */}
                  <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
                    <p className="text-[10px] uppercase font-bold text-purple-500 tracking-wider mb-1">Latest Mood</p>
                    <p className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
                      {moodEmoji(wellnessData?.latestMood?.mood)}
                      <span className="text-base capitalize">{wellnessData?.latestMood?.mood_label || wellnessData?.latestMood?.mood || '—'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {wellnessData?.latestMood?.recorded_at
                        ? new Date(wellnessData.latestMood.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'No mood logged'}
                    </p>
                  </div>
                  {/* Blood Pressure */}
                  <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100">
                    <p className="text-[10px] uppercase font-bold text-sky-500 tracking-wider mb-1">Latest BP</p>
                    <p className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
                      {wellnessData?.latestVitals?.bp_systolic
                        ? `${wellnessData.latestVitals.bp_systolic}/${wellnessData.latestVitals.bp_diastolic}`
                        : '—'}
                      {(wellnessData?.latestVitals?.bp_systolic >= 140 || wellnessData?.latestVitals?.bp_diastolic >= 90) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-sans">Elevated</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {wellnessData?.latestVitals?.weight_kg ? `Weight: ${wellnessData.latestVitals.weight_kg} kg` : 'No vitals logged'}
                    </p>
                  </div>
                </div>
                {!wellnessData?.latestKick && !wellnessData?.latestMood && !wellnessData?.latestVitals && (
                  <p className="text-sm text-gray-400 text-center py-4">Patient has not logged any wellness data yet.</p>
                )}
              </div>
            )}

            {/* ── VITALS TAB ── */}
            {activeDetailTab === 'vitals' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] p-6">
                <h3 className="font-bold font-heading text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" /> Vitals History (Last 5)
                </h3>
                {vitalsHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No vitals recorded yet</p>
                    <p className="text-xs mt-1">Patient needs to log vitals from their dashboard.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vitalsHistory.map((v, i) => (
                      <div key={i} className="flex flex-wrap gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span className="text-xs text-gray-500">BP:</span>
                          <span className="text-sm font-bold text-gray-800">{v.bp_systolic}/{v.bp_diastolic} mmHg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-sky-400" />
                          <span className="text-xs text-gray-500">Weight:</span>
                          <span className="text-sm font-bold text-gray-800">{v.weight_kg} kg</span>
                        </div>
                        <div className="ml-auto">
                          <span className="text-[10px] text-gray-400">{new Date(v.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MOOD TREND TAB ── */}
            {activeDetailTab === 'mood' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] p-6">
                <h3 className="font-bold font-heading text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" /> Mood Trend — Last 7 Days
                </h3>
                {moodTrend.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No mood data in the last 7 days</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={moodTrend}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v, _, p) => [p.payload.mood, 'Mood']}
                          contentStyle={{ borderRadius: 12, border: '1px solid #FFE4E1', fontSize: 12 }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#FF69B4" strokeWidth={3} dot={{ fill: '#FF69B4', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                      <span>Overwhelmed</span><span>Neutral</span><span>Radiant</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── ADVICE TAB ── */}
            {activeDetailTab === 'advice' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] p-6">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold font-heading text-lg text-gray-800">Medical Advice</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-purple-100">
                      Linked List Append
                    </span>
                  </div>
                  <button onClick={handleUndo} className="flex items-center gap-1.5 text-xs text-rose-600 font-bold hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition">
                    <Undo2 className="w-3.5 h-3.5" /> Undo Last
                  </button>
                </div>

                <form onSubmit={handleAddAdvice} className="mb-6 flex flex-col sm:flex-row gap-3">
                  <select value={adviceCategory} onChange={e => setAdviceCategory(e.target.value)}
                    className="rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF69B4] text-sm bg-white w-full sm:w-40">
                    <option>General</option><option>Prescription</option><option>Lab Order</option><option>Diet</option><option>Emergency</option>
                  </select>
                  <input type="text" required placeholder="Enter medical advice..." value={adviceMsg} onChange={e => setAdviceMsg(e.target.value)}
                    className="flex-1 rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF69B4] text-sm bg-white" />
                  <button type="submit" className="bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white font-bold px-6 py-3 rounded-2xl shadow-[0_4px_14px_rgba(255,111,97,0.3)] transition hover:-translate-y-0.5 flex items-center gap-2 text-sm">
                    Send <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {adviceList.length > 0 ? (
                  <div className="relative border-l-2 border-rose-200 ml-3 space-y-6">
                    {adviceList.map((advice, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-rose-400 shadow-sm" />
                        <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/60">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${categoryStyle(advice.category)}`}>{advice.category || 'General'}</span>
                            <span className="text-[11px] text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                              {new Date(advice.created_at).toLocaleDateString()} {new Date(advice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{advice.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-rose-50/50 rounded-3xl border border-dashed border-rose-200 p-8 text-center">
                    <Stethoscope className="w-8 h-8 mx-auto text-rose-300 mb-3" />
                    <p className="text-sm font-bold text-gray-700">No advice recorded yet</p>
                    <p className="text-xs text-gray-500 mt-1">Use the form above to add guidance.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── BABY DEVELOPMENT TAB ── */}
            {activeDetailTab === 'baby' && (
              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] overflow-hidden">
                <BabyDevelopment dueDate={selectedPatient.due_date} />
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 pb-12">
            <div>
              <p className="text-sm font-semibold text-rose-500">{greeting}</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">Your practice at a glance</h1>
              <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Assigned patients', value: patients.length, icon: Users, tint: 'from-rose-100 to-pink-50 text-rose-500' },
                { label: 'High risk', value: highRiskCount, icon: ShieldAlert, tint: 'from-orange-100 to-amber-50 text-orange-500' },
                { label: 'Average risk score', value: avgRisk, icon: Gauge, tint: 'from-violet-100 to-purple-50 text-violet-500' },
                { label: "Today's appointments", value: appointments.length, icon: Calendar, tint: 'from-sky-100 to-blue-50 text-sky-500' },
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

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="card-warm p-6 xl:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-500" /> Needs attention</h3>
                  <span className="text-xs text-gray-400">Highest risk first</span>
                </div>
                {patients.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No patients are assigned to you yet. They appear here once an administrator assigns them.</p>
                ) : (
                  <ul className="divide-y divide-rose-50">
                    {[...patients].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 5).map(p => {
                      const t = riskTone(p.risk_score);
                      return (
                        <li key={p.id}>
                          <button onClick={() => setSelectedPatient(p)} className="w-full flex items-center gap-4 py-3 text-left group">
                            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${moodTint[p.recent_mood] || DEFAULT_TINT}`}>
                              <MoodIcon mood={p.recent_mood} className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {p.users?.name}
                                {gestWeek(p.due_date) !== null && <span className="ml-2 text-xs font-medium text-gray-400">Week {gestWeek(p.due_date)}</span>}
                              </p>
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, p.risk_score || 0)}%` }} />
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${t.chip}`}>{t.label} · {p.risk_score ?? 0}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 transition" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="card-warm p-6 xl:col-span-2">
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-4">Risk distribution</h3>
                <div className="space-y-4">
                  {riskBuckets.map(b => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5"><span>{b.label}</span><span>{b.count}</span></div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${b.bar} transition-all duration-700`} style={{ width: `${patients.length ? (b.count / patients.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-gray-400 leading-relaxed">Select a patient to review wellness, vitals and mood trends, and to post guidance.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
