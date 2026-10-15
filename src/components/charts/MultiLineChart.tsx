import React, { useState } from 'react';

export interface Series {
  name: string;
  color: string;
  data: number[];
}

interface MultiLineChartProps {
  labels: string[];
  series: Series[];
  height?: number;
  valueSuffix?: string;
  valuePrefix?: string;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  labels,
  series,
  height = 220,
  valueSuffix = '',
  valuePrefix = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!labels.length || !series.length) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-400">No chart data</div>;
  }

  const allValues = series.flatMap(s => s.data);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(10, ...allValues);
  const range = maxVal - minVal || 1;

  const width = 640;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  return (
    <div className="w-full select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-2 px-2 text-xs">
        {series.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 font-medium">{s.name}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          style={{ height }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yPos = paddingY + chartHeight * (1 - ratio);
            const val = Math.round(minVal + range * ratio);
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
                  x={paddingX - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Lines for each series */}
          {series.map((s, sIdx) => {
            const points = s.data.map((val, i) => {
              const x = paddingX + (i / (labels.length - 1 || 1)) * chartWidth;
              const y = height - paddingY - ((val - minVal) / range) * chartHeight;
              return { x, y, val };
            });

            const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

            return (
              <g key={sIdx}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 4.5 : 2.5}
                    fill="#ffffff"
                    stroke={s.color}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, i) => {
            const x = paddingX + (i / (labels.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {label}
              </text>
            );
          })}

          {/* Hover guideline */}
          {hoveredIndex !== null && (
            <line
              x1={paddingX + (hoveredIndex / (labels.length - 1 || 1)) * chartWidth}
              y1={paddingY}
              x2={paddingX + (hoveredIndex / (labels.length - 1 || 1)) * chartWidth}
              y2={height - paddingY}
              stroke="#94a3b8"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Hover summary popup */}
        {hoveredIndex !== null && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 min-w-[130px]"
            style={{
              left: `${Math.min(75, Math.max(15, ((paddingX + (hoveredIndex / (labels.length - 1 || 1)) * chartWidth) / width) * 100))}%`,
              top: '10%'
            }}
          >
            <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">
              {labels[hoveredIndex]}
            </div>
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-[11px] py-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}:
                </span>
                <span className="font-mono font-semibold text-white">
                  {valuePrefix}{s.data[hoveredIndex]?.toLocaleString()}{valueSuffix}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
