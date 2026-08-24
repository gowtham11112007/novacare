
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Footprints, History, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function KickCounter({ token }) {
  const [kickCount, setKickCount] = useState(() => parseInt(localStorage.getItem('kickCount') || '0'));
  const [isActive, setIsActive] = useState(() => localStorage.getItem('kickActive') === 'true');
  const [kickStartTime, setKickStartTime] = useState(() => {
    const saved = localStorage.getItem('kickStartTime');
    return saved ? parseInt(saved) : null;
  });
  const [seconds, setSeconds] = useState(0); // display only
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKickLogs();
  }, []);

  useEffect(() => {
    localStorage.setItem('kickCount', kickCount);
    localStorage.setItem('kickActive', isActive);
    if (kickStartTime) {
      localStorage.setItem('kickStartTime', kickStartTime);
    } else {
      localStorage.removeItem('kickStartTime');
    }
  }, [kickCount, isActive, kickStartTime]);

  const fetchKickLogs = async () => {
    try {
      const res = await fetch("https://novacare-sccg.onrender.com/api/patient/kick-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && kickStartTime) {
      // Immediate update
      setSeconds(Math.floor((Date.now() - kickStartTime) / 1000));
      interval = setInterval(() => {
        setSeconds(Math.floor((Date.now() - kickStartTime) / 1000));
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isActive, kickStartTime]);

  const handleRecordKick = () => {
    if (!isActive) {
      setIsActive(true);
      if (!kickStartTime) setKickStartTime(Date.now());
    }
    const newCount = kickCount + 1;
    setKickCount(newCount);

    if (newCount === 10) {
      setIsActive(false);
      const currentSeconds = Math.floor((Date.now() - kickStartTime) / 1000);
      toast.success("🎉 Reached 10 kicks! Great job monitoring your baby.", { duration: 4000 });
      saveSession(10, Math.ceil(currentSeconds / 60) || 1, true);
      setKickStartTime(null);
    }
  };

  const saveSession = async (count, durationMins, target) => {
    setIsSaving(true);
    try {
      const res = await fetch("https://novacare-sccg.onrender.com/api/patient/kick-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          kickCount: count,
          durationMinutes: durationMins,
          targetReached: target
        })
      });
      if (res.ok) {
        toast.success("Kick session saved to health record");
        fetchKickLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setKickCount(0);
    setSeconds(0);
    setKickStartTime(null);
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100/70 text-rose-500 flex items-center justify-center">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Kick Counter</h3>
            <p className="text-xs text-gray-500">Track 10 fetal movements in 3rd Trimester</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase font-bold text-gray-400 block tracking-wider">Timer</span>
          <span className="font-mono text-lg font-bold text-rose-600">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center text-center">
        {/* Large Interactive Tap Button */}
        <button
          onClick={handleRecordKick}
          className="group relative w-36 h-36 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#DDA0DD] text-white flex flex-col items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping opacity-25 group-hover:opacity-50" />
          <Footprints className="w-8 h-8 mb-1 opacity-90 group-hover:rotate-12 transition" />
          <span className="text-3xl font-extrabold">{kickCount}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-100">Tap for Kick</span>
        </button>

        {/* Goal Indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < kickCount ? "bg-[#FF69B4] scale-110" : "bg-rose-100"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500 ml-1">
            {kickCount}/10 kicks
          </span>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
          >
            {isActive ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Start Timer</>}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {kickCount > 0 && kickCount < 10 && (
            <button
              onClick={() => saveSession(kickCount, Math.ceil(seconds / 60) || 1, false)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF69B4] text-white hover:bg-rose-600 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Save Session
            </button>
          )}
        </div>
      </div>

      {/* Recent Kick Sessions */}
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-rose-50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Recent Sessions</span>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {history.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-rose-50/40 px-3 py-1.5 rounded-lg text-xs">
                <span className="font-medium text-gray-700">
                  {item.kick_count} kicks in {item.duration_minutes || 1} min
                </span>
                <span className="text-gray-400">
                  {new Date(item.recorded_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
