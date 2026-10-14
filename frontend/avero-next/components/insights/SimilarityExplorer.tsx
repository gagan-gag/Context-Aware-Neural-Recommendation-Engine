'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Sliders, 
  Sparkles, 
  BarChart3, 
  Layers, 
  Sun, 
  Moon, 
  Compass, 
  ArrowUpDown, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';

interface ContextWeights {
  preferredCategory: string;
  seasonContext: 'summer_evening' | 'autumn_winter' | 'festive_spring';
  styleMood: 'minimalist' | 'chic_glam' | 'casual_urban' | 'formal';
  budgetPreference: number;
  noveltyWeight: number;
}

const CATEGORY_BIAS: Record<string, Record<string, number>> = {
  Dresses: { Dresses: 0.96, Knitwear: 0.42, Outerwear: 0.35, Tops: 0.65, Trousers: 0.45, Footwear: 0.82, Accessories: 0.88 },
  Knitwear: { Knitwear: 0.95, Outerwear: 0.78, Trousers: 0.68, Tops: 0.62, Dresses: 0.38, Footwear: 0.45, Accessories: 0.55 },
  Outerwear: { Outerwear: 0.96, Knitwear: 0.72, Trousers: 0.65, Dresses: 0.35, Tops: 0.55, Footwear: 0.62, Accessories: 0.75 },
  Tops: { Tops: 0.95, Trousers: 0.82, Dresses: 0.52, Knitwear: 0.58, Outerwear: 0.45, Footwear: 0.55, Accessories: 0.6 },
  Trousers: { Trousers: 0.95, Tops: 0.78, Footwear: 0.75, Outerwear: 0.58, Knitwear: 0.52, Dresses: 0.32, Accessories: 0.5 },
  Footwear: { Footwear: 0.95, Dresses: 0.78, Trousers: 0.75, Tops: 0.6, Outerwear: 0.65, Knitwear: 0.45, Accessories: 0.7 },
  All: { Dresses: 0.75, Knitwear: 0.75, Outerwear: 0.75, Tops: 0.75, Trousers: 0.75, Footwear: 0.75, Accessories: 0.75 },
};

