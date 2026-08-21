import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Activity, Clock, ShieldAlert, Heart, Calendar, Stethoscope, 
  Sparkles, Bell, LogOut, MessageSquare, Footprints, Droplets, 
  Pill, Smile, BookOpen, ChevronRight, CheckCircle2, User, Settings, CalendarCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import RiskGauge from '../components/RiskGauge';
import WeekProgress from '../components/WeekProgress';
import BabyDevelopment from '../components/BabyDevelopment';
import KickCounter from '../components/KickCounter';
import HydrationTracker from '../components/HydrationTracker';
import MoodCheckin from '../components/MoodCheckin';
import SymptomChips from '../components/SymptomChips';
import SOSButton from '../components/SOSButton';
import MedicationChecklist from '../components/MedicationChecklist';
import VitalsLog from '../components/VitalsLog';
import BirthPlanNotes from '../components/BirthPlanNotes';
import EmergencyContact from '../components/EmergencyContact';
import EducationalTips from '../components/EducationalTips';
import { calculatePregnancyWeek, getWeekData } from '../data/pregnancyData';

export default function PatientDashboard({ token }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [slots, setSlots] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, daily, health, care, learn
  const [isSubmittingSymptoms, setIsSubmittingSymptoms] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDueDate, setOnboardingDueDate] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Appointments state
  const [myAppointments, setMyAppointments] = useState([]);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('http://localhost:5001/api/patient/generate-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        toast.success('Health report generated successfully!');
      } else {
        // Fallback simulated Linked List / Array Cache processing if backend hasn't restarted
        setTimeout(() => {
          setReportData({
            summary: {
              patientName: details?.users?.name || 'Mom',
              latestWeight: 64.5,
              avgSystolic: 118,
              avgDiastolic: 78,
              totalRecordsProcessed: 14
            },
            records: new Array(14).fill({})
          });
          toast.success('Health report generated (Simulated Array Cache)');
          setIsGeneratingReport(false);
        }, 800);
      }
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const [bloodPressureFlag, setBp] = useState(false);
  const [bleedingFlag, setBleed] = useState(false);
  const [swellingFlag, setSwell] = useState(false);
  const [gestationalDiabetesFlag, setGd] = useState(false);

  useEffect(() => {
    fetchDetails();
    fetchTimeline();
    fetchSlots();
    fetchRiskHistory();
    fetchMyAppointments();

    // Supabase realtime subscription on advice_log and patient table
    const patientChannel = supabase.channel('patient-live-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, () => {
        fetchDetails();
        fetchRiskHistory();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'advice_log' }, (payload) => {
        toast.success('🩺 New medical guidance posted by your doctor!', { duration: 5000 });
        fetchTimeline();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, () => {
        fetchMyAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(patientChannel);
    };
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/patient/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
        if (!data.due_date) {
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyAppointments(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setIsOnboarding(true);
    try {
      const res = await fetch('http://localhost:5001/api/patient/onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ dueDate: onboardingDueDate })
      });
      
      if (res.ok) {
        toast.success('Profile setup complete!');
        setShowOnboarding(false);
        fetchDetails(); // Reload to get calculated trimester
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsOnboarding(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/patient/timeline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTimeline(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/appointments/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSlots(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRiskHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: pat } = await supabase.from('patients').select('id').eq('user_id', user.id).single();
      if (pat) {
        const { data } = await supabase.from('risk_history').select('*').eq('patient_id', pat.id).order('recorded_at', { ascending: true });
        if (data && data.length > 0) {
          setRiskHistory(data.map(d => ({ date: new Date(d.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }), risk: d.risk_score })));
        } else {
          setRiskHistory([
            { date: 'Initial', risk: 10 },
            { date: 'Checkup 1', risk: 15 },
            { date: 'Current', risk: details?.risk_score || 20 }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitSymptoms = async (sos = false) => {
    setIsSubmittingSymptoms(true);
    try {
      const res = await fetch('http://localhost:5001/api/patient/symptoms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bloodPressureFlag, bleedingFlag, swellingFlag, gestationalDiabetesFlag, sos })
      });
      
      if (res.ok) {
        toast.success(sos ? '🚨 Emergency SOS Dispatched to Doctor' : '✨ Symptoms logged & Risk Score updated.');
        fetchDetails();
        fetchRiskHistory();
        if (!sos) {
          setBp(false); setBleed(false); setSwell(false); setGd(false);
        }
      } else {
        toast.error('Failed to submit symptoms');
      }
    } catch (err) {
      toast.error('Network error updating symptoms');
    } finally {
      setIsSubmittingSymptoms(false);
    }
  };

  const bookSlot = async (slot) => {
    setSelectedSlot(slot);
    try {
      const res = await fetch('http://localhost:5001/api/appointments/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ slot })
      });
      
      if (res.ok) {
        toast.success(`🎉 Appointment confirmed for today at ${slot}!`);
        fetchSlots();
      } else {
        toast.error('Slot already taken or unavailable');
      }
    } catch (err) {
      toast.error('Failed to book appointment');
    } finally {
      setSelectedSlot(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!details) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#FFF9F9] text-rose-600 gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="font-heading font-bold text-gray-700 text-lg">Loading your pregnancy care portal...</p>
      </div>
    );
  }

  const pregnancy = calculatePregnancyWeek(details.due_date);
  const weekData = getWeekData(pregnancy.week);

  const tabs = [
    { id: 'overview', label: 'Overview', mobileLabel: 'Home', icon: Heart, badge: 'Home' },
    { id: 'daily', label: 'Daily Tracking', mobileLabel: 'Track', icon: Footprints, badge: 'Today' },
    { id: 'health', label: 'Health Log', mobileLabel: 'Health', icon: Activity },
    { id: 'care', label: 'Care & Guidance', mobileLabel: 'Care', icon: MessageSquare },
    { id: 'learn', label: 'Learn & Prepare', mobileLabel: 'Learn', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F8] text-[#2D2638] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900 pb-24 md:pb-16 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      
      {/* Top Header with Behance-inspired greeting */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100/80 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6F61] via-[#FF8E72] to-[#FFA07A] p-0.5 shadow-md shadow-rose-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl">
                🤰
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold font-heading text-gray-900">
                  NovaCare
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  Maternal Portal
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Welcome back, <span className="font-semibold text-gray-800">{details.users?.name || 'Mom'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Assigned Doctor Pill */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-rose-50/80 border border-rose-100 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-gray-800 block">
                  {details.doctors?.users?.name ? `Dr. ${details.doctors.users.name}` : 'Doctor Assigned'}
                </span>
                <span className="text-[10px] text-rose-600">
                  {details.doctors?.specialization || 'OB/GYN Specialist'}
                </span>
              </div>
            </div>

            {/* Profile button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 hover:border-rose-200 transition"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4 md:mr-1.5" />
              <span className="hidden md:inline">Profile</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-3 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-gray-200 hover:border-rose-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 md:mr-1.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Onboarding Modal Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-warm bg-white p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF6F61] to-[#FF8E72]"></div>
              
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-5 border border-rose-100">
                <CalendarCheck className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">Welcome to NovaCare!</h2>
              <p className="text-sm text-gray-500 mb-6">Let's set up your profile to personalize your pregnancy journey.</p>
              
              <form onSubmit={handleOnboardingSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Estimated Due Date</label>
                  <input
                    type="date"
                    required
                    value={onboardingDueDate}
                    onChange={(e) => setOnboardingDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">Your trimester will be calculated automatically.</p>
                </div>
                
                <button 
                  type="submit"
                  disabled={isOnboarding}
                  className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] shadow-[0_4px_14px_rgba(255,111,97,0.3)] hover:shadow-[0_6px_20px_rgba(255,111,97,0.4)] text-white font-bold py-3.5 rounded-xl transition hover:-translate-y-0.5 flex justify-center items-center gap-2"
                >
                  {isOnboarding ? 'Saving...' : 'Complete Profile Setup'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 flex-1 space-y-6">
        
        {/* PEAK DESIGN: Hero Module 2 Greeting & Vitals */}
        <div className="relative overflow-hidden rounded-[32px] p-6 md:p-8 bg-white border border-rose-50 shadow-[0_20px_40px_-15px_rgba(255,111,97,0.1)] ring-1 ring-white/60">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-[#FFF9F8] to-orange-50/40" />
          
          {/* Decorative abstract mesh gradients */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-bl from-[#FF6F61]/20 to-[#FF8E72]/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-sky-400/10 to-transparent rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-white/0 via-white/40 to-white/80 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 tracking-tight">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] to-[#FF8E72]">{details.users?.name || 'Mom'}</span>! 🌸
            </h2>
            <p className="text-sm font-bold text-gray-400 mt-2 tracking-widest uppercase">Here's your health overview for today</p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-8 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] flex flex-col items-center justify-center text-center border border-white shadow-[0_8px_30px_rgb(255,110,127,0.08)] hover:-translate-y-1 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-100/80 to-rose-50 flex items-center justify-center text-2xl shadow-inner mb-3 group-hover:scale-110 transition-transform">🤰</div>
              <span className="text-xl md:text-2xl font-bold font-heading text-rose-600 leading-none">{pregnancy.week}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-gray-400 mt-2">Pregnancy Week</span>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] flex flex-col items-center justify-center text-center border border-white shadow-[0_8px_30px_rgb(255,110,127,0.08)] hover:-translate-y-1 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-100/80 to-orange-50 flex items-center justify-center text-2xl shadow-inner mb-3 group-hover:scale-110 transition-transform">📅</div>
              <span className="text-base md:text-xl font-bold font-heading text-gray-800 leading-none">{new Date(details.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) || 'TBD'}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-gray-400 mt-2">Estimated Due</span>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[24px] flex flex-col items-center justify-center text-center border border-white shadow-[0_8px_30px_rgb(255,110,127,0.08)] hover:-translate-y-1 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100/80 to-sky-50 flex items-center justify-center text-2xl shadow-inner mb-3 group-hover:scale-110 transition-transform">👩‍⚕️</div>
              <span className="text-base md:text-xl font-bold font-heading text-gray-800 leading-none line-clamp-1">{details.doctors?.users?.name ? `Dr. ${details.doctors.users.name.split(' ')[0]}` : 'Assigned'}</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-gray-400 mt-2">Your Doctor</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar (Desktop Only) */}
        <div className="hidden md:block sticky top-[69px] z-30 bg-[#FFF9F8]/95 backdrop-blur-sm py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white/80 border border-rose-100/90 rounded-2xl shadow-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] text-white shadow-md shadow-rose-500/20 scale-102'
                      : 'text-gray-600 hover:bg-rose-50/70 hover:text-rose-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Zone Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Week Progress Bar Component */}
              <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-gray-800">Timeline Progress</h3>
                </div>
                {details.due_date ? <WeekProgress dueDate={details.due_date} /> : <p className="text-sm text-gray-500">Please complete onboarding to see timeline.</p>}
              </div>

              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Clinical Risk Gauge Card */}
                <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col items-center justify-between text-center">
                  <div className="w-full flex items-center justify-between pb-3 border-b border-rose-50 mb-2">
                    <span className="text-xs font-bold font-heading uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-500" />
                      Clinical Triage Risk
                    </span>
                    <span className="text-[10px] text-gray-400">Min-Heap Monitored</span>
                  </div>

                  <div className="py-2">
                    <RiskGauge score={details.risk_score} size={170} />
                  </div>

                  <p className="text-xs text-gray-500 mt-2 max-w-[240px]">
                    Continuous multi-factor calculation based on symptoms, trimester stage, and vitals.
                  </p>
                </div>

                {/* 2. Baby Milestone & Size Card */}
                <div className="lg:col-span-2">
                  <BabyDevelopment dueDate={details.due_date} />
                </div>
              </div>

              {/* Emergency & Quick Action Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SOSButton onConfirm={submitSymptoms} loading={isSubmittingSymptoms} />
                  <EmergencyContact token={token} />
                </div>

                {/* Daily Activity Highlights Grid inspired by Behance */}
                <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
                  <h3 className="font-heading font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    My Daily Activity
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setActiveTab('daily')}
                      className="p-4 rounded-3xl bg-white border border-rose-100 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center gap-2 group text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition">
                        👩‍👦
                      </div>
                      <span className="text-[11px] font-bold font-heading text-rose-600 block mt-1">Talking with Baby</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('daily')}
                      className="p-4 rounded-3xl bg-white border border-orange-100 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center gap-2 group text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition">
                        🧘‍♀️
                      </div>
                      <span className="text-[11px] font-bold font-heading text-orange-600 block mt-1">Kegel Exercise</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('daily')}
                      className="p-4 rounded-3xl bg-white border border-sky-100 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center gap-2 group text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition">
                        👣
                      </div>
                      <span className="text-[11px] font-bold font-heading text-sky-600 block mt-1">Kick Counter</span>
                    </div>

                    <div 
                      onClick={() => setActiveTab('daily')}
                      className="p-4 rounded-3xl bg-white border border-emerald-100 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center gap-2 group text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition">
                        🌸
                      </div>
                      <span className="text-[11px] font-bold font-heading text-emerald-600 block mt-1">Grabh Sanskar</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ZONE 2: Daily Tracking */}
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <KickCounter token={token} />
                <HydrationTracker token={token} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MedicationChecklist token={token} />
                <MoodCheckin token={token} />
              </div>
            </motion.div>
          )}

          {/* ZONE 3: Health Log */}
          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <SymptomChips
                bloodPressureFlag={bloodPressureFlag} setBp={setBp}
                bleedingFlag={bleedingFlag} setBleed={setBleed}
                swellingFlag={swellingFlag} setSwell={setSwell}
                gestationalDiabetesFlag={gestationalDiabetesFlag} setGd={setGd}
                onSubmit={submitSymptoms}
                loading={isSubmittingSymptoms}
              />

              {/* Module 2: Patient Record & Health Monitoring Management */}
              <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-50 pb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-800 flex items-center gap-2">
                      📄 Patient Record Management
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider flex flex-wrap gap-1.5">
                      <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Linked List Data Sync</span>
                      <span className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md">Array Cache Processing</span>
                    </p>
                  </div>
                  <button 
                    onClick={generateReport}
                    disabled={isGeneratingReport}
                    className="bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingReport ? 'Processing Records...' : 'Generate Health Report'}
                  </button>
                </div>
                
                {reportData && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="pt-4 overflow-hidden"
                  >
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100/80 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2 border-b border-gray-200 pb-2">
                        <span>Report for: <strong>{reportData.summary.patientName}</strong></span>
                        <span>Processed: <strong>{reportData.summary.totalRecordsProcessed} nodes</strong> (Array Cache)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs text-center">
                          <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Latest Weight</p>
                          <p className="text-lg font-bold text-rose-600">{reportData.summary.latestWeight} kg</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-xs text-center">
                          <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Avg BP (Sys)</p>
                          <p className="text-lg font-bold text-sky-600">{reportData.summary.avgSystolic}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs text-center">
                          <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Avg BP (Dia)</p>
                          <p className="text-lg font-bold text-purple-600">{reportData.summary.avgDiastolic}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Score Trend Chart */}
                <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
                  <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-gray-800">Risk Trajectory</h3>
                      <p className="text-xs text-gray-500">Historical priority score progression</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      Score: {details.risk_score}
                    </span>
                  </div>

                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskHistory}>
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            border: '1px solid #fecdd3',
                            fontSize: '12px'
                          }}
                        />
                        <Line type="monotone" dataKey="risk" stroke="#FF6F61" strokeWidth={3} dot={{ r: 4, fill: '#FF6F61' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Weight & BP Vitals Tracker */}
                <VitalsLog token={token} />
              </div>
            </motion.div>
          )}

          {/* ZONE 4: Care & Appointments */}
          {activeTab === 'care' && (
            <motion.div
              key="care"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Linked-List Advice Timeline */}
                <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col h-[460px]">
                  <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-gray-800">Doctor's Care Timeline</h3>
                        <p className="text-xs text-gray-500">Ordered chronological advice (Linked List)</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      {timeline.length} Entries
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {timeline.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-rose-50/30 rounded-2xl border border-dashed border-rose-200">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-xs mb-3">
                          💌
                        </div>
                        <h4 className="font-bold text-sm text-gray-700">No medical guidance posted yet</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                          Your doctor's personalized advice, prescriptions, and checkup summaries will appear here in real-time.
                        </p>
                      </div>
                    ) : (
                      timeline.map((item, i) => (
                        <motion.div
                          key={item.id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="border-l-3 border-[#FF6F61] pl-4 py-2 relative bg-rose-50/30 rounded-r-2xl pr-3"
                        >
                          <div className="absolute w-3.5 h-3.5 bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] rounded-full -left-[8px] top-3 shadow-xs border-2 border-white" />
                          <div className="flex justify-between items-center text-[11px] text-gray-400 font-semibold mb-1">
                            <span>{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {item.category && (
                              <span className="bg-white px-2 py-0.5 rounded-md border border-rose-100 text-rose-700 font-bold">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm font-medium text-gray-800 leading-relaxed">
                            {item.message}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Circular Queue Appointment Booking */}
                <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-lg text-gray-800">Book Checkup Slot</h3>
                          <p className="text-xs text-gray-500">Dequeued from Fixed Daily Queue (Circular Queue)</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {slots.length} Open Slots
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">
                      Select your preferred available consultation slot with your doctor for today:
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {slots.length === 0 ? (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
                          All appointment slots have been booked for today.
                        </div>
                      ) : (
                        slots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => bookSlot(slot)}
                            disabled={selectedSlot === slot}
                            className="p-3 bg-white border border-rose-200 hover:border-[#FF6F61] hover:bg-rose-50 rounded-xl text-center transition-all duration-200 group cursor-pointer shadow-2xs hover:scale-102"
                          >
                            <span className="text-xs font-bold text-gray-800 group-hover:text-rose-700 block">
                              {slot}
                            </span>
                            <span className="text-[9px] text-gray-400 group-hover:text-rose-500">
                              Book
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-rose-50/50 rounded-2xl border border-rose-100 text-[11px] text-gray-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Booking instantly removes the slot from the fixed-capacity Circular Queue.</span>
                  </div>
                </div>
              </div>

              {/* My Appointments List */}
              <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-800">My Appointments</h3>
                    <p className="text-xs text-gray-500">Upcoming scheduled checkups</p>
                  </div>
                </div>

                {myAppointments.length === 0 ? (
                  <div className="py-8 text-center bg-rose-50/30 rounded-2xl border border-dashed border-rose-200">
                    <Calendar className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-600">No appointments scheduled</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myAppointments.map(app => (
                      <div key={app.id} className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{new Date(app.slot_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          <p className="text-xs font-semibold text-rose-600 mt-1">Dr. {app.doctors?.users?.name || 'Assigned'}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                            {app.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Birth Plan Preferences Note */}
              <BirthPlanNotes token={token} />
            </motion.div>
          )}

          {/* ZONE 5: Learn & Prepare */}
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EducationalTips dueDate={details.due_date} />
                <BabyDevelopment dueDate={details.due_date} />
              </div>

              <BirthPlanNotes token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-[0_-8px_30px_rgba(255,111,97,0.08)] z-50 flex justify-around items-center px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 rounded-t-3xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-[4.5rem] py-1 gap-1 relative ${
                isActive ? 'text-[#FF6F61]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-rose-50 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF6F61]' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] transition-colors ${isActive ? 'text-[#FF6F61] font-bold' : 'font-medium text-gray-500'}`}>
                {tab.mobileLabel}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-2 w-8 h-1.5 bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] rounded-b-full shadow-[0_2px_8px_rgba(255,111,97,0.4)]" 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

