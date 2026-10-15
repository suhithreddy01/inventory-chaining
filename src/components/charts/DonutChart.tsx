import React, { useState } from 'react';

export interface Slice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Slice[];
  size?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerSub?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  innerRadius = 55,
  centerLabel,
  centerSub
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const radius = size / 2;
  const strokeWidth = radius - innerRadius;
  const r = innerRadius + strokeWidth / 2;
  const circumference = 2 * Math.PI * r;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === index;

            return (
              <circle
                key={index}
                cx={radius}
                cy={radius}
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-lg font-bold text-slate-800 leading-tight">
            {hoveredIdx !== null ? data[hoveredIdx].value.toLocaleString() : (centerLabel || total.toLocaleString())}
          </span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            {hoveredIdx !== null ? data[hoveredIdx].label : (centerSub || 'Total')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 text-xs max-w-xs">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 cursor-pointer px-1 py-0.5 rounded transition-colors ${
              hoveredIdx === idx ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600'
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
            <span className="text-slate-400 font-mono">
              ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
