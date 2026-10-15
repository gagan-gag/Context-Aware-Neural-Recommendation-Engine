'use client';

import { Info, X, ZoomIn } from 'lucide-react';
import { useState } from 'react';

type ChartDef = {
  title: string;
  xLabel: string;
  xTicks: string[];
  baseline: string;
  bPoints: [number, number][];
  model: string;
  mPoints: [number, number][];
  yTicks?: string[];
  isBar?: false;
} | {
  title: string;
  xLabel: string;
  xTicks: string[];
  isBar: true;
  bars: { label: string; model: number; baseline: number }[];
  yTicks: string[];
};

const CHARTS: ChartDef[] = [
  {
    title: 'Recall@K', xLabel: 'K', xTicks: ['5', '10', '20', '50'],
    baseline: 'M 40 64 L 70 52 L 105 42 L 140 36', bPoints: [[40,64],[70,52],[105,42],[140,36]],
    model:    'M 40 44 L 70 34 L 105 26 L 140 20', mPoints: [[40,44],[70,34],[105,26],[140,20]],
    yTicks: ['1.0', '0.5', '0.0'],
  },
  {
    title: 'NDCG@K', xLabel: 'K', xTicks: ['5', '10', '20', '50'],
    baseline: 'M 40 68 L 70 58 L 105 48 L 140 44', bPoints: [[40,68],[70,58],[105,48],[140,44]],
    model:    'M 40 52 L 70 40 L 105 30 L 140 24', mPoints: [[40,52],[70,40],[105,30],[140,24]],
    yTicks: ['1.0', '0.5', '0.0'],
  },
  {
    title: 'MRR@K', xLabel: 'K', xTicks: ['5', '10', '20', '50'],
    baseline: 'M 40 66 L 70 60 L 105 54 L 140 50', bPoints: [[40,66],[70,60],[105,54],[140,50]],
    model:    'M 40 56 L 70 46 L 105 38 L 140 34', mPoints: [[40,56],[70,46],[105,38],[140,34]],
    yTicks: ['1.0', '0.5', '0.0'],
  },
  {
    title: 'Hit Rate@K', xLabel: 'K', xTicks: ['5', '10', '20', '50'],
    baseline: 'M 40 62 L 70 50 L 105 42 L 140 38', bPoints: [[40,62],[70,50],[105,42],[140,38]],
    model:    'M 40 46 L 70 34 L 105 26 L 140 20', mPoints: [[40,46],[70,34],[105,26],[140,20]],
    yTicks: ['1.0', '0.5', '0.0'],
  },
  {
    title: 'Retrieval Latency (ms)', xLabel: 'Method', isBar: true,
    xTicks: ['Exact', 'HNSW', 'FAISS'],
    yTicks: ['200', '100', '0'],
    bars: [
      { label: 'Exact', model: 112, baseline: 158 },
      { label: 'HNSW',  model: 54,  baseline: 122 },
      { label: 'FAISS', model: 47,  baseline: 122 },
    ],
  },
  {
    title: 'ANN Recall vs Speed', xLabel: 'Speed (QPS)', xTicks: ['1', '5', '10', '50'],
    baseline: 'M 40 70 L 70 60 L 105 50 L 140 42', bPoints: [[40,70],[70,60],[105,50],[140,42]],
    model:    'M 40 54 L 70 40 L 105 28 L 140 22', mPoints: [[40,54],[70,40],[105,28],[140,22]],
    yTicks: ['1.0', '0.5', '0.0'],
  },
];

