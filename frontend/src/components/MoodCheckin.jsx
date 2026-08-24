
import React, { useState, useEffect } from "react";
import { Smile, Sparkles, Heart } from "lucide-react";
import { moodOptions } from "../data/pregnancyData";
import toast from "react-hot-toast";

export default function MoodCheckin({ token }) {
  const [selectedMood, setSelectedMood] = useState(() => localStorage.getItem('selectedMood') || null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    fetchMoods();
  }, []);

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('selectedMood', selectedMood);
    } else {
      localStorage.removeItem('selectedMood');
    }
  }, [selectedMood]);

  const fetchMoods = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/patient/moods", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMoodHistory(data);
        if (data.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const todayEntry = data.find(m => m.recorded_at && m.recorded_at.startsWith(today));
          if (todayEntry) {
            setSelectedMood(todayEntry.mood);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMood = async (moodItem) => {
    setSelectedMood(moodItem.id);
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5001/api/patient/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mood: moodItem.id,
          moodLabel: moodItem.label,
          note: note
        })
      });
      if (res.ok) {
        toast.success(`Logged mood: ${moodItem.label}`);
        fetchMoods();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Maternal Wellness Check-in</h3>
            <p className="text-xs text-gray-500">How are you feeling emotionally today?</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {moodOptions.map((item) => {
            const isSelected = selectedMood === item.id;
            let IconComponent;
            if (item.id === 'great') IconComponent = Heart;
            else if (item.id === 'good') IconComponent = Smile;
            else if (item.id === 'okay') IconComponent = Sparkles;
            else if (item.id === 'sad') IconComponent = Smile; // Fallback, could use Frown but let's keep it elegant
            else IconComponent = Heart; // Fallback

            return (
              <button
                key={item.id}
                onClick={() => handleSelectMood(item)}
                disabled={isSubmitting}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-b from-rose-50 to-pink-100 border-[#FF69B4] shadow-md shadow-rose-500/20 scale-105"
                    : "bg-white border-rose-100/60 hover:bg-rose-50/50 hover:scale-102"
                }`}
              >
                <span className={`mb-2 transform hover:scale-110 transition ${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>
                  <IconComponent size={28} />
                </span>
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
                <span className="hidden md:block text-[9px] text-gray-400 mt-0.5 text-center leading-tight">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {moodHistory.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rose-50 flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">Recent Check-ins:</span>
          {moodHistory.slice(0, 5).map((m, i) => {
            const found = moodOptions.find(o => o.id === m.mood) || moodOptions[1];
            return (
              <div key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50/60 rounded-full text-xs text-gray-700 border border-rose-100 shrink-0">
                <span className="font-medium text-[11px]">{found.label}</span>
                <span className="font-medium text-[11px] opacity-60">· {new Date(m.recorded_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
