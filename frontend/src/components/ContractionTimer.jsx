import { useState, useEffect } from 'react';
import { Play, Square, Timer, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContractionTimer() {
  const [contractions, setContractions] = useState(() => {
    const saved = localStorage.getItem('contractions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeStartTime, setActiveStartTime] = useState(() => {
    const saved = localStorage.getItem('contractionActiveStart');
    return saved ? parseInt(saved) : null;
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('contractions', JSON.stringify(contractions));
    if (activeStartTime) {
      localStorage.setItem('contractionActiveStart', activeStartTime);
    } else {
      localStorage.removeItem('contractionActiveStart');
    }
  }, [contractions, activeStartTime]);

  useEffect(() => {
    let interval;
    if (activeStartTime) {
      interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [activeStartTime]);

  const toggleTimer = () => {
    if (activeStartTime) {
      // Stop
      const durationMs = Date.now() - activeStartTime;
      const durationSecs = Math.floor(durationMs / 1000);
      
      const newContraction = {
        id: Date.now().toString(),
        startTime: activeStartTime,
        endTime: Date.now(),
        duration: durationSecs,
      };
      
      setContractions([newContraction, ...contractions]);
      setActiveStartTime(null);
      
      if (durationSecs > 60) {
        toast('Contraction over 1 minute. Keep tracking!', { icon: '⏱️' });
      }
    } else {
      // Start
      setActiveStartTime(Date.now());
      setCurrentTime(Date.now());
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatTime = (ms) => {
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFrequency = (index) => {
    if (index === contractions.length - 1) return '-';
    const current = contractions[index];
    const previous = contractions[index + 1];
    const diffMs = current.startTime - previous.startTime;
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min`;
  };

  const clearHistory = () => {
    if (window.confirm("Clear all contraction history?")) {
      setContractions([]);
    }
  };

  const activeDuration = activeStartTime ? Math.floor((currentTime - activeStartTime) / 1000) : 0;

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Contraction Timer</h3>
            <p className="text-xs text-gray-500">Track frequency & duration</p>
          </div>
        </div>
        {contractions.length > 0 && (
          <button onClick={clearHistory} className="text-[10px] uppercase font-bold text-gray-400 hover:text-rose-500 transition">
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className={`text-4xl font-bold font-heading mb-6 transition-colors ${activeStartTime ? 'text-rose-500' : 'text-gray-300'}`}>
          {formatDuration(activeDuration)}
        </div>
        
        <button
          onClick={toggleTimer}
          className={`relative overflow-hidden w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            activeStartTime 
              ? 'bg-gray-800 shadow-gray-500/30' 
              : 'bg-gradient-to-tr from-[#FF69B4] to-[#DDA0DD] shadow-rose-500/30'
          }`}
        >
          {activeStartTime ? (
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
          ) : null}
          {activeStartTime ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-10 h-10 ml-2 fill-current" />}
        </button>
        <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
          {activeStartTime ? 'Tap to Stop' : 'Tap to Start'}
        </p>
      </div>

      {/* 5-1-1 Rule Helper */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 mt-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <span className="font-bold block">5-1-1 Rule:</span>
          Go to the hospital when contractions are 5 mins apart, last 1 min, for 1 hour.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {contractions.length === 0 ? (
          <p className="text-center text-xs text-gray-400 mt-4">No contractions recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase text-gray-400 bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-2 font-bold rounded-l-lg">Time</th>
                <th className="px-2 py-2 font-bold">Duration</th>
                <th className="px-2 py-2 font-bold rounded-r-lg">Apart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contractions.map((c, i) => (
                <tr key={c.id} className="hover:bg-rose-50/50 transition">
                  <td className="px-2 py-2 text-gray-700 font-medium">{formatTime(c.startTime)}</td>
                  <td className="px-2 py-2 text-rose-600 font-bold">{formatDuration(c.duration)}</td>
                  <td className="px-2 py-2 text-gray-500 text-xs">{getFrequency(i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