// Compact mini chart (72px)
function MiniChart({ chart }: { chart: ChartDef }) {
  if (chart.isBar) {
    const max = 200;
    return (
      <svg viewBox="0 0 160 88" style={{ width: '100%', height: '72px', display: 'block' }}>
        <line x1="24" y1="20" x2="155" y2="20" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="24" y1="46" x2="155" y2="46" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="24" y1="72" x2="155" y2="72" stroke="#CBD5E1" strokeWidth="1" />
        <text x="20" y="23" textAnchor="end" fontSize="7.5" fill="#94A3B8">200</text>
        <text x="20" y="49" textAnchor="end" fontSize="7.5" fill="#94A3B8">100</text>
        <text x="20" y="75" textAnchor="end" fontSize="7.5" fill="#94A3B8">0</text>
        {chart.bars.map((b, i) => {
          const bx = [42, 78, 114][i];
          const mH = Math.round((b.model / max) * 52);
          const bH = Math.round((b.baseline / max) * 52);
          return (
            <g key={b.label}>
              <rect x={bx} y={72 - mH} width="9" height={mH} fill="#2563EB" rx="1.5" />
              <rect x={bx + 11} y={72 - bH} width="9" height={bH} fill="#94A3B8" rx="1.5" />
              <text x={bx + 9} y="84" textAnchor="middle" fontSize="7.5" fill="#64748B">{b.label}</text>
            </g>
          );
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 88" style={{ width: '100%', height: '72px', display: 'block' }}>
      <line x1="24" y1="16" x2="155" y2="16" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="24" y1="44" x2="155" y2="44" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="24" y1="72" x2="155" y2="72" stroke="#CBD5E1" strokeWidth="1" />
      {chart.yTicks?.map((t, i) => (
        <text key={i} x="20" y={[19, 47, 75][i]} textAnchor="end" fontSize="7.5" fill="#94A3B8">{t}</text>
      ))}
      <path d={chart.baseline} fill="none" stroke="#94A3B8" strokeWidth="1.2" />
      {chart.bPoints.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2" fill="#94A3B8" />)}
      <path d={chart.model} fill="none" stroke="#2563EB" strokeWidth="1.6" />
      {chart.mPoints.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.5" fill="#2563EB" />)}
      {[40, 70, 105, 140].map((x, i) => (
        <text key={i} x={x} y="84" textAnchor="middle" fontSize="7.5" fill="#64748B">{chart.xTicks[i]}</text>
      ))}
    </svg>
  );
}

// Expanded full chart (in modal) — interactive hover
function ExpandedChart({ chart }: { chart: ChartDef }) {
  const [hovered, setHovered] = useState<{ x: number; y: number; label: string; model: string; base: string } | null>(null);

  if (chart.isBar) {
    const max = 200;
    const H = 260; const W = 560;
    const padL = 50; const padB = 40; const padT = 20; const padR = 20;
    const chartH = H - padT - padB;
    const chartW = W - padL - padR;
    const groupW = chartW / chart.bars.length;
    return (
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '260px', display: 'block' }}>
          {[0, 50, 100, 150, 200].map((v, i) => {
            const y = padT + chartH - (v / max) * chartH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '4 3'} />
                <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{v}</text>
              </g>
            );
          })}
          {chart.bars.map((b, i) => {
            const cx = padL + i * groupW + groupW / 2;
            const mH = (b.model / max) * chartH;
            const bH = (b.baseline / max) * chartH;
            const mY = padT + chartH - mH;
            const bY = padT + chartH - bH;
            return (
              <g key={b.label}>
                <rect x={cx - 22} y={mY} width="18" height={mH} fill="#2563EB" rx="3"
                  onMouseEnter={() => setHovered({ x: cx, y: mY, label: b.label, model: `${b.model}ms`, base: `${b.baseline}ms` })}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', opacity: 0.92 }}
                />
                <rect x={cx + 4} y={bY} width="18" height={bH} fill="#94A3B8" rx="3"
                  onMouseEnter={() => setHovered({ x: cx, y: bY, label: b.label, model: `${b.model}ms`, base: `${b.baseline}ms` })}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', opacity: 0.85 }}
                />
                <text x={cx} y={padT + chartH + 18} textAnchor="middle" fontSize="12" fill="#475569">{b.label}</text>
              </g>
            );
          })}
        </svg>
        {hovered && (
          <div style={{ position: 'absolute', top: hovered.y - 50, left: hovered.x - 40, background: '#1E293B', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', minWidth: '120px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{hovered.label}</div>
            <div style={{ color: '#93C5FD' }}>Model: {hovered.model}</div>
            <div style={{ color: '#CBD5E1' }}>Baseline: {hovered.base}</div>
          </div>
        )}
      </div>
    );
  }

  // Line chart
  const xVals = [5, 10, 20, 50];
  const mScores = chart.mPoints.map(([, y]) => +(1 - (y - 16) / 56).toFixed(3));
  const bScores = chart.bPoints.map(([, y]) => +(1 - (y - 16) / 56).toFixed(3));
  const H = 260; const W = 560;
  const padL = 50; const padB = 40; const padT = 20; const padR = 20;
  const chartH = H - padT - padB;
  const chartW = W - padL - padR;
  const xPositions = [0, 1, 2, 3].map(i => padL + (i / 3) * chartW);
  const toY = (v: number) => padT + chartH - v * chartH;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '260px', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '4 3'} />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{v.toFixed(2)}</text>
            </g>
          );
        })}

        {/* Baseline line */}
        <path
          d={bScores.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPositions[i]} ${toY(v)}`).join(' ')}
          fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 3"
        />
        {bScores.map((v, i) => (
          <circle key={i} cx={xPositions[i]} cy={toY(v)} r="5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2"
            onMouseEnter={() => setHovered({ x: xPositions[i], y: toY(v), label: `K=${xVals[i]}`, model: mScores[i].toFixed(3), base: bScores[i].toFixed(3) })}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          />
        ))}

        {/* Model line */}
        <path
          d={mScores.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPositions[i]} ${toY(v)}`).join(' ')}
          fill="none" stroke="#2563EB" strokeWidth="2.5"
        />
        {mScores.map((v, i) => (
          <circle key={i} cx={xPositions[i]} cy={toY(v)} r="5.5" fill="#2563EB"
            onMouseEnter={() => setHovered({ x: xPositions[i], y: toY(v), label: `K=${xVals[i]}`, model: mScores[i].toFixed(3), base: bScores[i].toFixed(3) })}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          />
        ))}

        {/* X axis labels */}
        {xVals.map((v, i) => (
          <text key={i} x={xPositions[i]} y={H - 8} textAnchor="middle" fontSize="12" fill="#475569">{v}</text>
        ))}
        <text x={(W - padL - padR) / 2 + padL} y={H - 2} textAnchor="middle" fontSize="11" fill="#94A3B8">{chart.xLabel}</text>
      </svg>
      {hovered && (
        <div style={{ position: 'absolute', top: Math.max(4, hovered.y - 60), left: Math.min(hovered.x + 12, 400), background: '#1E293B', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', minWidth: '140px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{hovered.label}</div>
          <div style={{ color: '#93C5FD' }}>Model: {hovered.model}</div>
          <div style={{ color: '#CBD5E1' }}>Baseline: {hovered.base}</div>
        </div>
      )}
    </div>
  );
}

