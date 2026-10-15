'use client';

import { useState } from 'react';
import { EmbeddingSpaceExplorer } from '@/components/insights/EmbeddingSpaceExplorer';
import { ModelArchitectureCard } from '@/components/insights/ModelArchitectureCard';
import { DatasetInspectorCard } from '@/components/insights/DatasetInspectorCard';
import { LiveReRankingControls } from '@/components/insights/LiveReRankingControls';
import { SelectedProductCard } from '@/components/insights/SelectedProductCard';
import { SystemPerformanceCard } from '@/components/insights/SystemPerformanceCard';

export default function ModelInsightsPage() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>('0865857002');

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', padding: '32px 0' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', margin: 0 }}>
            AI Insights
          </h1>
          <p style={{ fontSize: '13px', color: '#666666', marginTop: '6px' }}>
            Explore how our Two-Tower recommendation model understands fashion items and users.
          </p>
        </div>

        {/* Main grid: left (latent space + dataset) | right (arch + controls + selected) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <EmbeddingSpaceExplorer
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              height={440}
            />
            <DatasetInspectorCard
              onInspectPoint={setSelectedPointId}
              selectedId={selectedPointId}
            />
          </div>

          {/* Right column — fixed 360px */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '360px', flexShrink: 0 }}>
            <ModelArchitectureCard />
            <LiveReRankingControls />
            <SelectedProductCard
              productId={selectedPointId}
              onSelectNeighbor={setSelectedPointId}
            />
          </div>
        </div>

        {/* Bottom row: System Performance full-width */}
        <SystemPerformanceCard />

      </div>
    </div>
  );
}
