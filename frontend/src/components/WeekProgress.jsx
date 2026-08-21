
import React from "react";
import { Calendar, Sparkles, Heart } from "lucide-react";
import { calculatePregnancyWeek, getWeekData } from "../data/pregnancyData";

export default function WeekProgress({ dueDate }) {
  const { week, daysRemaining, trimester } = calculatePregnancyWeek(dueDate);
  const weekData = getWeekData(week);
  const percent = Math.min(100, Math.round((week / 40) * 100));

  const months = Math.floor(week / 4.3);
  const remainingWeeks = week % 4;

  return (
    <div className="card-warm p-6 relative overflow-hidden bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-purple-50/80 border border-rose-100/80 shadow-[0_8px_30px_rgb(255,110,127,0.08)]">
      {/* Soft background glow decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-rose-200/40 to-pink-300/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-rose-200/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#FF8E72] flex items-center justify-center text-2xl shadow-md shadow-rose-500/20">
              {weekData.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold font-heading text-gray-800">
                  Week {week} of 40
                </h2>
                <span className="bg-[#FF6F61] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  Trimester {trimester}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Baby is the size of a <span className="font-semibold text-rose-600">{weekData.size}</span> ({weekData.lengthCm} cm, {weekData.weightG}g)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/90 border border-rose-100/80 rounded-2xl px-3.5 py-2 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Estimated Due Date</span>
              <span className="text-sm font-bold text-gray-700 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                {dueDate ? new Date(dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "In ~16 Weeks"}
              </span>
            </div>

            <div className="bg-gradient-to-br from-[#FF6F61] to-[#FF8E72] text-white rounded-2xl px-4 py-2 text-center shadow-md shadow-rose-500/20">
              <span className="text-[10px] uppercase font-bold text-rose-100 block tracking-wider">Countdown</span>
              <span className="text-sm font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                {daysRemaining} Days to Go
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar with Trimester Milestones */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-gray-500 px-1">
            <span className={week <= 13 ? "text-rose-600 font-bold" : ""}>Trimester 1 (W1-13)</span>
            <span className={week > 13 && week <= 27 ? "text-rose-600 font-bold" : ""}>Trimester 2 (W14-27)</span>
            <span className={week > 27 ? "text-rose-600 font-bold" : ""}>Trimester 3 (W28-40)</span>
          </div>

          <div className="relative h-4 w-full bg-white/80 rounded-full p-0.5 border border-rose-100 shadow-inner overflow-hidden">
            {/* Trimester divider notches */}
            <div className="absolute top-0 bottom-0 left-[32.5%] w-[1px] bg-rose-200 z-10" />
            <div className="absolute top-0 bottom-0 left-[67.5%] w-[1px] bg-rose-200 z-10" />

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6F61] via-[#FF8E72] to-[#FF6584] shadow-sm transition-all duration-700 ease-out relative"
              style={{ width: `${Math.max(5, percent)}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md flex items-center justify-center mr-0.5">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-medium px-1 pt-0.5">
            <span>Conception</span>
            <span className="text-rose-600 font-semibold">{percent}% Complete</span>
            <span>Arrival Day 🍼</span>
          </div>
        </div>
      </div>
    </div>
  );
}
