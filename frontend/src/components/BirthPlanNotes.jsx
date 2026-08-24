
import React, { useState, useEffect } from "react";
import { FileText, HeartHandshake, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function BirthPlanNotes({ token }) {
  const [painManagement, setPain] = useState("");
  const [deliveryPreference, setDelivery] = useState("");
  const [supportPeople, setSupport] = useState("");
  const [atmosphereNotes, setAtmosphere] = useState("");
  const [specialNotes, setSpecial] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/patient/birth-plan", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setPain(data.pain_management || "");
          setDelivery(data.delivery_preference || "");
          setSupport(data.support_people || "");
          setAtmosphere(data.atmosphere_notes || "");
          setSpecial(data.special_notes || "");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5001/api/patient/birth-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          painManagement,
          deliveryPreference,
          supportPeople,
          atmosphereNotes,
          specialNotes
        })
      });
      if (res.ok) {
        toast.success("Birth preferences updated & visible to your doctor");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Birth Plan & Delivery Preferences</h3>
            <p className="text-xs text-gray-500">Shared with your assigned OB/GYN and hospital staff</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Pain Management Preferences</label>
            <input
              type="text"
              value={painManagement}
              onChange={e => setPain(e.target.value)}
              placeholder="e.g. Epidural, hydrotherapy, breathing techniques"
              className="w-full bg-rose-50/30 p-2.5 rounded-xl text-xs border border-rose-100 outline-none focus:border-[#FF69B4]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Support Partner(s) in Room</label>
            <input
              type="text"
              value={supportPeople}
              onChange={e => setSupport(e.target.value)}
              placeholder="e.g. Partner, Doula, Mother"
              className="w-full bg-rose-50/30 p-2.5 rounded-xl text-xs border border-rose-100 outline-none focus:border-[#FF69B4]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Delivery & Labor Atmosphere</label>
          <textarea
            rows={2}
            value={atmosphereNotes}
            onChange={e => setAtmosphere(e.target.value)}
            placeholder="e.g. Dimmed lighting, calm playlist, delayed cord clamping, immediate skin-to-skin"
            className="w-full bg-rose-50/30 p-2.5 rounded-xl text-xs border border-rose-100 outline-none focus:border-[#FF69B4]"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-[#FF69B4] to-[#DDA0DD] text-white rounded-xl text-xs font-bold hover:opacity-95 transition shadow-md shadow-rose-500/20 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Saving Plan..." : "Save Birth Preferences"}
        </button>
      </form>
    </div>
  );
}
