import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User,
  Calendar,
  Stethoscope,
  LogOut,
  Save,
  ArrowLeft,
  Mail,
  Heart,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import EmergencyContact from '../components/EmergencyContact';
import { supabase } from '../lib/supabase';
import { calculatePregnancyWeek } from '../data/pregnancyData';

export default function PatientProfile({ token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [trimester, setTrimester] = useState(1);
  const [weekInfo, setWeekInfo] = useState({ week: 1, daysRemaining: 0 });

  useEffect(() => {
    fetchPatientDetails();
  }, [token]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/patient/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatientDetails(data);
        if (data?.due_date) {
          const formattedDate = formatDateForInput(data.due_date);
          setDueDate(formattedDate);
          const calc = calculatePregnancyWeek(formattedDate);
          setTrimester(data.trimester || calc.trimester);
          setWeekInfo({ week: calc.week, daysRemaining: calc.daysRemaining });
        } else {
          setTrimester(data?.trimester || 1);
        }
      } else {
        toast.error('Failed to load profile details');
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      toast.error('Network error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleDueDateChange = (e) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    if (newDueDate) {
      const calc = calculatePregnancyWeek(newDueDate);
      setTrimester(calc.trimester);
      setWeekInfo({ week: calc.week, daysRemaining: calc.daysRemaining });
    }
  };

  const handleSavePregnancyDetails = async (e) => {
    e.preventDefault();
    if (!dueDate) {
      toast.error('Please select an estimated due date');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('http://localhost:5001/api/patient/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dueDate,
          trimester
        })
      });

      if (res.ok) {
        toast.success('Pregnancy details updated successfully!');
        fetchPatientDetails();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to update pregnancy details');
      }
    } catch (err) {
      console.error('Error updating pregnancy details:', err);
      toast.error('Network error while saving details');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to sign out');
    }
  };

  const getTrimesterBadgeStyle = (tri) => {
    switch (tri) {
      case 1:
        return 'bg-pink-100/90 text-pink-700 border-pink-200';
      case 2:
        return 'bg-amber-100/90 text-amber-800 border-amber-200';
      case 3:
        return 'bg-purple-100/90 text-purple-700 border-purple-200';
      default:
        return 'bg-rose-100/90 text-rose-700 border-rose-200';
    }
  };

  const patientName = patientDetails?.users?.name || 'NovaCare Patient';
  const patientEmail = patientDetails?.users?.email || 'patient@novacare.health';
  const doctorName = patientDetails?.doctors?.users?.name || patientDetails?.doctors?.name || 'Dr. Sarah Jenkins';
  const doctorSpecialization = patientDetails?.doctors?.specialization || 'Obstetrics & Maternal-Fetal Health';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="font-heading font-bold text-gray-700 text-base">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-[#2D2638] font-sans selection:bg-rose-100 selection:text-rose-900 pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100/80 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-gray-700 hover:text-rose-600 hover:border-rose-300 shadow-xs text-xs font-bold transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF69B4] to-[#DDA0DD] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-gray-900 text-sm md:text-base tracking-tight">
              NovaCare Profile
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] rounded-3xl"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF69B4] to-[#DDA0DD] flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <User className="w-10 h-10" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900">
                  {patientName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Active Patient
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-500 font-medium">
                <Mail className="w-4 h-4 text-rose-400" />
                <span>{patientEmail}</span>
              </div>

              <p className="text-xs text-gray-400 pt-1">
                NovaCare Maternal Care ID: <span className="font-mono text-gray-600 font-semibold">{patientDetails?.id ? `PAT-${String(patientDetails.id).slice(0, 8).toUpperCase()}` : 'PAT-ACTIVE'}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pregnancy Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] rounded-3xl"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-rose-50 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900">Pregnancy Journey Details</h2>
              <p className="text-xs text-gray-500">Configure your due date to calibrate milestones, tracking, and advice.</p>
            </div>
          </div>

          <form onSubmit={handleSavePregnancyDetails} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Due Date Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Estimated Due Date (EDD)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={handleDueDateChange}
                    className="w-full px-4 py-3 bg-rose-50/40 border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:outline-none text-gray-800 font-medium text-sm transition"
                  />
                </div>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-400" />
                  Calculates your real-time week milestones and gestational progress.
                </p>
              </div>

              {/* Trimester Info Badge (Auto-Calculated) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Current Trimester Status
                </label>
                <div className="p-3 bg-rose-50/40 border border-rose-200/80 rounded-2xl flex items-center justify-between min-h-[48px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${getTrimesterBadgeStyle(trimester)}`}>
                      Trimester {trimester}
                    </span>
                    {dueDate && (
                      <span className="text-xs font-semibold text-gray-700">
                        Week {weekInfo.week} ({weekInfo.daysRemaining} days left)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-lg border border-rose-100">
                    Auto-computed
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  {trimester === 1 && 'First Trimester: Weeks 1 - 13 (Foundational Growth)'}
                  {trimester === 2 && 'Second Trimester: Weeks 14 - 27 (Golden Period & Movement)'}
                  {trimester === 3 && 'Third Trimester: Weeks 28 - 40+ (Preparation & Birth)'}
                </p>
              </div>
            </div>

            {/* Assigned Doctor (Read-only) */}
            <div className="p-4 bg-gradient-to-r from-rose-50/60 to-orange-50/60 border border-rose-200/70 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-[#FF69B4]" />
                  <span>Assigned Care Provider</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-gray-500 border border-rose-200/60">
                  Read-only • Clinical Staff
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-800">{doctorName}</h4>
                  <p className="text-xs text-gray-500">{doctorSpecialization}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60 w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Direct Consultation Enabled</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Pregnancy Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Emergency Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] rounded-3xl space-y-4"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-rose-50">
            <div className="w-10 h-10 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900">Emergency Contact</h2>
              <p className="text-xs text-gray-500">
                Designate a primary contact for instant SOS alerts and medical escalation.
              </p>
            </div>
          </div>

          <EmergencyContact token={token} />
        </motion.div>

        {/* Account Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] rounded-3xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-gray-900">Account Session</h3>
              <p className="text-xs text-gray-500">
                Safely end your active session on this device. Your data remains encrypted and synced.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs transition duration-200 w-full sm:w-auto shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
