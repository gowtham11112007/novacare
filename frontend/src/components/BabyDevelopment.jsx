
import React, { useState } from "react";
import { Heart, Sparkles, Info, Ruler, Weight, ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekData, calculatePregnancyWeek } from "../data/pregnancyData";

export default function BabyDevelopment({ dueDate }) {
  const currentWeek = calculatePregnancyWeek(dueDate).week;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const weekData = getWeekData(selectedWeek);

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)] relative">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Baby Development</h3>
            <p className="text-xs text-gray-500">Weekly milestones & size comparisons</p>
          </div>
        </div>

        {/* Week navigation buttons */}
        <div className="flex items-center gap-1.5 bg-rose-50/70 p-1 rounded-xl">
          <button
            onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
            disabled={selectedWeek <= 1}
            className="p-1 rounded-lg hover:bg-white disabled:opacity-30 transition text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-rose-700 px-2">
            Wk {selectedWeek}
          </span>
          <button
            onClick={() => setSelectedWeek(w => Math.min(40, w + 1))}
            disabled={selectedWeek >= 40}
            className="p-1 rounded-lg hover:bg-white disabled:opacity-30 transition text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main hero card */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: Cute Illustrated Badge */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-100/70 rounded-2xl p-5 flex flex-col items-center justify-center text-center border border-rose-100 relative overflow-hidden">
          <span className="text-5xl md:text-6xl filter drop-shadow-md mb-2 transform hover:scale-110 transition duration-300">
            {weekData.emoji}
          </span>
          <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Size of a</span>
          <span className="text-base font-bold text-gray-800 mt-0.5">{weekData.size}</span>
          {selectedWeek === currentWeek && (
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs">
              Current Week
            </span>
          )}
        </div>

        {/* Right: Facts & Vitals */}
        <div className="md:col-span-2 space-y-3.5">
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Development Spotlight</span>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              "{weekData.fact}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Avg Length</span>
                <span className="text-sm font-bold text-gray-800">{weekData.lengthCm} cm</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <Weight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Avg Weight</span>
                <span className="text-sm font-bold text-gray-800">{weekData.weightG} g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
