
import React, { useState, useEffect } from "react";
import { Pill, Check, Plus, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MedicationChecklist({ token }) {
  const [meds, setMeds] = useState([]);
  const [newMedName, setNewMedName] = useState("");
  const [newTime, setNewTime] = useState("09:00 AM");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      const res = await fetch("https://novacare-sccg.onrender.com/api/patient/medications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMeds(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (item) => {
    const updated = meds.map(m => m.id === item.id ? { ...m, taken: !m.taken } : m);
    setMeds(updated);
    try {
      await fetch("https://novacare-sccg.onrender.com/api/patient/medication-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: item.id, taken: !item.taken })
      });
      toast.success(!item.taken ? `Taken: ${item.medication_name}` : "Marked uncompleted");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMed = async (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    try {
      const res = await fetch("https://novacare-sccg.onrender.com/api/patient/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ medicationName: newMedName, scheduledTime: newTime })
      });
      if (res.ok) {
        toast.success("Medication added");
        setNewMedName("");
        setShowAdd(false);
        fetchMeds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Daily Vitamins & Meds</h3>
            <p className="text-xs text-gray-500">Prenatal nutrition schedule</p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddMed} className="mt-4 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
          <input
            type="text"
            required
            placeholder="e.g. Magnesium Glycinate, Probiotics..."
            value={newMedName}
            onChange={e => setNewMedName(e.target.value)}
            className="w-full bg-white px-3 py-2 rounded-xl text-xs border border-rose-200 outline-none focus:border-rose-400"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 08:00 AM"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="flex-1 bg-white px-3 py-2 rounded-xl text-xs border border-rose-200 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF69B4] text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 space-y-2.5">
        {meds.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item)}
            className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
              item.taken
                ? "bg-rose-50/50 border-rose-200 text-gray-400"
                : "bg-white border-gray-100 hover:border-rose-200 text-gray-800 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                  item.taken ? "bg-emerald-500 text-white" : "border border-gray-300"
                }`}
              >
                {item.taken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className={`text-xs font-bold ${item.taken ? "line-through text-gray-400" : "text-gray-800"}`}>
                {item.medication_name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Clock className="w-3 h-3" />
              <span>{item.scheduled_time || "09:00 AM"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
