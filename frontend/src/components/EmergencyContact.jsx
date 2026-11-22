import { useState, useEffect } from 'react';
import { Phone, Edit3, ShieldCheck, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../lib/api';

const inputClass =
  'w-full bg-white px-3 py-2.5 rounded-xl text-sm border border-rose-200 outline-none transition focus:border-[#FF69B4] focus:ring-4 focus:ring-pink-100';

export default function EmergencyContact({ token }) {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hasContact, setHasContact] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient/emergency-contact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.contact_name && data?.contact_phone) {
            setContactName(data.contact_name);
            setContactPhone(data.contact_phone);
            setRelationship(data.relationship || '');
            setHasContact(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    };
    fetchContact();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/patient/emergency-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contactName, contactPhone, relationship }),
      });
      if (res.ok) {
        toast.success('Emergency contact saved');
        setHasContact(true);
        setIsEditing(false);
      } else {
        toast.error('Could not save the contact. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while saving the contact.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-warm p-5 bg-rose-50/70 border border-rose-200/70 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span>Emergency contact</span>
        </div>
        {hasContact && (
          <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-2.5">
          <label className="block">
            <span className="sr-only">Full name</span>
            <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" autoComplete="name" className={inputClass} />
          </label>
          <label className="block">
            <span className="sr-only">Phone number</span>
            <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" autoComplete="tel" className={inputClass} />
          </label>
          <label className="block">
            <span className="sr-only">Relationship</span>
            <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Relationship (e.g. Partner)" className={inputClass} />
          </label>
          <div className="flex gap-2 pt-1">
            {!hasContact && (
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition">
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-gradient-to-r from-[#FF69B4] to-[#b57edc] text-white rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save contact
            </button>
          </div>
        </form>
      ) : hasContact ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-gray-800 truncate">{contactName}</h4>
            {relationship && <p className="text-xs text-gray-500">{relationship}</p>}
          </div>
          <a href={`tel:${contactPhone}`} className="inline-flex shrink-0 items-center gap-1.5 px-3 py-2 bg-white text-rose-600 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-50 transition">
            <Phone className="w-3.5 h-3.5" />
            <span>{contactPhone}</span>
          </a>
        </div>
      ) : loaded ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-600 leading-relaxed">Add someone we should call if you trigger an SOS.</p>
          <button onClick={() => setIsEditing(true)} className="inline-flex shrink-0 items-center gap-1.5 px-3 py-2 bg-white text-rose-600 rounded-xl text-xs font-bold border border-rose-200 hover:bg-rose-50 transition">
            <UserPlus className="w-3.5 h-3.5" /> Add contact
          </button>
        </div>
      ) : (
        <div className="h-9 rounded-xl bg-white/60 animate-pulse" />
      )}
    </div>
  );
}
