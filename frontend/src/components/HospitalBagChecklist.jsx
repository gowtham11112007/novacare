import { useState, useEffect } from 'react';
import { CheckSquare, Square, Briefcase } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  {
    name: 'For Mom',
    items: [
      { id: 'm1', name: 'Comfortable robes/pajamas', checked: false },
      { id: 'm2', name: 'Nursing bras and pads', checked: false },
      { id: 'm3', name: 'Toiletries & lip balm', checked: false },
      { id: 'm4', name: 'Going home outfit', checked: false },
      { id: 'm5', name: 'Phone charger (extra long)', checked: false }
    ]
  },
  {
    name: 'For Baby',
    items: [
      { id: 'b1', name: 'Going home outfit (newborn & 0-3m)', checked: false },
      { id: 'b2', name: 'Receiving blankets', checked: false },
      { id: 'b3', name: 'Newborn socks/mittens', checked: false },
      { id: 'b4', name: 'Installed car seat', checked: false }
    ]
  },
  {
    name: 'For Partner/Labor',
    items: [
      { id: 'p1', name: 'Snacks and drinks', checked: false },
      { id: 'p2', name: 'Change of clothes', checked: false },
      { id: 'p3', name: 'Important documents (ID, Insurance)', checked: false },
      { id: 'p4', name: 'Birth plan copies', checked: false }
    ]
  }
];

export default function HospitalBagChecklist() {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('hospitalBag');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('hospitalBag', JSON.stringify(categories));
  }, [categories]);

  const toggleItem = (catIndex, itemId) => {
    const newCategories = [...categories];
    const item = newCategories[catIndex].items.find(i => i.id === itemId);
    if (item) item.checked = !item.checked;
    setCategories(newCategories);
  };

  const getProgress = () => {
    let total = 0;
    let checked = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        if (item.checked) checked++;
      });
    });
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  };

  return (
    <div className="card-warm p-6 bg-white/90 border border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.06)] h-[460px] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-emerald-50 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Hospital Bag</h3>
            <p className="text-xs text-gray-500">Prepare for delivery day</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-emerald-600">{getProgress()}%</span>
          <p className="text-[10px] text-gray-400 font-medium uppercase">Packed</p>
        </div>
      </div>
      
      <div className="w-full bg-emerald-50 h-2 rounded-full mb-4 overflow-hidden shrink-0">
        <div className="bg-emerald-500 h-full transition-all duration-500 ease-out" style={{ width: `${getProgress()}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {categories.map((cat, catIndex) => (
          <div key={cat.name} className="space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider sticky top-0 bg-white/90 backdrop-blur py-1 z-10">{cat.name}</h4>
            <div className="space-y-2">
              {cat.items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItem(catIndex, item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${item.checked ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                >
                  <div className={`shrink-0 text-${item.checked ? 'emerald-500' : 'gray-300'}`}>
                    {item.checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
