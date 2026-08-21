
import React, { useState } from "react";
import { Activity, ShieldAlert, Loader2, Check } from "lucide-react";

export default function SymptomChips({ 
  bloodPressureFlag, setBp,
  bleedingFlag, setBleed,
  swellingFlag, setSwell,
  gestationalDiabetesFlag, setGd,
  onSubmit,
  loading
}) {
  const symptoms = [
    {
      id: "bp",
      label: "High Blood Pressure",
      sub: "Readings > 140/90 mmHg",
      icon: "❤️",
      active: bloodPressureFlag,
      toggle: () => setBp(!bloodPressureFlag),
      color: "border-rose-300 bg-rose-50/80 text-rose-800"
    },
    {
      id: "bleed",
      label: "Vaginal Bleeding",
      sub: "Spotting or fresh bleeding",
      icon: "🩸",
      active: bleedingFlag,
      toggle: () => setBleed(!bleedingFlag),
      color: "border-red-300 bg-red-50/80 text-red-800"
    },
    {
      id: "swell",
      label: "Severe Swelling",
      sub: "Sudden face/hand edema",
      icon: "💧",
      active: swellingFlag,
      toggle: () => setSwell(!swellingFlag),
      color: "border-blue-300 bg-blue-50/80 text-blue-800"
    },
    {
      id: "gd",
      label: "Gestational Diabetes",
      sub: "Elevated glucose symptoms",
      icon: "🍬",
      active: gestationalDiabetesFlag,
      toggle: () => setGd(!gestationalDiabetesFlag),
      color: "border-amber-300 bg-amber-50/80 text-amber-800"
    }
  ];

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Log Symptoms</h3>
            <p className="text-xs text-gray-500">Tap to toggle present maternal symptoms</p>
          </div>
        </div>
      </div>

      {/* Symptom Chip Buttons Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {symptoms.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.toggle}
            className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
              item.active
                ? `${item.color} shadow-md shadow-rose-500/10 scale-102 font-bold`
                : "bg-white border-rose-100 text-gray-700 hover:bg-rose-50/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <span className="text-sm font-bold block">{item.label}</span>
                <span className="text-[11px] text-gray-400 font-normal">{item.sub}</span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                item.active ? "bg-[#FF6F61] text-white" : "border border-gray-300"
              }`}
            >
              {item.active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => onSubmit(false)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF8E72] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Vitals & Risk Score...</span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              <span>Update Vitals & Risk Score</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
