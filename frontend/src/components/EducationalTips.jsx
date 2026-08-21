
import React, { useState } from "react";
import { BookOpen, Sparkles, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { educationalTips, calculatePregnancyWeek } from "../data/pregnancyData";

export default function EducationalTips({ dueDate }) {
  const trimester = calculatePregnancyWeek(dueDate).trimester;
  const filteredTips = educationalTips.filter(t => t.trimester === trimester);
  const displayTips = filteredTips.length > 0 ? filteredTips : educationalTips;
  const [index, setIndex] = useState(0);

  const currentTip = displayTips[index % displayTips.length];

  return (
    <div className="card-warm p-6 bg-white/90 border border-rose-100 shadow-[0_8px_30px_rgb(255,110,127,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-gray-800">Maternal Care Guide</h3>
            <p className="text-xs text-gray-500">Trimester {trimester} recommended reading</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIndex(i => (i - 1 + displayTips.length) % displayTips.length)}
            className="p-1 rounded-lg hover:bg-rose-50 text-gray-500 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-400">
            {(index % displayTips.length) + 1}/{displayTips.length}
          </span>
          <button
            onClick={() => setIndex(i => (i + 1) % displayTips.length)}
            className="p-1 rounded-lg hover:bg-rose-50 text-gray-500 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-rose-50/60 to-pink-50/30 border border-rose-100/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
            {currentTip.tag}
          </span>
          <span className="text-xs font-semibold text-rose-700">{currentTip.category}</span>
        </div>

        <h4 className="font-heading font-bold text-base text-gray-800 mb-1">
          {currentTip.title}
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          {currentTip.content}
        </p>
      </div>
    </div>
  );
}
