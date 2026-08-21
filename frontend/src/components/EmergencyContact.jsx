
import React, { useState, useEffect } from "react";
import { Phone, User, Edit3, Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function EmergencyContact({ token }) {
  const [contactName, setContactName] = useState("David Mehta");
  const [contactPhone, setContactPhone] = useState("+1 (555) 349-2810");
  const [relationship, setRelationship] = useState("Husband / Primary Partner");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await fetch("https://novacare-scog.onrender.com/api/patient/emergency-contact", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setContactName(data.contact_name || "David Mehta");
          setContactPhone(data.contact_phone || "+1 (555) 349-2810");
          setRelationship(data.relationship || "Primary Partner");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://novacare-scog.onrender.com/api/patient/emergency-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contactName, contactPhone, relationship })
      });
      if (res.ok) {
        toast.success("Emergency contact updated");
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card-warm p-4 bg-rose-50/70 border border-rose-200/70 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Primary Emergency Contact</span>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" /> {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-2 mt-2">
          <input
            type="text"
            required
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            placeholder="Contact Full Name"
            className="w-full bg-white p-2 rounded-xl text-xs border border-rose-200 outline-none"
          />
          <input
            type="tel"
            required
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full bg-white p-2 rounded-xl text-xs border border-rose-200 outline-none"
          />
          <input
            type="text"
            value={relationship}
            onChange={e => setRelationship(e.target.value)}
            placeholder="Relationship"
            className="w-full bg-white p-2 rounded-xl text-xs border border-rose-200 outline-none"
          />
          <button
            type="submit"
            className="w-full py-1.5 bg-[#FF6F61] text-white rounded-xl text-xs font-bold"
          >
            Save Contact
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <div>
            <h4 className="font-bold text-sm text-gray-800">{contactName}</h4>
            <p className="text-[11px] text-gray-500">{relationship}</p>
          </div>
          <a
            href={`tel:${contactPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-600 rounded-xl text-xs font-bold border border-rose-200 shadow-xs hover:bg-rose-50 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{contactPhone}</span>
          </a>
        </div>
      )}
    </div>
  );
}
