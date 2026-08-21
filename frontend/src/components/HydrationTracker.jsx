
import React, { useState, useEffect } from "react";
import { Droplet, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function HydrationTracker({ token }) {
  const [glasses, setGlasses] = useState(0);
  const [ironTaken, setIronTaken] = useState(false);
  const [folicAcidTaken, setFolicAcidTaken] = useState(false);

  useEffect(() => {
    fetchWaterLog();
  }, []);

  const fetchWaterLog = async () => {
    try {
      const res = await fetch("https://novacare-scog.onrender.com/api/patient/water-log", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGlasses(data.glasses_count || 0);
        setIronTaken(!!data.iron_taken);
        setFolicAcidTaken(!!data.folic_acid_taken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateServer = async (newGlasses, newIron, newFolic) => {
    try {
      await fetch("https://novacare-scog.onrender.com/api/patient/water-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          glassesCount: newGlasses,
          ironTaken: newIron,
          folicAcidTaken: newFolic
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGlass = (index) => {
    const newCount = index + 1 === glasses ? index : index + 1;
    setGlasses(newCount);
    updateServer(newCount, ironTaken, folicAcidTaken);
    if (newCount === 8) {
      toast.success("💧 8 Glasses goal reached! Hydration protects amniotic fluid balance.");
    }
  };

  const handleIronToggle = () => {
    const next = !ironTaken;
    setIronTaken(next);
    updateServer(glasses, next, folicAcidTaken);
    toast.success(next ? "Iron supplement checked" : "Iron unchecked");
  };

  const handleFolicToggle = () => {
    const next = !folicAcidTaken;
    setFolicAcidTaken(next);
    updateServer(glasses, ironTaken, next);
    toast.success(next ? "Folic acid checked" : "Folic acid unchecked");
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-sky-400 text-sky-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Hydration & Nutrition</h3>
            <p className="text-xs text-gray-500">Target: 8-10 glasses (2.5L) daily</p>
          </div>
        </div>

        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          {glasses}/8 Glasses ({(glasses * 0.25).toFixed(1)}L)
        </span>
      </div>

      {/* Interactive Water Glasses Grid */}
      <div className="mt-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < glasses;
            return (
              <button
                key={i}
                onClick={() => handleToggleGlass(i)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 ${
                  filled
                    ? "bg-gradient-to-b from-sky-400 to-blue-500 text-white border-sky-400 shadow-md shadow-sky-300/40 scale-105"
                    : "bg-sky-50/40 border-sky-100 text-sky-300 hover:bg-sky-50"
                }`}
              >
                <Droplet className={`w-6 h-6 ${filled ? "fill-white text-white" : ""}`} />
                <span className="text-[10px] font-bold mt-1">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Micronutrient Toggles */}
      <div className="mt-5 pt-4 border-t border-rose-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleFolicToggle}
          className={`flex items-center justify-between p-3 rounded-2xl border transition ${
            folicAcidTaken
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-rose-50/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
              folicAcidTaken ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"
            }`}>
              {folicAcidTaken ? <Check className="w-4 h-4" /> : "💊"}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block">Folic Acid (400 mcg)</span>
              <span className="text-[10px] text-gray-400">Neural tube support</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold">{folicAcidTaken ? "Taken" : "Pending"}</span>
        </button>

        <button
          onClick={handleIronToggle}
          className={`flex items-center justify-between p-3 rounded-2xl border transition ${
            ironTaken
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-rose-50/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
              ironTaken ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"
            }`}>
              {ironTaken ? <Check className="w-4 h-4" /> : "🩸"}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block">Iron Supplement</span>
              <span className="text-[10px] text-gray-400">Oxygen & blood volume</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold">{ironTaken ? "Taken" : "Pending"}</span>
        </button>
      </div>
    </div>
  );
}
