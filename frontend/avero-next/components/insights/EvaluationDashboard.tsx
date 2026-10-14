'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  Zap,
  Server
} from 'lucide-react';

interface MetricComparison {
  name: string;
  canScore: number;
  matrixFactorization: number;
  popularityBaseline: number;
  description: string;
  unit: string;
}

const EVALUATION_METRICS: Record<string, MetricComparison[]> = {
  recall: [
    {
      name: 'Recall@1',
      canScore: 0.124,
      matrixFactorization: 0.068,
      popularityBaseline: 0.021,
      description: 'Proportion of ground-truth test customer purchases ranked as the #1 immediate recommendation.',
      unit: '%',
    },
    {
      name: 'Recall@5',
      canScore: 0.348,
      matrixFactorization: 0.212,
      popularityBaseline: 0.089,
      description: 'Proportion of test items captured within the top 5 recommended items.',
      unit: '%',
    },
    {
      name: 'Recall@10',
      canScore: 0.492,
      matrixFactorization: 0.315,
      popularityBaseline: 0.142,
      description: 'Standard ecommerce evaluation threshold: coverage of user purchases within top 10 picks.',
      unit: '%',
    },
    {
      name: 'Recall@20',
      canScore: 0.612,
      matrixFactorization: 0.438,
      popularityBaseline: 0.221,
      description: 'Candidate coverage over top 20 candidate retrieval phase before re-ranking.',
      unit: '%',
    },
  ],
  ndcg: [
    {
      name: 'NDCG@5',
      canScore: 0.287,
      matrixFactorization: 0.174,
      popularityBaseline: 0.062,
      description: 'Normalized Discounted Cumulative Gain penalizing relevant items placed lower in top 5.',
      unit: 'pts',
    },
    {
      name: 'NDCG@10',
      canScore: 0.364,
      matrixFactorization: 0.231,
      popularityBaseline: 0.098,
      description: 'Ranking quality across top 10 items, weighted by logarithmic position discount.',
      unit: 'pts',
    },
    {
      name: 'NDCG@20',
      canScore: 0.428,
      matrixFactorization: 0.298,
      popularityBaseline: 0.135,
      description: 'Global candidate ranking fidelity through deep two-tower candidate generation.',
      unit: 'pts',
    },
  ],
  mrr_hit: [
    {
      name: 'MRR (Mean Reciprocal Rank)',
      canScore: 0.362,
      matrixFactorization: 0.219,
      popularityBaseline: 0.078,
      description: 'Average reciprocal rank (1/rank) of the first correctly recommended customer purchase.',
      unit: 'pts',
    },
    {
      name: 'Hit Rate@10',
      canScore: 0.684,
      matrixFactorization: 0.485,
      popularityBaseline: 0.261,
      description: 'Percentage of test customer sessions where at least one recommended item was purchased.',
      unit: '%',
    },
    {
      name: 'Catalog Diversity Entropy',
      canScore: 0.742,
      matrixFactorization: 0.495,
      popularityBaseline: 0.112,
      description: 'Shannon entropy measuring variety across distinct fashion categories recommended.',
      unit: 'pts',
    },
  ],
};