export function SimilarityExplorer() {
  const [preferredCategory, setPreferredCategory] = useState<string>('Dresses');
  const [seasonContext, setSeasonContext] = useState<ContextWeights['seasonContext']>('summer_evening');
  const [styleMood, setStyleMood] = useState<ContextWeights['styleMood']>('chic_glam');
  const [budgetPreference, setBudgetPreference] = useState<number>(4500);
  const [noveltyWeight, setNoveltyWeight] = useState<number>(20);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('0751471001');

  // Compute live contextual cosine similarity score for all candidate products
  const scoredProducts = useMemo(() => {
    return MOCK_PRODUCTS.map((prod) => {
      const cat = prod.category || 'Accessories';
      
      // 1. Category affinity match
      const catMap = CATEGORY_BIAS[preferredCategory] || CATEGORY_BIAS['All'];
      const catAffinity = catMap[cat] ?? 0.5;

      // 2. Seasonal alignment
      let seasonalScore = 0.5;
      if (seasonContext === 'summer_evening') {
        if (cat === 'Dresses' || cat === 'Tops' || cat === 'Footwear') seasonalScore = 0.92;
        else if (cat === 'Knitwear' || cat === 'Outerwear') seasonalScore = 0.3;
      } else if (seasonContext === 'autumn_winter') {
        if (cat === 'Knitwear' || cat === 'Outerwear' || cat === 'Trousers') seasonalScore = 0.94;
        else if (cat === 'Dresses') seasonalScore = 0.35;
      } else {
        // festive_spring
        if (cat === 'Dresses' || cat === 'Tops' || cat === 'Accessories') seasonalScore = 0.88;
      }

      // 3. Style mood factor
      let moodScore = 0.5;
      const lowerName = (prod.product_name + ' ' + (prod.reason || '')).toLowerCase();
      if (styleMood === 'chic_glam' && (lowerName.includes('dress') || lowerName.includes('chiffon') || lowerName.includes('satin') || lowerName.includes('tote') || lowerName.includes('heel'))) {
        moodScore = 0.92;
      } else if (styleMood === 'minimalist' && (lowerName.includes('rib') || lowerName.includes('shirt') || lowerName.includes('knit') || lowerName.includes('trousers') || lowerName.includes('blazer'))) {
        moodScore = 0.90;
      } else if (styleMood === 'casual_urban' && (lowerName.includes('hoodie') || lowerName.includes('denim') || lowerName.includes('sneaker') || lowerName.includes('bomber') || lowerName.includes('jeans'))) {
        moodScore = 0.93;
      } else if (styleMood === 'formal' && (lowerName.includes('blazer') || lowerName.includes('oxford') || lowerName.includes('wool') || lowerName.includes('coat') || lowerName.includes('chelsea'))) {
        moodScore = 0.94;
      }

      // 4. Budget compliance factor
      const price = prod.price_inr || 2999;
      const priceDiff = Math.abs(price - budgetPreference);
      const budgetFactor = Math.max(0.35, 1 - priceDiff / 5500);

      // 5. Controlled novelty perturbation
      const noveltyJitter = ((Number(prod.product_id) % 100) / 100) * (noveltyWeight / 100);

      // Final contextual weighted cosine similarity
      const rawScore = 
        catAffinity * 0.35 +
        seasonalScore * 0.25 +
        moodScore * 0.2 +
        budgetFactor * 0.15 +
        noveltyJitter * 0.05;

      const finalScore = Math.max(0.1, Math.min(0.99, Number(rawScore.toFixed(3))));

      return {
        ...prod,
        computedScore: finalScore,
        breakdown: {
          categoryAffinity: Number((catAffinity * 100).toFixed(0)),
          seasonalFit: Number((seasonalScore * 100).toFixed(0)),
          moodAlignment: Number((moodScore * 100).toFixed(0)),
          budgetCompliance: Number((budgetFactor * 100).toFixed(0)),
        },
      };
    }).sort((a, b) => b.computedScore - a.computedScore);
  }, [preferredCategory, seasonContext, styleMood, budgetPreference, noveltyWeight]);

  // Selected candidate object
  const selectedCandidate = useMemo(() => {
    return scoredProducts.find((p) => p.product_id === selectedCandidateId) || scoredProducts[0];
  }, [scoredProducts, selectedCandidateId]);

  // Category distribution aggregation
  const categoryDistribution = useMemo(() => {
    const dist: Record<string, { count: number; totalScore: number }> = {};
    scoredProducts.forEach((p) => {
      const cat = p.category || 'Other';
      if (!dist[cat]) {
        dist[cat] = { count: 0, totalScore: 0 };
      }
      dist[cat].count += 1;
      dist[cat].totalScore += p.computedScore;
    });

    return Object.entries(dist).map(([category, val]) => ({
      category,
      count: val.count,
      avgScore: Number((val.totalScore / val.count).toFixed(2)),
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [scoredProducts]);

  return (
    <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-[#E8E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#171717] tracking-tight flex items-center gap-2">
              Context-Aware Neural Similarity Explorer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-semibold">
                Live Cosine Re-Ranking
              </span>
            </h3>
            <p className="text-xs text-[#737370]">
              Simulate how dynamic real-time context cues reshape candidate vectors across the Two-Tower catalog
            </p>
          </div>
        </div>

        <div className="text-xs text-[#555] font-mono flex items-center gap-2 bg-[#F0F0ED] px-3 py-1.5 rounded-lg border border-[#E5E5E0]">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Active Context: <strong>34D Temporal + 52D Demographic</strong></span>
        </div>
      </div>

      {/* Main Grid: Controls (4 cols) vs Results (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E8E4]">
        {/* Left Column: Context Sliders & Controllers */}
        <div className="lg:col-span-4 p-5 sm:p-6 space-y-6 bg-[#FAF9F6]">
          <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            1. Configure Context Signals
          </h4>

          {/* 1. Category Affinity */}
          <div>
            <label className="text-xs font-semibold text-[#171717] block mb-2">
              Historical Category Affinity
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Dresses', 'Knitwear', 'Outerwear', 'Tops', 'Trousers', 'Footwear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPreferredCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    preferredCategory === cat
                      ? 'bg-[#171717] text-white shadow-xs font-semibold'
                      : 'bg-white text-[#555] hover:text-[#111] border border-[#DCDCD6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Season Context */}
          <div>
            <label className="text-xs font-semibold text-[#171717] block mb-2 flex items-center justify-between">
              <span>Temporal / Season Factor</span>
              <span className="text-[10px] text-[#8E8E88] font-mono">Sine/Cosine Embed</span>
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'summer_evening', label: 'Summer Evening / Golden Hour', icon: Sun },
                { id: 'autumn_winter', label: 'Autumn / Winter Layering', icon: Moon },
                { id: 'festive_spring', label: 'Spring / Festive Occasion', icon: Sparkles },
              ].map((s) => {
                const Icon = s.icon;
                const isSelected = seasonContext === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeasonContext(s.id as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left font-medium transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-white text-[#171717] border-emerald-600 shadow-xs'
                        : 'bg-white/60 text-[#555] hover:text-[#111] border-[#E0E0DB]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-[#8E8E88]'}`} />
                      <span>{s.label}</span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Style Mood */}
          <div>
            <label className="text-xs font-semibold text-[#171717] block mb-2">
              Style Mood Vector
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'chic_glam', label: 'Chic & Glam' },
                { id: 'minimalist', label: 'Quiet Luxury' },
                { id: 'casual_urban', label: 'Urban Casual' },
                { id: 'formal', label: 'Tailored Formal' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStyleMood(m.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs text-center font-medium transition-all ${
                    styleMood === m.id
                      ? 'bg-white text-[#171717] border border-emerald-600 font-semibold shadow-xs'
                      : 'bg-white text-[#555] hover:text-[#111] border border-[#DCDCD6]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Budget Preference Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#171717]">Price Sweet-Spot</span>
              <span className="font-mono text-emerald-700 font-bold">₹{budgetPreference.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="250"
              value={budgetPreference}
              onChange={(e) => setBudgetPreference(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-[#E0E0DB] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E8E88] mt-1 font-mono">
              <span>₹1,000 (Value)</span>
              <span>₹3,500</span>
              <span>₹6,000+ (Premium)</span>
            </div>
          </div>

          {/* 5. Novelty Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#171717]">Exploration vs Exploitation</span>
              <span className="font-mono text-[#737370]">{noveltyWeight}% novelty</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={noveltyWeight}
              onChange={(e) => setNoveltyWeight(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-[#E0E0DB] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E8E88] mt-1">
              <span>Pure Exploitation</span>
              <span>Serendipitous Discovery</span>
            </div>
          </div>

          {/* Category Score Distribution */}
          <div className="pt-3 border-t border-[#E8E8E4]">
            <h5 className="text-[10px] font-bold text-[#8E8E88] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Category Score Spread</span>
              <BarChart3 className="w-3.5 h-3.5 text-[#8E8E88]" />
            </h5>
            <div className="space-y-1.5">
              {categoryDistribution.slice(0, 5).map((cd) => (
                <div key={cd.category} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#444] font-medium">{cd.category}</span>
                    <span className="font-mono text-[#737370]">{(cd.avgScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, cd.avgScore * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Candidates + Match Inspector */}
        <div className="lg:col-span-8 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
              Live Candidate Ranking (Top 8 of {scoredProducts.length})
            </h4>
            <span className="text-xs text-[#737370]">
              Ordered by Two-Tower Cosine Similarity
            </span>
          </div>

          {/* Candidate Cards Grid with isolated 3:4 product images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {scoredProducts.slice(0, 8).map((prod, idx) => {
              const isSelected = prod.product_id === selectedCandidate?.product_id;
              return (
                <div
                  key={prod.product_id}
                  onClick={() => setSelectedCandidateId(prod.product_id)}
                  className={`group rounded-xl border p-2.5 cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'bg-white border-[#E8E8E4] hover:border-[#CCCCCC] hover:shadow-xs'
                  }`}
                >
                  {/* Rank badge */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs ${
                        idx === 0
                          ? 'bg-[#171717] text-white'
                          : idx === 1
                          ? 'bg-[#555] text-white'
                          : idx === 2
                          ? 'bg-[#777] text-white'
                          : 'bg-white/90 text-[#333] border border-[#DDD]'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    {/* 3:4 isolated product container */}
                    <div
                      className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F5F3] mb-2 border border-[#E8E8E4]"
                      style={{ position: 'relative' }}
                    >
                      <Image
                        src={prod.image_url || '/placeholder-garment.svg'}
                        alt={prod.product_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>

                    <h5 className="text-xs font-bold text-[#171717] truncate leading-tight">
                      {prod.product_name}
                    </h5>
                    <p className="text-[11px] text-[#737370] font-mono mt-0.5">
                      {prod.price_inr_formatted}
                    </p>
                  </div>

                  {/* Score pill */}
                  <div className="mt-2.5 pt-2 border-t border-[#E8E8E4]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#8E8E88] text-[10px]">CAN Score</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {(prod.computedScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${prod.computedScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Feature Match Inspector for Selected Candidate */}
          {selectedCandidate && (
            <div className="p-5 bg-[#FAF9F6] rounded-xl border border-[#E8E8E4] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E8E4] pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="relative w-10 h-14 rounded-md overflow-hidden bg-[#ECECE8] flex-shrink-0"
                    style={{ position: 'relative' }}
                  >
                    <Image
                      src={selectedCandidate.image_url || '/placeholder-garment.svg'}
                      alt={selectedCandidate.product_name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#171717]">
                      {selectedCandidate.product_name} ({selectedCandidate.category})
                    </h5>
                    <p className="text-[11px] text-[#737370] font-mono">
                      Article ID: {selectedCandidate.article_id} • {selectedCandidate.department}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Cosine Match: {(selectedCandidate.computedScore * 100).toFixed(1)}%
                </span>
              </div>

              {/* 4 Feature Alignment Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Category Affinity */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8E4]">
                  <div className="flex justify-between text-[#737370] mb-1">
                    <span>Category Affinity:</span>
                    <span className="font-mono font-bold text-[#171717]">
                      {selectedCandidate.breakdown.categoryAffinity}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${selectedCandidate.breakdown.categoryAffinity}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8E8E88] block mt-1 truncate">
                    Target: {preferredCategory}
                  </span>
                </div>

                {/* Seasonal Fit */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8E4]">
                  <div className="flex justify-between text-[#737370] mb-1">
                    <span>Seasonal Fit:</span>
                    <span className="font-mono font-bold text-[#171717]">
                      {selectedCandidate.breakdown.seasonalFit}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${selectedCandidate.breakdown.seasonalFit}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8E8E88] block mt-1 capitalize truncate">
                    {seasonContext.replace('_', ' ')}
                  </span>
                </div>

                {/* Mood Alignment */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8E4]">
                  <div className="flex justify-between text-[#737370] mb-1">
                    <span>Style Mood Fit:</span>
                    <span className="font-mono font-bold text-[#171717]">
                      {selectedCandidate.breakdown.moodAlignment}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${selectedCandidate.breakdown.moodAlignment}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8E8E88] block mt-1 capitalize truncate">
                    {styleMood.replace('_', ' ')}
                  </span>
                </div>

                {/* Budget Compliance */}
                <div className="p-3 rounded-lg bg-white border border-[#E8E8E4]">
                  <div className="flex justify-between text-[#737370] mb-1">
                    <span>Price Match:</span>
                    <span className="font-mono font-bold text-[#171717]">
                      {selectedCandidate.breakdown.budgetCompliance}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${selectedCandidate.breakdown.budgetCompliance}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8E8E88] block mt-1 truncate">
                    {selectedCandidate.price_inr_formatted}
                  </span>
                </div>
              </div>

              {/* Rationale text */}
              <div className="text-[11.5px] text-[#555] bg-white p-3 rounded-xl border border-[#E8E8E4] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Neural Recommendation Rationale:</strong> {selectedCandidate.reason || 'Candidate displays strong geometric proximity to current active query vector in the 32D latent tower manifold.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
