import { useState, useEffect } from 'react';
import { Heart, Trash2, Plus, Baby } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BabyNameIdeas() {
  const [names, setNames] = useState(() => {
    const saved = localStorage.getItem('babyNames');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: '1', name: 'Aria', gender: 'girl', rating: 0 },
      { id: '2', name: 'Leo', gender: 'boy', rating: 0 }
    ];
  });
  const [newName, setNewName] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // all, boy, girl, neutral

  useEffect(() => {
    localStorage.setItem('babyNames', JSON.stringify(names));
  }, [names]);

  const addName = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    // Guess gender based on a very naive assumption or default to neutral for manual tag
    const newEntry = {
      id: Date.now().toString(),
      name: newName.trim(),
      gender: genderFilter !== 'all' ? genderFilter : 'neutral',
      rating: 0
    };
    
    setNames([newEntry, ...names]);
    setNewName('');
    toast.success('Name added to your list!');
  };

  const removeName = (id) => {
    setNames(names.filter(n => n.id !== id));
  };

  const toggleRating = (id) => {
    setNames(names.map(n => {
      if (n.id === id) {
        return { ...n, rating: n.rating === 1 ? 0 : 1 };
      }
      return n;
    }));
  };

  const filteredNames = names
    .filter(n => genderFilter === 'all' || n.gender === genderFilter)
    .sort((a, b) => b.rating - a.rating); // Favorites at top

  return (
    <div className="card-warm p-6 bg-white/90 border border-purple-100 shadow-[0_8px_30px_rgb(168,85,247,0.06)] h-[460px] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Baby className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Baby Names</h3>
            <p className="text-xs text-gray-500">Collect your favorites</p>
          </div>
        </div>
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
          {names.length} Saved
        </span>
      </div>

      <form onSubmit={addName} className="flex gap-2 mb-4 shrink-0">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a name idea..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition"
        />
        <button 
          type="submit"
          disabled={!newName.trim()}
          className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 rounded-xl transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar shrink-0">
        {['all', 'girl', 'boy', 'neutral'].map(g => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
              genderFilter === g 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {filteredNames.length === 0 ? (
          <div className="text-center text-xs text-gray-400 mt-8">
            No names found. Add some ideas!
          </div>
        ) : (
          filteredNames.map(name => (
            <div 
              key={name.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-xs hover:border-purple-200 transition group"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleRating(name.id)}
                  className={`transition-colors ${name.rating === 1 ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}
                >
                  <Heart className={`w-5 h-5 ${name.rating === 1 ? 'fill-current' : ''}`} />
                </button>
                <div>
                  <span className="font-bold text-gray-800 text-sm block">{name.name}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${
                    name.gender === 'girl' ? 'text-pink-500' : 
                    name.gender === 'boy' ? 'text-blue-500' : 'text-amber-500'
                  }`}>
                    {name.gender}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => removeName(name.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