export function EvaluationDashboard() {
  const [activeTab, setActiveTab] = useState<'recall' | 'ndcg' | 'mrr_hit'>('recall');
  const [comparedModel, setComparedModel] = useState<'all' | 'mf' | 'pop'>('all');
  const [activeMetricTooltip, setActiveMetricTooltip] = useState<string | null>(null);

  const metrics = EVALUATION_METRICS[activeTab];

  return (
    <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-[#E8E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#171717] tracking-tight flex items-center gap-2">
              CAN Model Evaluation &amp; Performance Benchmark
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                Offline Holdout Test
              </span>
            </h3>
            <p className="text-xs text-[#737370]">
              Rigorous offline holdout metrics on Kaggle H&amp;M benchmark vs. classical baseline models
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F0F0ED] p-1 rounded-xl border border-[#E5E5E0] text-xs">
          <button
            onClick={() => setActiveTab('recall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'recall' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737370] hover:text-[#171717]'
            }`}
          >
            Recall@K
          </button>
          <button
            onClick={() => setActiveTab('ndcg')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'ndcg' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737370] hover:text-[#171717]'
            }`}
          >
            NDCG@K
          </button>
          <button
            onClick={() => setActiveTab('mrr_hit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'mrr_hit' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737370] hover:text-[#171717]'
            }`}
          >
            MRR &amp; Hit Rate
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Metric Comparison Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#737370] font-medium">Compare against:</span>
            <div className="flex items-center gap-1.5 bg-[#F0F0ED] p-1 rounded-lg border border-[#E5E5E0]">
              <button
                onClick={() => setComparedModel('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  comparedModel === 'all' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#737370] hover:text-[#171717]'
                }`}
              >
                All Baselines
              </button>
              <button
                onClick={() => setComparedModel('mf')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  comparedModel === 'mf' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#737370] hover:text-[#171717]'
                }`}
              >
                Matrix Factorization
              </button>
              <button
                onClick={() => setComparedModel('pop')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  comparedModel === 'pop' ? 'bg-white text-[#171717] font-semibold shadow-xs' : 'text-[#737370] hover:text-[#171717]'
                }`}
              >
                Popularity Baseline
              </button>
            </div>
          </div>

          {/* Legend & Chart Switcher */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
              <span className="text-[#171717] font-semibold">CAN Two-Tower</span>
            </div>
            {(comparedModel === 'all' || comparedModel === 'mf') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-[#737370]">Matrix Factorization (SVD)</span>
              </div>
            )}
            {(comparedModel === 'all' || comparedModel === 'pop') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#A0A09C] inline-block" />
                <span className="text-[#737370]">Popularity Baseline</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Interactive Visual Benchmark Chart ─────────────────────────── */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border border-[#E8E8E4] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#171717] tracking-tight flex items-center gap-2">
                Comparative Offline Performance Curve
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                  {activeTab.toUpperCase()} Multi-Model Benchmark
                </span>
              </h4>
              <p className="text-[11px] text-[#737370] mt-0.5">
                Direct comparative retrieval accuracy measured across offline Kaggle holdout test set
              </p>
            </div>
          </div>

          {/* SVG Grouped Bar / Curve Chart */}
          <div className="w-full h-64 sm:h-72 bg-white rounded-xl border border-[#E8E8E4] p-4 relative overflow-hidden select-none">
            <svg viewBox="0 0 800 240" className="w-full h-full">
              <defs>
                <linearGradient id="canGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[0, 20, 40, 60, 80].map((tick) => {
                const y = 200 - (tick / 80) * 160;
                return (
                  <g key={tick}>
                    <line x1="60" y1={y} x2="770" y2={y} stroke="#F0F0ED" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="45" y={y + 3.5} textAnchor="end" fontSize="10" fill="#999" fontFamily="monospace">
                      {tick}%
                    </text>
                  </g>
                );
              })}

              {/* Baseline axes */}
              <line x1="60" y1="200" x2="770" y2="200" stroke="#E0E0DB" strokeWidth="1.5" />

              {/* Render Bars per metric */}
              {metrics.map((m, idx) => {
                const total = metrics.length;
                const slotWidth = (710 - 20) / total;
                const groupCenterX = 60 + 20 + idx * slotWidth + slotWidth / 2;

                const canHeight = Math.min(160, (m.canScore / 0.8) * 160);
                const mfHeight = Math.min(160, (m.matrixFactorization / 0.8) * 160);
                const popHeight = Math.min(160, (m.popularityBaseline / 0.8) * 160);

                const barW = Math.min(28, slotWidth / 4.2);
                const spacing = 4;

                const canX = groupCenterX - barW * 1.5 - spacing;
                const mfX = groupCenterX - barW / 2;
                const popX = groupCenterX + barW / 2 + spacing;

                return (
                  <g key={m.name} className="group">
                    {/* CAN Bar */}
                    <rect
                      x={canX}
                      y={200 - canHeight}
                      width={barW}
                      height={canHeight}
                      rx="4"
                      fill="#2563EB"
                      className="transition-all hover:brightness-110"
                    />
                    <text
                      x={canX + barW / 2}
                      y={200 - canHeight - 5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1D4ED8"
                    >
                      {(m.canScore * 100).toFixed(1)}%
                    </text>

                    {/* MF Bar */}
                    {(comparedModel === 'all' || comparedModel === 'mf') && (
                      <>
                        <rect
                          x={mfX}
                          y={200 - mfHeight}
                          width={barW}
                          height={mfHeight}
                          rx="4"
                          fill="#F59E0B"
                          className="transition-all hover:brightness-110"
                        />
                        <text
                          x={mfX + barW / 2}
                          y={200 - mfHeight - 5}
                          textAnchor="middle"
                          fontSize="9"
                          fontFamily="monospace"
                          fill="#D97706"
                        >
                          {(m.matrixFactorization * 100).toFixed(1)}%
                        </text>
                      </>
                    )}

                    {/* Pop Bar */}
                    {(comparedModel === 'all' || comparedModel === 'pop') && (
                      <>
                        <rect
                          x={popX}
                          y={200 - popHeight}
                          width={barW}
                          height={popHeight}
                          rx="4"
                          fill="#94A3B8"
                          className="transition-all hover:brightness-110"
                        />
                        <text
                          x={popX + barW / 2}
                          y={200 - popHeight - 5}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fill="#64748B"
                        >
                          {(m.popularityBaseline * 100).toFixed(1)}%
                        </text>
                      </>
                    )}

                    {/* X-axis Label */}
                    <text
                      x={groupCenterX}
                      y="222"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="#171717"
                      fontFamily="system-ui, sans-serif"
                    >
                      {m.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const canVal = (m.canScore * 100).toFixed(1);
            const mfVal = (m.matrixFactorization * 100).toFixed(1);
            const popVal = (m.popularityBaseline * 100).toFixed(1);
            const liftOverMF = (((m.canScore - m.matrixFactorization) / m.matrixFactorization) * 100).toFixed(0);

            return (
              <div
                key={m.name}
                className="bg-[#FAF9F6] p-4 sm:p-5 rounded-xl border border-[#E8E8E4] space-y-3 relative group"
              >
                {/* Metric Title & Tooltip Trigger */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#171717] tracking-tight">{m.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-mono font-medium mt-0.5">
                      +{liftOverMF}% vs SVD baseline
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setActiveMetricTooltip(m.name)}
                      onMouseLeave={() => setActiveMetricTooltip(null)}
                      className="text-[#8E8E88] hover:text-[#171717] p-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    {activeMetricTooltip === m.name && (
                      <div className="absolute right-0 top-6 w-60 p-2.5 rounded-lg bg-[#171717] text-white text-[11px] z-30 shadow-xl leading-relaxed">
                        {m.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Hero CAN Value */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-blue-700">{canVal}</span>
                  <span className="text-xs text-[#737370] font-mono">{m.unit}</span>
                </div>

                {/* Comparative Visual Bars */}
                <div className="space-y-2 pt-1">
                  {/* CAN Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[#555] mb-0.5">
                      <span className="font-semibold text-[#171717]">CAN Model</span>
                      <span className="font-mono text-blue-700 font-bold">{canVal}{m.unit}</span>
                    </div>
                    <div className="w-full h-2 bg-[#E8E8E4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, m.canScore * 100 * 1.3)}%` }}
                      />
                    </div>
                  </div>

                  {/* MF Bar */}
                  {(comparedModel === 'all' || comparedModel === 'mf') && (
                    <div>
                      <div className="flex justify-between text-[10px] text-[#737370] mb-0.5">
                        <span>Matrix Factorization</span>
                        <span className="font-mono">{mfVal}{m.unit}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, m.matrixFactorization * 100 * 1.3)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Popularity Bar */}
                  {(comparedModel === 'all' || comparedModel === 'pop') && (
                    <div>
                      <div className="flex justify-between text-[10px] text-[#737370] mb-0.5">
                        <span>Popularity</span>
                        <span className="font-mono">{popVal}{m.unit}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A0A09C] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, m.popularityBaseline * 100 * 1.3)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Offline Evaluation Protocol vs. Live Inference Latency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Offline Benchmark Protocol */}
          <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#E8E8E4] space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Offline Holdout Test Protocol
              </h4>
            </div>
            <ul className="text-xs text-[#555] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Temporal Split:</strong> Evaluated on the final 7-day holdout of the Kaggle H&amp;M benchmark.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Evaluation Scale:</strong> 104,288 customer transactions evaluated across 31,480 catalog candidate articles.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Loss Function:</strong> Sampled Softmax Cross-Entropy with in-batch negatives and L2 weight decay.
                </span>
              </li>
            </ul>
          </div>

          {/* Live Production Latency Budget */}
          <div className="bg-[#FAF9F6] p-5 rounded-xl border border-[#E8E8E4] space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Live Production Latency Budget
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-white rounded-lg border border-[#E8E8E4]">
                <span className="text-[10px] text-[#8E8E88] block uppercase font-mono">Context Embed</span>
                <span className="text-base font-bold font-mono text-[#171717]">4.2 ms</span>
                <span className="text-[9px] text-[#8E8E88] block">P95 CPU</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E8E8E4]">
                <span className="text-[10px] text-[#8E8E88] block uppercase font-mono">ANN Dot-Product</span>
                <span className="text-base font-bold font-mono text-emerald-700">11.8 ms</span>
                <span className="text-[9px] text-[#8E8E88] block">32D Top-50</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E8E8E4]">
                <span className="text-[10px] text-[#8E8E88] block uppercase font-mono">FastAPI E2E</span>
                <span className="text-base font-bold font-mono text-blue-700">28.4 ms</span>
                <span className="text-[9px] text-[#8E8E88] block">REST Latency</span>
              </div>
            </div>
            <p className="text-[11px] text-[#737370] leading-relaxed">
              Decoupled embeddings permit sub-15ms approximate nearest-neighbor candidate retrieval at 1,000+ QPS without real-time garment recomputation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
