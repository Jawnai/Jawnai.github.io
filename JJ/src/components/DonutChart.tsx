// src/components/DonutChart.tsx
import React from 'react';
import { formatThaiCurrency } from '../utils/thaiDate';

export interface ChartSegment {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: ChartSegment[];
  total: number;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  total,
  size = 220,
  strokeWidth = 28,
}) => {
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
        <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-2">
          <span className="text-sm">ไม่มีข้อมูล</span>
        </div>
        <p className="text-xs">ยังไม่มีรายการค่าใช้จ่ายในช่วงนี้</p>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center">
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/80"
            fill="transparent"
          />

          {/* Slices */}
          {data.map((seg, i) => {
            const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (seg.percentage / 100) * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out hover:opacity-85"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">รวมค่าใช้จ่าย</span>
          <span className="text-lg font-bold text-slate-800 dark:text-white truncate max-w-full">
            {formatThaiCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 w-full text-xs">
        {data.map((seg, i) => (
          <div key={i} className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/50">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {seg.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold ml-1 shrink-0">
                  {seg.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatThaiCurrency(seg.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