export function SystemPerformanceCard() {
  const [activeChart, setActiveChart] = useState<ChartDef | null>(null);

  return (
    <>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E5E0', padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', letterSpacing: '-0.01em', margin: 0 }}>System Performance</h3>
            <span style={{ color: '#94A3B8', cursor: 'help', lineHeight: 0 }} title="Click any chart to expand and interact">
              <Info size={14} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              <span style={{ color: '#1E293B' }}>Model</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }} />
              <span style={{ color: '#64748B' }}>Baseline</span>
            </div>
          </div>
        </div>

        {/* 6 clickable mini charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {CHARTS.map((chart) => (
            <div
              key={chart.title}
              onClick={() => setActiveChart(chart)}
              style={{ background: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', transition: 'all 180ms ease', position: 'relative' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 18px rgba(37,99,235,0.12)';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#BFDBFE';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#ECECE8';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#1E293B', margin: 0 }}>{chart.title}</h4>
                <ZoomIn size={10} style={{ color: '#94A3B8', flexShrink: 0 }} />
              </div>
              <div style={{ width: '100%', height: '72px', flexShrink: 0, overflow: 'hidden' }}>
                <MiniChart chart={chart} />
              </div>
              <div style={{ fontSize: '9px', color: '#94A3B8', textAlign: 'center', marginTop: '2px' }}>Click to expand</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {activeChart && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setActiveChart(null)}
        >
          <div
            style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', padding: '28px', width: '100%', maxWidth: '640px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{activeChart.title}</h2>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Hover over data points to inspect values</p>
              </div>
              <button onClick={() => setActiveChart(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ width: '24px', height: '3px', background: '#2563EB', borderRadius: '2px', display: 'inline-block' }} />
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Two-Tower Model</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ width: '24px', height: '3px', background: '#94A3B8', borderRadius: '2px', display: 'inline-block', borderTop: '3px dashed #94A3B8', background: 'none' as any }} />
                <span style={{ fontWeight: 500, color: '#64748B' }}>Popularity Baseline</span>
              </div>
            </div>

            {/* Expanded Interactive Chart */}
            <ExpandedChart chart={activeChart} />

            {/* Footer note */}
            <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '14px' }}>
              Evaluated on Kaggle H&amp;M 105k+ customer test dataset
            </p>
          </div>
        </div>
      )}
    </>
  );
}
