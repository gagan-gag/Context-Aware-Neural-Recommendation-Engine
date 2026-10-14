'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EmbeddingSpaceExplorer } from '@/components/insights/EmbeddingSpaceExplorer';
import { ModelPipelineCard } from '@/components/insights/ModelPipelineCard';
import { DatasetInspectorCard } from '@/components/insights/DatasetInspectorCard';
import { SystemPerformanceCard } from '@/components/insights/SystemPerformanceCard';

export default function ModelInsightsPage() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>('0865857002'); // Satin Midi Dress

  const handleInspectPoint = (id: string) => {
    setSelectedPointId(id);
    const latentCard = document.getElementById('latent-space-card');
    if (latentCard) {
      latentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── Top Row: H&M Two-Tower Latent Space (Left) + Model Context & Sliders (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Latent Space Point Cloud */}
          <div id="latent-space-card" className="lg:col-span-8">
            <EmbeddingSpaceExplorer
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              height={520}
            />
          </div>

          {/* Right Column: AI Model Context Flow + Live Re-Ranking Sliders */}
          <div className="lg:col-span-4">
            <ModelPipelineCard />
          </div>
        </div>

        {/* ── Bottom Row: Dataset Inspector Table (Left) + System Performance (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Dataset Inspector */}
          <div className="lg:col-span-8">
            <DatasetInspectorCard
              onInspectPoint={handleInspectPoint}
              selectedId={selectedPointId}
            />
          </div>

          {/* Right Column: System Performance Dual-Curve Chart */}
          <div className="lg:col-span-4">
            <SystemPerformanceCard />
          </div>
        </div>

      </div>
    </div>
  );
}
