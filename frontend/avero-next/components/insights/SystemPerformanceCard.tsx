'use client';

import { useState } from 'react';

export function SystemPerformanceCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Data points matching Image 4
  const points = [
    { label: 'recall@k', score: 0.65, baseline: 0.52 },
    { label: 'Summer', score: 0.76, baseline: 0.50 },
    { label: 'Prices', score: 0.72, baseline: 0.53 },
    { label: 'Trousers', score: 0.84, baseline: 0.58 },
    { label: 'Shoes', score: 0.81, baseline: 0.61 },
    { label: 'Festive', score: 0.88, baseline: 0.64 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs flex flex-col h-full">
      {/* Title */}
      <h3 className="text-base font-semibold text-[#171717] tracking-tight mb-2">
        System Performance
      </h3>

      {/* Subtitles & Legend matching Image 4 */}
      <div className="flex items-center justify-between text-xs font-mono mb-4 text-[#666]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>Recall@k scores</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-[#94A3B8]" />
          <span>Recall@k baselines</span>
        </div>
      </div>

      {/* SVG Dual-Line Chart (matching Image 4 layout) */}
      <div className="w-full flex-1 min-h-[220px] bg-[#FAFAF8] rounded-xl border border-[#ECECE8] p-3 relative flex items-center justify-center">
        <svg viewBox="0 0 460 170" className="w-full h-full">
          {/* Horizontal grid lines */}
          {[0, 0.5, 1.0].map((v) => {
            const y = 140 - v * 110;
            return (
              <g key={v}>
                <line x1="45" y1={y} x2="440" y2={y} stroke="#EBEBE6" strokeWidth="1" strokeDasharray="2 2" />
                <text x="38" y={y + 3.5} textAnchor="end" fontSize="9" fill="#999" fontFamily="monospace">
                  {v === 0 ? '0' : v === 0.5 ? '0.5' : '1.0'}
                </text>
              </g>
            );
          })}

          {/* Baseline Curve (slate) */}
          <path
            d="M 65 83 L 135 85 L 205 82 L 275 76 L 345 73 L 415 70"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.7"
            strokeDasharray="4 3"
          />
          {points.map((p, idx) => {
            const x = 65 + idx * 70;
            const y = 140 - p.baseline * 110;
            return (
              <circle key={`base-${idx}`} cx={x} cy={y} r="2.5" fill="#94A3B8" />
            );
          })}

          {/* CAN Model Score Curve (blue) */}
          <path
            d="M 65 68 L 135 56 L 205 61 L 275 48 L 345 51 L 415 43"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.2"
          />
          {points.map((p, idx) => {
            const x = 65 + idx * 70;
            const y = 140 - p.score * 110;
            const isHovered = hoveredIndex === idx;
            return (
              <g key={`score-${idx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {isHovered && (
                  <g>
                    <rect x={x - 22} y={y - 24} width="44" height="18" rx="4" fill="#0F172A" />
                    <text x={x} y={y - 12} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                      {(p.score * 100).toFixed(0)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            const x = 65 + idx * 70;
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y="158"
                textAnchor="middle"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fill="#666"
              >
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
