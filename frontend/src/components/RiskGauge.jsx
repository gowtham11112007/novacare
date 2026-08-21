
import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function RiskGauge({ score = 0, size = 160, strokeWidth = 14, showLabel = true }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, Number(score) || 0));
    if (end === 0) {
      setAnimatedScore(0);
      return;
    }
    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(start + (end - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 240 degrees (leaving 120 open at bottom)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(animatedScore, 100)) / 100;

  // Determine risk level category and color
  let category = "Low Risk";
  let textColor = "text-emerald-600";
  let bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let icon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;

  if (animatedScore >= 80) {
    category = "Critical Risk";
    textColor = "text-rose-600";
    bgColor = "bg-rose-50 text-rose-700 border-rose-200";
    icon = <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />;
  } else if (animatedScore >= 50) {
    category = "High Risk";
    textColor = "text-amber-600";
    bgColor = "bg-amber-50 text-amber-700 border-amber-200";
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
  } else if (animatedScore >= 25) {
    category = "Moderate";
    textColor = "text-orange-500";
    bgColor = "bg-orange-50 text-orange-700 border-orange-200";
    icon = <ShieldCheck className="w-4 h-4 text-orange-500" />;
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90 origin-center" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1e6ea"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
          />

          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-2">
          <span className={`font-extrabold tracking-tight ${textColor}`} style={{ fontSize: size * 0.24 }}>
            {animatedScore}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider -mt-1">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${bgColor}`}>
          {icon}
          <span>{category}</span>
        </div>
      )}
    </div>
  );
}
