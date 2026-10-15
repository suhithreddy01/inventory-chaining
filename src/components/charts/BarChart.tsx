import React, { useState } from 'react';

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 180,
  valuePrefix = '',
  valueSuffix = '',
  barColor = '#3b82f6'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No chart data</div>;
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10);

  const width = 600;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const barCount = data.length;
  const slotWidth = chartWidth / barCount;
  const barWidth = Math.min(36, slotWidth * 0.65);

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const yPos = paddingY + chartHeight * (1 - ratio);
          const val = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={yPos}
                x2={width - paddingX}
                y2={yPos}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingX - 6}
                y={yPos + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartHeight;
          const xPos = paddingX + i * slotWidth + (slotWidth - barWidth) / 2;
          const yPos = height - paddingY - barH;
          const isHovered = hoveredIdx === i;

          return (
            <g key={i}>
              <rect
                x={xPos}
                y={yPos}
                width={barWidth}
                height={Math.max(2, barH)}
                rx="4"
                fill={d.color || barColor}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={xPos + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg transform -translate-x-1/2 -translate-y-full border border-slate-700"
          style={{
            left: `${((paddingX + hoveredIdx * slotWidth + slotWidth / 2) / width) * 100}%`,
            top: '20%'
          }}
        >
          <div className="font-semibold text-slate-300">{data[hoveredIdx].label}</div>
          <div className="font-bold text-white text-sm">
            {valuePrefix}{data[hoveredIdx].value.toLocaleString()}{valueSuffix}
          </div>
        </div>
      )}
    </div>
  );
};
