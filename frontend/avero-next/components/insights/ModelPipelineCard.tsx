'use client';

import { useState } from 'react';
import { ChevronRight, Sliders, Layers } from 'lucide-react';

interface ModelPipelineCardProps {
  onWeightsChange?: (weights: { seasonality: number; price: number; mood: number; luxury: number }) => void;
}

export function ModelPipelineCard({ onWeightsChange }: ModelPipelineCardProps) {
  const [seasonality, setSeasonality] = useState(78);
  const [price, setPrice] = useState(65);
  const [summerFall, setSummerFall] = useState(82);
  const [luxury, setLuxury] = useState(60);

  const handleSlider = (type: string, val: number) => {
    let s = seasonality;
    let p = price;
    let sf = summerFall;
    let l = luxury;
    if (type === 'seasonality') { setSeasonality(val); s = val; }
    if (type === 'price') { setPrice(val); p = val; }
    if (type === 'summerFall') { setSummerFall(val); sf = val; }
    if (type === 'luxury') { setLuxury(val); l = val; }
    if (onWeightsChange) {
      onWeightsChange({ seasonality: s, price: p, mood: sf, luxury: l });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. AI Model Context & Performance Architecture Card */}
      <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#171717] tracking-tight">
            AI Model Context &amp; Performance
          </h3>
          <button className="text-[#888] hover:text-[#111] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pipeline Architecture Diagram (SVG Flow matching Image 4) */}
        <div className="w-full h-48 bg-[#FAFAF8] rounded-xl border border-[#ECECE8] p-3 overflow-hidden select-none relative">
          <svg viewBox="0 0 540 180" className="w-full h-full">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
              </marker>
            </defs>

            {/* Connecting Edges */}
            {/* User Features -> Query Tower */}
            <path d="M 115 45 C 145 45, 145 65, 175 65" fill="none" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Item Features -> Candidate Tower */}
            <path d="M 115 135 C 145 135, 145 115, 175 115" fill="none" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Query Tower -> Dot Product Cosine Similarity */}
            <path d="M 285 65 C 315 65, 315 90, 340 90" fill="none" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Candidate Tower -> Dot Product Cosine Similarity */}
            <path d="M 285 115 C 315 115, 315 90, 340 90" fill="none" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow)" />
            {/* Cosine Sim -> Re-Ranking */}
            <path d="M 410 90 L 440 90" fill="none" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Nodes */}
            {/* Node 1: User Demographics */}
            <g transform="translate(10, 25)">
              <rect width="105" height="40" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
              <text x="52" y="18" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#065F46">User Demographics</text>
              <text x="52" y="30" textAnchor="middle" fontSize="7.5" fill="#047857">52D context input</text>
            </g>

            {/* Node 2: Item Features */}
            <g transform="translate(10, 115)">
              <rect width="105" height="40" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
              <text x="52" y="18" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#15803D">Garment Attributes</text>
              <text x="52" y="30" textAnchor="middle" fontSize="7.5" fill="#166534">44D metadata</text>
            </g>

            {/* Node 3: Query Tower (ANN) */}
            <g transform="translate(175, 45)">
              <rect width="110" height="40" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.2" />
              <text x="55" y="18" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#3730A3">Query Tower (ANN)</text>
              <text x="55" y="30" textAnchor="middle" fontSize="7.5" fill="#4338CA">Dense 128→64→32D</text>
            </g>

            {/* Node 4: Candidate Tower */}
            <g transform="translate(175, 95)">
              <rect width="110" height="40" rx="8" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1.2" />
              <text x="55" y="18" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#6B21A8">Candidate Tower (H&amp;M)</text>
              <text x="55" y="30" textAnchor="middle" fontSize="7.5" fill="#7E22CE">Dense 128→64→32D</text>
            </g>

            {/* Node 5: Cosine Similarity */}
            <g transform="translate(340, 70)">
              <rect width="70" height="40" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
              <text x="35" y="18" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E40AF">Cosine Sim</text>
              <text x="35" y="30" textAnchor="middle" fontSize="7.5" fill="#1D4ED8">Dot product</text>
            </g>

            {/* Node 6: Re-Ranked Candidates */}
            <g transform="translate(440, 70)">
              <rect width="90" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
              <text x="45" y="18" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0F172A">Top-K Picks</text>
              <text x="45" y="30" textAnchor="middle" fontSize="7.5" fill="#64748B">Live Ranked</text>
            </g>
          </svg>
        </div>
      </div>

      {/* 2. Live Re-Ranking metrics Card (matching Image 4) */}
      <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#171717] tracking-tight">
            Live Re-Ranking metrics
          </h3>
          <div className="flex items-center gap-1 text-[#888]">
            <Sliders size={15} />
          </div>
        </div>

        {/* Sliders Stack */}
        <div className="space-y-3.5">
          {/* Seasonality: Summer Evening */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[#2E2E2E]">Seasonality: Summer Evening</span>
              <span className="font-mono text-[#666] text-[11px]">{seasonality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={seasonality}
              onChange={(e) => handleSlider('seasonality', Number(e.target.value))}
              className="w-full accent-[#171717] h-1.5 bg-[#EAEAEA] rounded-lg cursor-pointer"
            />
          </div>

          {/* Price: Premium */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[#2E2E2E]">Price: Premium</span>
              <span className="font-mono text-[#666] text-[11px]">{price}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={price}
              onChange={(e) => handleSlider('price', Number(e.target.value))}
              className="w-full accent-[#171717] h-1.5 bg-[#EAEAEA] rounded-lg cursor-pointer"
            />
          </div>

          {/* Seasonality: Summary / Fall */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[#2E2E2E]">Seasonality: Summary</span>
              <span className="font-mono text-[#666] text-[11px]">{summerFall}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={summerFall}
              onChange={(e) => handleSlider('summerFall', Number(e.target.value))}
              className="w-full accent-[#171717] h-1.5 bg-[#EAEAEA] rounded-lg cursor-pointer"
            />
          </div>

          {/* Price: Luxury */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-[#2E2E2E]">Price: Premium</span>
              <span className="font-mono text-[#666] text-[11px]">{luxury}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={luxury}
              onChange={(e) => handleSlider('luxury', Number(e.target.value))}
              className="w-full accent-[#171717] h-1.5 bg-[#EAEAEA] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
