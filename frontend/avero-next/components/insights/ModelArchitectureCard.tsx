'use client';

import { Info } from 'lucide-react';

export function ModelArchitectureCard() {
  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E5E5E0', padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#171717', letterSpacing: '-0.01em', margin: 0 }}>
          Model Architecture &amp; Context
        </h3>
        <span style={{ color: '#94A3B8', cursor: 'help', lineHeight: 0 }} title="Two-Tower Deep Neural Network with Contextual Feature Modulations">
          <Info size={14} />
        </span>
      </div>

      {/* SVG Diagram — fixed height 220px, overflow hidden */}
      <div style={{ width: '100%', height: '220px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #ECECE8', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 540 220" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
            </marker>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B82F6" />
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8B5CF6" />
            </marker>
          </defs>

          {/* Connectors: Input features → Towers */}
          <path d="M 138 42 C 160 42, 160 52, 185 52" fill="none" stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
          <path d="M 138 102 C 160 102, 162 68, 185 68" fill="none" stroke="#93C5FD" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
          <path d="M 138 114 C 160 114, 162 148, 185 148" fill="none" stroke="#C4B5FD" strokeWidth="1.5" markerEnd="url(#arrow-purple)" />
          <path d="M 138 168 C 160 168, 160 158, 185 158" fill="none" stroke="#C4B5FD" strokeWidth="1.5" markerEnd="url(#arrow-purple)" />

          {/* Connectors: Towers → Cosine */}
          <path d="M 295 60 C 310 60, 310 102, 324 102" fill="none" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <path d="M 295 150 C 310 150, 310 116, 324 116" fill="none" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrow)" />

          {/* Cosine → Top-K */}
          <path d="M 380 109 L 405 109" fill="none" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrow)" />

          {/* Input Feature Boxes */}
          <g transform="translate(8, 18)">
            <rect width="130" height="44" rx="7" fill="#F0FDF9" stroke="#99F6E4" strokeWidth="1" />
            <circle cx="18" cy="22" r="10" fill="#CCFBF1" />
            <text x="18" y="26" textAnchor="middle" fontSize="10.5" fill="#0F766E">👤</text>
            <text x="35" y="17" fontSize="9.5" fontWeight="600" fill="#0F766E">User Demographics</text>
            <text x="35" y="31" fontSize="8" fill="#14B8A6">Age, Gender, Location</text>
          </g>

          <g transform="translate(8, 84)">
            <rect width="130" height="44" rx="7" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
            <circle cx="18" cy="22" r="10" fill="#DCFCE7" />
            <text x="18" y="26" textAnchor="middle" fontSize="10.5" fill="#15803D">🛍</text>
            <text x="35" y="17" fontSize="9.5" fontWeight="600" fill="#166534">User Behavior</text>
            <text x="35" y="31" fontSize="8" fill="#16A34A">Purchase History, Browsing</text>
          </g>

          <g transform="translate(8, 148)">
            <rect width="130" height="44" rx="7" fill="#F0FDF9" stroke="#99F6E4" strokeWidth="1" />
            <circle cx="18" cy="22" r="10" fill="#CCFBF1" />
            <text x="18" y="26" textAnchor="middle" fontSize="10.5" fill="#0F766E">⏱</text>
            <text x="35" y="17" fontSize="9.5" fontWeight="600" fill="#0F766E">Context Features</text>
            <text x="35" y="31" fontSize="8" fill="#14B8A6">Season, Price, Occasion</text>
          </g>

          {/* Tower Boxes */}
          <g transform="translate(185, 28)">
            <rect width="110" height="58" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.2" />
            <text x="55" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1D4ED8">Query Tower</text>
            <text x="55" y="30" textAnchor="middle" fontSize="8" fill="#3B82F6">(Dense 128→64→32)</text>
            <text x="55" y="46" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#1E40AF">User Embedding</text>
          </g>

          <g transform="translate(185, 120)">
            <rect width="110" height="58" rx="8" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1.2" />
            <text x="55" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7E22CE">Candidate Tower</text>
            <text x="55" y="30" textAnchor="middle" fontSize="8" fill="#8B5CF6">(Dense 128→64→32)</text>
            <text x="55" y="46" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#6B21A8">Item Embedding</text>
          </g>

          {/* Cosine Similarity */}
          <g transform="translate(324, 86)">
            <rect width="56" height="42" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <text x="28" y="17" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#1E293B">Cosine</text>
            <text x="28" y="30" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#1E293B">Similarity</text>
          </g>

          {/* Top-K Results */}
          <g transform="translate(405, 18)">
            <rect width="128" height="184" rx="8" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.2" />
            <text x="64" y="17" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0369A1">Top-K</text>
            <text x="64" y="29" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0369A1">Recommendations</text>
            <g transform="translate(8, 40)">
              <rect width="34" height="54" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
              <image href="/catalog/0865857002.jpg" x="2" y="2" width="30" height="50" preserveAspectRatio="xMidYMid meet" />
            </g>
            <g transform="translate(47, 40)">
              <rect width="34" height="54" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
              <image href="/catalog/0852521001.jpg" x="2" y="2" width="30" height="50" preserveAspectRatio="xMidYMid meet" />
            </g>
            <g transform="translate(86, 40)">
              <rect width="34" height="54" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
              <image href="/catalog/0834478002.jpg" x="2" y="2" width="30" height="50" preserveAspectRatio="xMidYMid meet" />
            </g>
            <text x="64" y="140" textAnchor="middle" fontSize="7.5" fill="#0284C7" fontWeight="600">Ranked &amp; Re-ranked</text>
            <text x="64" y="154" textAnchor="middle" fontSize="7.5" fill="#0284C7" fontWeight="600">Personalized Results</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
