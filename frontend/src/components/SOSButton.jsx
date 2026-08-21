
import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, X, PhoneCall, HeartHandshake } from "lucide-react";

export default function SOSButton({ onConfirm, loading }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleConfirmSOS = () => {
    setModalOpen(false);
    onConfirm(true);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={loading}
        className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-3.5 px-6 rounded-2xl font-bold font-heading text-sm md:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/30 animate-sos-glow cursor-pointer transition active:scale-98"
      >
        <ShieldAlert className="w-5 h-5 animate-pulse" />
        <span>SOS EMERGENCY (Instant Doctor Dispatch)</span>
      </button>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold font-heading text-gray-900 text-center">
              Trigger Emergency SOS Alert?
            </h3>

            <p className="text-sm text-gray-600 text-center mt-2 leading-relaxed">
              This will immediately update your risk score to <span className="font-bold text-red-600">100 (Critical)</span>, push an urgent alert to the high-priority triage heap, and notify your assigned doctor right away.
            </p>

            <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>For life-threatening emergencies, also dial 911 immediately.</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-500/30 transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                Yes, Alert Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
