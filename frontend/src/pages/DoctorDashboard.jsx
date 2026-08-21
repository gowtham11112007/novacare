import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Activity, AlertCircle, HeartPulse, Sparkles, Filter, Undo2, Stethoscope, LogOut, ChevronRight, Menu, Calendar, Edit2, Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import RiskGauge from '../components/RiskGauge';
import BabyDevelopment from '../components/BabyDevelopment';

export default function DoctorDashboard({ token }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [wellnessData, setWellnessData] = useState(null);
  const [adviceList, setAdviceList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [adviceMsg, setAdviceMsg] = useState('');
  const [adviceCategory, setAdviceCategory] = useState('General');
  
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editDueDate, setEditDueDate] = useState('');
  const [editTrimester, setEditTrimester] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    
    const patientSub = supabase.channel('patient-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, payload => {
        fetchPatients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(patientSub);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchTrie();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedPatient) {
      fetchWellness(selectedPatient.id);
      fetchAdvice(selectedPatient.id);
      setEditDueDate(selectedPatient.due_date || '');
      setEditTrimester(selectedPatient.trimester || '');
      setIsSidebarOpen(false);
      setIsEditingPatient(false);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    const res = await fetch('https://novacare-scog.onrender.com/api/doctor/patients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setPatients(data);
    }
  };

  const fetchAppointments = async () => {
    const res = await fetch('https://novacare-scog.onrender.com/api/doctor/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
  };

  const fetchWellness = async (id) => {
    const res = await fetch(`https://novacare-scog.onrender.com/api/doctor/patient/${id}/wellness`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setWellnessData(data);
    }
  };

  const fetchAdvice = async (id) => {
    const res = await fetch(`https://novacare-scog.onrender.com/api/doctor/patient/${id}/advice`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAdviceList(data);
    }
  };

  const searchTrie = async () => {
    const res = await fetch(`https://novacare-scog.onrender.com/api/doctor/search?q=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    const res = await fetch(`https://novacare-scog.onrender.com/api/doctor/patient/${selectedPatient.id}/update`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ dueDate: editDueDate, trimester: editTrimester })
    });
    
    if (res.ok) {
      toast.success('Patient record updated');
      setIsEditingPatient(false);
      fetchPatients();
      setSelectedPatient({ ...selectedPatient, due_date: editDueDate, trimester: editTrimester });
    } else {
      toast.error('Failed to update patient');
    }
  };

  const handleAddAdvice = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    const res = await fetch('https://novacare-scog.onrender.com/api/doctor/advice', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        message: adviceMsg,
        category: adviceCategory
      })
    });
    
    if (res.ok) {
      toast.success('Advice added to timeline');
      setAdviceMsg('');
      fetchAdvice(selectedPatient.id);
    } else {
      toast.error('Failed to add advice');
    }
  };

  const handleUndo = async () => {
    const res = await fetch('https://novacare-scog.onrender.com/api/doctor/undo-advice', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success('Last advice undone (Stack Pop)');
      if (selectedPatient) fetchAdvice(selectedPatient.id);
    } else {
      const data = await res.json();
      toast.error(data.error || 'Nothing to undo');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayList = (searchQuery ? searchResults : patients).filter(p => showFlaggedOnly ? p.risk_score > 60 : true);

  return (
    <div className="min-h-screen bg-[#FFF9F8] flex text-[#2D2638] font-sans selection:bg-rose-100 selection:text-rose-900 overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 md:relative md:w-1/3 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white/95 backdrop-blur-md border-r border-rose-100 h-screen overflow-y-auto p-6 flex flex-col shadow-[4px_0_24px_rgba(255,111,97,0.04)] custom-scrollbar`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-500" /> My Patients
            </h2>
            <p className="text-[10px] uppercase tracking-wider font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-rose-100">
              Min-Heap Priority Queue
            </p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 p-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients (Trie)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-200 shadow-sm p-2.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-white transition"
            />
          </div>
          
          <button 
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold border transition ${
              showFlaggedOnly 
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-inner' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showFlaggedOnly ? 'Showing Flagged (Risk > 60)' : 'Filter Flagged Patients'}
          </button>
        </div>

        <div className="flex-1 pr-2">
          <AnimatePresence>
            {displayList.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedPatient(p)}
                className={`p-4 mb-3 rounded-2xl border cursor-pointer transition-all group ${
                  selectedPatient?.id === p.id 
                    ? 'border-[#FF6F61] bg-rose-50/50 shadow-md shadow-rose-500/10 scale-[1.02]' 
                    : 'bg-white border-rose-100 hover:border-[#FF6F61]/50 hover:shadow-sm'
                } ${p.risk_score >= 80 && selectedPatient?.id !== p.id ? 'border-l-4 border-l-rose-500' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center text-xl shadow-inner border border-white group-hover:scale-110 transition-transform">
                      {p.recent_mood === 'Happy' ? '😊' : p.recent_mood === 'Sad' ? '😔' : p.recent_mood === 'Anxious' ? '😟' : '👩'}
                    </div>
                    <div>
                      <h3 className={`font-bold font-heading text-sm ${selectedPatient?.id === p.id ? 'text-rose-700' : 'text-gray-800'}`}>
                        {p.users?.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                        Due: {p.due_date || 'TBD'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl p-1.5 shadow-xs border border-rose-50">
                    <div className="w-9 h-9 relative mb-0.5">
                      <RiskGauge score={p.risk_score} size={36} hideText={true} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        {p.risk_score}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {displayList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-60">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No patients found.</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-2/3 p-4 md:p-8 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        <div className="flex items-center mb-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-rose-500 rounded-xl bg-white border border-rose-100 shadow-sm mr-4 transition hover:bg-rose-50">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-heading text-gray-800 flex items-center gap-2">
            Doctor Dashboard
          </h2>
        </div>

        {selectedPatient ? (
          <div className="flex-1 flex flex-col gap-6 pb-12">
            
            {/* Header Card */}
            <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex justify-between items-start rounded-3xl">
              <div className="flex gap-4 items-center flex-wrap">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6F61] via-[#FF8E72] to-[#FFA07A] p-0.5 shadow-md shadow-rose-500/20 hidden sm:block">
                   <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                     {selectedPatient.recent_mood === 'Happy' ? '😊' : selectedPatient.recent_mood === 'Sad' ? '😔' : selectedPatient.recent_mood === 'Anxious' ? '😟' : '👩'}
                   </div>
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold font-heading text-gray-900">{selectedPatient.users?.name}</h2>
                   {isEditingPatient ? (
                     <form onSubmit={handleUpdatePatient} className="flex gap-2 items-center mt-2 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                       <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="text-xs p-1.5 px-2 border border-gray-200 rounded-lg outline-none focus:border-rose-400 bg-white shadow-sm" required />
                       <input type="number" min="1" max="3" value={editTrimester} onChange={e => setEditTrimester(e.target.value)} className="text-xs p-1.5 px-2 border border-gray-200 rounded-lg outline-none focus:border-rose-400 bg-white w-16 shadow-sm" placeholder="Tri" required />
                       <button type="submit" className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition shadow-sm"><Check className="w-4 h-4" /></button>
                       <button type="button" onClick={() => setIsEditingPatient(false)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition shadow-sm"><X className="w-4 h-4" /></button>
                     </form>
                   ) : (
                     <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 font-medium items-center">
                       <span className="flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full text-rose-700 border border-rose-100 shadow-sm">
                         <HeartPulse className="w-3.5 h-3.5" /> Trimester {selectedPatient.trimester || 'N/A'}
                       </span>
                       <span className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full text-orange-700 border border-orange-100 shadow-sm">
                         <AlertCircle className="w-3.5 h-3.5" /> Due: {selectedPatient.due_date || 'N/A'}
                       </span>
                       <button onClick={() => setIsEditingPatient(true)} className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 rounded-lg shadow-sm transition">
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   )}
                 </div>
              </div>

              <div className="flex flex-col items-center">
                <RiskGauge score={selectedPatient.risk_score} size={80} />
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Overall Risk</span>
              </div>
            </div>

            {/* Development & Vitals Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               <div className="card-warm p-0 overflow-hidden bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] rounded-3xl">
                 <BabyDevelopment dueDate={selectedPatient.due_date} />
               </div>
               
               <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col justify-center rounded-3xl">
                  <h3 className="text-sm font-bold font-heading text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Recent Wellness Log
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                      <span className="text-xs text-gray-600 font-semibold">Kick Counts (24h)</span>
                      <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                        {wellnessData?.latestKick?.count ?? 'No data'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                      <span className="text-xs text-gray-600 font-semibold">Latest Mood</span>
                      <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100 flex items-center gap-1">
                        {wellnessData?.latestMood?.mood || 'Not Logged'} {wellnessData?.latestMood?.mood === 'Happy' ? '😊' : wellnessData?.latestMood?.mood === 'Sad' ? '😔' : wellnessData?.latestMood?.mood === 'Anxious' ? '😟' : ''}
                      </span>
                    </div>
                    {wellnessData?.latestVitals ? (
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                        <span className="text-xs text-gray-600 font-semibold">BP / Heart Rate</span>
                        <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                          {wellnessData.latestVitals.blood_pressure} / {wellnessData.latestVitals.heart_rate} bpm
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100/80">
                        <span className="text-xs text-gray-600 font-semibold">Vitals</span>
                        <span className="text-sm font-bold text-gray-400 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">No data</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            {/* Advice Timeline & Form */}
            <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold font-heading text-lg text-gray-800">Add Medical Advice</h3>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-purple-100">
                    Linked List Append
                  </p>
                </div>
                <button 
                  onClick={handleUndo} 
                  className="flex items-center gap-1.5 text-xs text-rose-600 font-bold hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo Last</span>
                </button>
              </div>

              <form onSubmit={handleAddAdvice} className="mb-6 flex flex-col sm:flex-row gap-3">
                <select 
                  value={adviceCategory} 
                  onChange={e => setAdviceCategory(e.target.value)}
                  className="rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-white transition w-full sm:w-40 font-medium text-gray-700"
                >
                  <option>General</option>
                  <option>Prescription</option>
                  <option>Lab Order</option>
                  <option>Diet</option>
                  <option>Emergency</option>
                </select>
                <input 
                  type="text" required
                  placeholder="Enter medical advice..."
                  value={adviceMsg} onChange={e => setAdviceMsg(e.target.value)}
                  className="flex-1 rounded-2xl border-gray-200 shadow-sm p-3.5 border outline-none focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-sm bg-white transition"
                />
                <button type="submit" className="bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:shadow-[0_6px_20px_rgba(255,111,97,0.4)] text-white font-bold px-6 py-3 rounded-2xl transition hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
                  Send <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              
              <div className="mt-2 flex-1">
                <h4 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Patient Care Timeline
                </h4>
                {adviceList.length > 0 ? (
                  <div className="relative border-l-2 border-rose-200 ml-3 space-y-6">
                    {adviceList.map((advice, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-rose-400 shadow-sm"></div>
                        <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/60 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                              advice.category === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' :
                              advice.category === 'Prescription' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              advice.category === 'Lab Order' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              'bg-white text-rose-600 border-rose-100'
                            }`}>{advice.category || 'General'}</span>
                            <span className="text-[11px] text-gray-500 font-medium bg-white px-2 py-0.5 rounded-md border border-gray-100">
                              {new Date(advice.created_at).toLocaleDateString()} {new Date(advice.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">{advice.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-rose-50/50 rounded-3xl border border-dashed border-rose-200 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 border border-rose-50">
                      <Stethoscope className="w-5 h-5 text-rose-400" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700">No advice recorded yet</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">Use the form above to add guidance to the patient's timeline.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments Section */}
            <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col rounded-3xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold font-heading text-lg text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FF6F61]" /> Today's Appointments
                </h3>
              </div>
              {appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-rose-200 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-orange-50 border border-white shadow-sm flex items-center justify-center text-rose-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm text-gray-800 truncate">{apt.patients?.users?.name || apt.patient_name || 'Patient'}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {apt.date ? new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (apt.time || '10:00 AM')}
                        </p>
                      </div>
                      <div className="text-[10px] uppercase font-bold bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500 shadow-sm">
                        {apt.type || 'Checkup'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  No appointments scheduled for today.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60 pb-20">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-5 border border-rose-100">
              <Stethoscope className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold font-heading text-gray-700">No Patient Selected</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed">
              Select a patient from the priority queue on the left to view their detailed chart and log medical advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
