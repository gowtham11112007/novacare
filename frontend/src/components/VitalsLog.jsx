
import React, { useState, useEffect } from "react";
import { Scale, HeartPulse, Plus, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

export default function VitalsLog({ token }) {
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState("65.8");
  const [systolic, setSystolic] = useState("118");
  const [diastolic, setDiastolic] = useState("78");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const res = await fetch("https://novacare-scog.onrender.com/api/patient/vitals-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("https://novacare-scog.onrender.com/api/patient/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          weightKg: parseFloat(weight),
          bpSystolic: parseInt(systolic),
          bpDiastolic: parseInt(diastolic)
        })
      });
      if (res.ok) {
        toast.success("Vitals logged successfully");
        fetchVitals();
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
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Weight & Blood Pressure Log</h3>
            <p className="text-xs text-gray-500">Monitor maternal weight trajectory & BP stability</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Form to log today reading */}
        <form onSubmit={handleSubmit} className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100/60 space-y-3">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Log New Reading</span>
          
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Weight (kg)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full bg-white p-2 rounded-xl text-xs border border-gray-200 outline-none focus:border-rose-400 font-bold"
              />
              <span className="absolute right-3 top-2 text-xs text-gray-400">kg</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Systolic</label>
              <input
                type="number"
                required
                value={systolic}
                onChange={e => setSystolic(e.target.value)}
                className="w-full bg-white p-2 rounded-xl text-xs border border-gray-200 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Diastolic</label>
              <input
                type="number"
                required
                value={diastolic}
                onChange={e => setDiastolic(e.target.value)}
                className="w-full bg-white p-2 rounded-xl text-xs border border-gray-200 outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#FF6F61] text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Vitals"}
          </button>
        </form>

        {/* Chart representation */}
        <div className="lg:col-span-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis domain={["auto", "auto"]} stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "12px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px"
                }}
              />
              <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#FF6F61" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="systolic" name="BP Systolic" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
