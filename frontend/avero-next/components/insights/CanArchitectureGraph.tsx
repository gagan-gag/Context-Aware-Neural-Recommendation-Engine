'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  X, 
  Layers, 
  Cpu, 
  Database, 
  Network, 
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  category: 'input' | 'tower' | 'latent' | 'retrieval' | 'output' | 'catalog';
  x: number;
  y: number;
  z: number;
  dim: string;
  details: {
    description: string;
    tensorShape: string;
    parameters: string;
    activation?: string;
    sourceFile: string;
    attributes?: string[];
  };
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  speed?: number;
}

// Generously spaced node coordinates across a 1200x720 plane to ensure zero label collision
const ARCHITECTURE_NODES: GraphNode[] = [
  // ── Input Layer (Left, X: 110) ──
  {
    id: 'user_features',
    label: 'User Demographics',
    sublabel: 'Customer Identity Vector',
    category: 'input',
    x: 110,
    y: 160,
    z: 20,
    dim: '52D Float',
    details: {
      description: 'Customer age quartile, club membership status, postal zone hash, and historical category affinities from H&M transactions.',
      tensorShape: '(batch_size, 52)',
      parameters: 'Continuous normalized floats + categorical entity embeddings',
      sourceFile: 'ml/features/user_features.py',
      attributes: ['Age (bucketed)', 'Club member status', 'Fashion news frequency', 'Purchase cadence', 'Historical category affinities'],
    },
  },
  {
    id: 'context_features_query',
    label: 'Query Context',
    sublabel: 'Temporal & Session Signals',
    category: 'input',
    x: 110,
    y: 310,
    z: -10,
    dim: '34D Float',
    details: {
      description: 'Real-time seasonal factors, month/day cyclic harmonics, device channel, and session recency signals.',
      tensorShape: '(batch_size, 34)',
      parameters: 'Cyclically encoded temporal sine/cosine harmonics',
      sourceFile: 'ml/features/context_features.py',
      attributes: ['Month & Day-of-Week', 'Seasonality indicator', 'Sales channel (Online/Store)', 'Recency interval'],
    },
  },
  {
    id: 'item_features',
    label: 'Garment Attributes',
    sublabel: 'H&M Apparel Metadata',
    category: 'input',
    x: 110,
    y: 470,
    z: 15,
    dim: '44D Float',
    details: {
      description: 'Metadata extracted from articles.csv: product type, garment group, perceived color, department, and price tier.',
      tensorShape: '(num_candidates, 44)',
      parameters: 'One-hot categoricals + log-transformed price scalar',
      sourceFile: 'ml/features/item_features.py',
      attributes: ['Garment Group', 'Department Code', 'Perceived Colour Code', 'Index Group', 'Price Quartile'],
    },
  },
  {
    id: 'context_features_item',
    label: 'Candidate Context',
    sublabel: 'Seasonal Compatibility',
    category: 'input',
    x: 110,
    y: 610,
    z: -25,
    dim: '34D Float',
    details: {
      description: 'Candidate contextual compatibility signals matching active season and channel inventory availability.',
      tensorShape: '(num_candidates, 34)',
      parameters: 'Broadcasted context matching matrix',
      sourceFile: 'ml/features/context_features.py',
      attributes: ['Seasonal compatibility', 'Online inventory flag', 'Promotion window'],
    },
  },

  // ── Neural Towers (Center-Left, X: 370) ──
  {
    id: 'query_tower',
    label: 'Query Tower (DNN)',
    sublabel: 'Dense 128 → 64 → 32',
    category: 'tower',
    x: 370,
    y: 235,
    z: 10,
    dim: '86D → 32D',
    details: {
      description: 'Deep neural network with BatchNormalization and LayerNormalization projecting user state into the latent space.',
      tensorShape: 'Dense(128) → BN → Dropout(0.2) → Dense(64) → Dense(32) → L2Norm',
      parameters: '128*86 + 64*128 + 32*64 = 21,344 trainable weights',
      activation: 'ReLU (hidden) + L2-Normalized unit hypersphere projection',
      sourceFile: 'ml/models/two_tower.py',
      attributes: ['BatchNormalization(epsilon=1e-5)', 'Dropout(rate=0.2)', 'L2 Normalization (norm=1.0)'],
    },
  },
  {
    id: 'candidate_tower',
    label: 'Candidate Tower (DNN)',
    sublabel: 'Dense 128 → 64 → 32',
    category: 'tower',
    x: 370,
    y: 540,
    z: -10,
    dim: '78D → 32D',
    details: {
      description: 'Candidate neural tower projecting product catalog items into the same 32D hypersphere as the query tower.',
      tensorShape: 'Dense(128) → BN → Dropout(0.2) → Dense(64) → Dense(32) → L2Norm',
      parameters: '128*78 + 64*128 + 32*64 = 20,320 trainable weights',
      activation: 'ReLU (hidden) + L2-Normalized unit hypersphere projection',
      sourceFile: 'ml/models/two_tower.py',
      attributes: ['BatchNormalization(epsilon=1e-5)', 'Dropout(rate=0.2)', 'L2 Normalization (norm=1.0)'],
    },
  },

  // ── Latent Dot-Product (Center, X: 640) ──
  {
    id: 'dot_product',
    label: 'Cosine Similarity',
    sublabel: 's(u, v) = ⟨q, c⟩',
    category: 'latent',
    x: 640,
    y: 385,
    z: 30,
    dim: '32D Hypersphere',
    details: {
      description: 'Inner dot-product between normalized query vector and candidate item vectors on unit hypersphere S^31.',
      tensorShape: 'DotProduct(q, c) = sum(q_k * c_k) for k in [1..32]',
      parameters: '0 parameters; exact geometric cosine dot-product',
      activation: 'Inner product in [-1.0, 1.0] range',
      sourceFile: 'ml/models/two_tower.py',
      attributes: ['L2-Normalized embeddings', 'Sub-millisecond matrix multiplication', 'Temperature scaling (tau=0.07)'],
    },
  },

  // ── Retrieval & Catalog (Center-Right, X: 890) ──
  {
    id: 'candidate_retrieval',
    label: 'Top-K Retrieval',
    sublabel: 'Softmax Logit Scoring',
    category: 'retrieval',
    x: 890,
    y: 310,
    z: 15,
    dim: 'Top-50 Index',
    details: {
      description: 'Ranks candidates by cosine similarity dot products using soft-max logit ranking and in-batch negative filtering.',
      tensorShape: '(batch_size, top_k)',
      parameters: 'Sampled softmax cross-entropy loss with in-batch negatives',
      activation: 'ArgSort / Maximum heap candidate extraction',
      sourceFile: 'ml/serving/model_server.py',
      attributes: ['Top-50 candidate pool', 'Negative sampling ratio 5:1', 'Inference latency < 15ms'],
    },
  },
  {
    id: 'catalog_store',
    label: 'H&M Product Catalog',
    sublabel: 'Verified Dataset & Custom',
    category: 'catalog',
    x: 890,
    y: 540,
    z: -20,
    dim: 'Indexed Articles',
    details: {
      description: 'Fast candidate repository storing precomputed 32D garment embeddings, price data, and stock availability.',
      tensorShape: 'KV Store (article_id -> vector_32d)',
      parameters: '24 catalog candidates + custom product pool',
      sourceFile: 'backend/app/services/demo_catalog.py',
      attributes: ['Verified H&M article IDs', 'Department metadata', 'Custom product injection'],
    },
  },

  // ── Final Output (Right, X: 1120) ──
  {
    id: 'ranked_recommendations',
    label: 'Ranked Recommendations',
    sublabel: 'Personalized Fashion Feed',
    category: 'output',
    x: 1120,
    y: 385,
    z: 25,
    dim: 'Top 6–20 Styles',
    details: {
      description: 'Filtered, deduplicated list of fashion garments with neural match confidence scores and styling rationales.',
      tensorShape: 'list[Recommendation]',
      parameters: 'Sub-50ms end-to-end response delivery',
      activation: 'Cosine score ranking with diversity regularization',
      sourceFile: 'backend/app/api/routes.py',
      attributes: ['Confidence score %', 'Category diversity check', 'Styling rationale synthesis'],
    },
  },
];

const ARCHITECTURE_EDGES: GraphEdge[] = [
  { from: 'user_features', to: 'query_tower', label: '52D' },
  { from: 'context_features_query', to: 'query_tower', label: '34D' },
  { from: 'item_features', to: 'candidate_tower', label: '44D' },
  { from: 'context_features_item', to: 'candidate_tower', label: '34D' },
  { from: 'query_tower', to: 'dot_product', label: '32D q(u,c)' },
  { from: 'candidate_tower', to: 'dot_product', label: '32D v(i,c)' },
  { from: 'dot_product', to: 'candidate_retrieval', label: 'Cosine Score' },
  { from: 'catalog_store', to: 'candidate_retrieval', label: 'Article Pool' },
  { from: 'candidate_retrieval', to: 'ranked_recommendations', label: 'Top-K Picks' },
];

const CATEGORY_STYLES: Record<GraphNode['category'], { border: string; bg: string; text: string; badge: string; glow: string }> = {
  input: {
    border: '#0D9488',
    bg: '#F0FDFA',
    text: '#0F766E',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    glow: 'rgba(13, 148, 136, 0.25)',
  },
  tower: {
    border: '#4F46E5',
    bg: '#EEF2FF',
    text: '#4338CA',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    glow: 'rgba(79, 70, 229, 0.25)',
  },
  latent: {
    border: '#9333EA',
    bg: '#FAF5FF',
    text: '#7E22CE',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    glow: 'rgba(147, 51, 234, 0.25)',
  },
  retrieval: {
    border: '#2563EB',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    glow: 'rgba(37, 99, 235, 0.25)',
  },
  catalog: {
    border: '#D97706',
    bg: '#FFFBEB',
    text: '#B45309',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    glow: 'rgba(217, 119, 6, 0.25)',
  },
  output: {
    border: '#059669',
    bg: '#ECFDF5',
    text: '#047857',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    glow: 'rgba(5, 150, 105, 0.25)',
  },
};

export function CanArchitectureGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>(ARCHITECTURE_NODES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(ARCHITECTURE_NODES[2]); // default to Query Tower
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Camera & viewport state
  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 15 });
  const [yaw, setYaw] = useState<number>(0.08); // slight 3D angle
  const [pitch, setPitch] = useState<number>(0.05);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Top recommended products to display in the Recommendations details panel
  const previewProducts = useMemo(() => {
    return MOCK_PRODUCTS.slice(0, 3);
  }, []);

  // Connected nodes & edges calculation
  const activeNodeId = hoveredNodeId || selectedNode?.id;
  const connectedNodes = useMemo(() => {
    const set = new Set<string>();
    if (activeNodeId) {
      set.add(activeNodeId);
      ARCHITECTURE_EDGES.forEach((e) => {
        if (e.from === activeNodeId) set.add(e.to);
        if (e.to === activeNodeId) set.add(e.from);
      });
    }
    return set;
  }, [activeNodeId]);

  // Project 3D coordinates to 2D screen coordinates
  const projectedNodes = useMemo(() => {
    const centerX = 600;
    const centerY = 360;

    return nodes.map((node) => {
      if (viewMode === '2d') {
        return {
          ...node,
          projX: node.x,
          projY: node.y,
          projScale: 1,
        };
      }

      // 3D Perspective Rotation around center
      const dx = node.x - centerX;
      const dy = node.y - centerY;
      const dz = node.z;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Rotate around Y
      const x1 = dx * cosY + dz * sinY;
      const z1 = -dx * sinY + dz * cosY;

      // Rotate around X
      const y2 = dy * cosP - z1 * sinP;
      const z2 = dy * sinP + z1 * cosP;

      // Perspective scale factor
      const fov = 1100;
      const scale = fov / (fov + z2);

      return {
        ...node,
        projX: centerX + x1 * scale,
        projY: centerY + y2 * scale,
        projScale: scale,
      };
    });
  }, [nodes, viewMode, yaw, pitch]);

  // Mouse handlers for dragging canvas / orbit rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsDraggingCanvas(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (draggedNodeId) {
      // Drag specific node
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId
            ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom }
            : n
        )
      );
      return;
    }

    if (isDraggingCanvas) {
      if (viewMode === '3d' && e.shiftKey) {
        // Orbit rotation
        setYaw((y) => y + dx * 0.005);
        setPitch((p) => Math.max(-0.4, Math.min(0.4, p + dy * 0.005)));
      } else {
        // Pan
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  // Camera reset
  const handleReset = () => {
    setNodes(ARCHITECTURE_NODES);
    setZoom(0.95);
    setPan({ x: 20, y: 15 });
    setYaw(0.08);
    setPitch(0.05);
    setSelectedNode(ARCHITECTURE_NODES[2]);
  };

  const handleFit = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setYaw(0);
    setPitch(0);
  };

  return (
    <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
      {/* Dedicated Toolbar above Canvas */}
      <div className="p-4 sm:p-5 border-b border-[#E8E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#171717] tracking-tight flex items-center gap-2">
              CAN Pipeline Architecture Graph
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-semibold">
                Two-Tower Topology
              </span>
            </h3>
            <p className="text-xs text-[#737370]">
              Interactive visual dataflow from high-dimensional input vectors to 32D L2-normalized cosine ranking
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* 3D vs 2D View Switcher */}
          <div className="flex bg-[#F0F0ED] p-1 rounded-xl border border-[#E5E5E0] text-xs">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737370] hover:text-[#171717]'
              }`}
            >
              3D Perspective
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737370] hover:text-[#171717]'
              }`}
            >
              2D Diagram
            </button>
          </div>

          {/* Zoom & Fit Actions */}
          <div className="flex items-center bg-[#F0F0ED] rounded-xl border border-[#E5E5E0] p-0.5 text-xs">
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 text-[#555] hover:text-[#111] hover:bg-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 text-[#555] hover:text-[#111] hover:bg-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1.5 text-[#555] hover:text-[#111] hover:bg-white rounded-lg transition-colors"
              title="Fit to Viewport"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 px-2.5 text-[#555] hover:text-[#111] hover:bg-white rounded-lg transition-colors font-medium flex items-center gap-1"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas + Side Inspector (Desktop: Side-by-side, Mobile: stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E8E4]">
        {/* Graph Canvas: 8-9 cols on desktop, dedicated 680-750px height */}
        <div
          className="lg:col-span-8 xl:col-span-9 relative w-full h-[620px] sm:h-[680px] bg-[#FAF9F6] overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
        >
          {/* Subtle instruction banner */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E8E8E4] text-[11px] text-[#737370] shadow-xs flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Click &amp; drag nodes or canvas • Click any layer to inspect tensor specifications</span>
          </div>

          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 1280 740"
            className="w-full h-full"
          >
            <defs>
              {/* Arrowhead marker */}
              <marker
                id="arrowhead-can"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#4F46E5" />
              </marker>
              {/* Subtle grid pattern */}
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.2" fill="#D4D4CE" />
              </pattern>
            </defs>

            {/* Background pattern */}
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges with collision-free labels */}
              {ARCHITECTURE_EDGES.map((edge) => {
                const source = projectedNodes.find((n) => n.id === edge.from);
                const target = projectedNodes.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isConnected =
                  connectedNodes.has(edge.from) && connectedNodes.has(edge.to);

                // Orthogonal / cubic Bezier path
                const sx = source.projX + 90;
                const sy = source.projY;
                const tx = target.projX - 90;
                const ty = target.projY;
                const midX = (sx + tx) / 2;

                const pathData = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    {/* Shadow / background line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isConnected ? '#4F46E5' : '#94A3B8'}
                      strokeWidth={isConnected ? 3 : 1.8}
                      strokeDasharray={isConnected ? 'none' : '5 4'}
                      markerEnd={isConnected ? 'url(#arrowhead-active)' : 'url(#arrowhead-can)'}
                      className="transition-colors duration-200"
                    />

                    {/* Edge Label Pill with background so text never intersects */}
                    <g transform={`translate(${midX}, ${(sy + ty) / 2})`}>
                      <rect
                        x="-32"
                        y="-10"
                        width="64"
                        height="20"
                        rx="10"
                        fill="#FFFFFF"
                        stroke={isConnected ? '#4F46E5' : '#94A3B8'}
                        strokeWidth="1.2"
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.06))"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="ui-monospace, monospace"
                        fontWeight="700"
                        fill={isConnected ? '#4F46E5' : '#334155'}
                      >
                        {edge.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Nodes */}
              {projectedNodes.map((node) => {
                const style = CATEGORY_STYLES[node.category];
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedNodes.has(node.id);
                const isHovered = hoveredNodeId === node.id;

                const width = 175;
                const height = 74;
                const x = node.projX - width / 2;
                const y = node.projY - height / 2;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${x}, ${y}) scale(${node.projScale})`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggedNodeId(node.id);
                      lastMousePos.current = { x: e.clientX, y: e.clientY };
                    }}
                    className="cursor-pointer transition-transform duration-75"
                  >
                    {/* Glow outline for selected/hovered */}
                    {(isSelected || isHovered) && (
                      <rect
                        x="-3"
                        y="-3"
                        width={width + 6}
                        height={height + 6}
                        rx="14"
                        fill="none"
                        stroke={style.border}
                        strokeWidth="2.5"
                        opacity="0.8"
                      />
                    )}

                    {/* Main Node Card */}
                    <rect
                      x="0"
                      y="0"
                      width={width}
                      height={height}
                      rx="12"
                      fill="#FFFFFF"
                      stroke={isSelected ? style.border : '#CBD5E1'}
                      strokeWidth={isSelected ? '2.5' : '1.2'}
                      filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
                    />

                    {/* Top colored category accent strip */}
                    <path
                      d={`M 0 12 C 0 5.37, 5.37 0, 12 0 L ${width - 12} 0 C ${width - 5.37} 0, ${width} 5.37, ${width} 12 L ${width} 14 L 0 14 Z`}
                      fill={style.border}
                    />

                    {/* Category icon / category pill */}
                    <rect
                      x="10"
                      y="20"
                      width="54"
                      height="15"
                      rx="4"
                      fill={style.bg}
                    />
                    <text
                      x="37"
                      y="31"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="700"
                      fill={style.text}
                      letterSpacing="0.05em"
                    >
                      {node.category.toUpperCase()}
                    </text>

                    {/* Dimension badge */}
                    <rect
                      x={width - 64}
                      y="20"
                      width="54"
                      height="15"
                      rx="4"
                      fill="#F5F5F3"
                    />
                    <text
                      x={width - 37}
                      y="31"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="600"
                      fill="#555552"
                    >
                      {node.dim}
                    </text>

                    {/* Node Main Title */}
                    <text
                      x="12"
                      y="48"
                      fontSize="11.5"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="700"
                      fill="#171717"
                    >
                      {node.label}
                    </text>

                    {/* Node Subtitle */}
                    <text
                      x="12"
                      y="62"
                      fontSize="9.5"
                      fontFamily="system-ui, sans-serif"
                      fill="#737370"
                    >
                      {node.sublabel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Side Inspector Panel: 4 cols on desktop, adapts to drawer on mobile */}
        <div
          className="lg:col-span-4 xl:col-span-3 p-5 sm:p-6 bg-white flex flex-col justify-between overflow-y-auto max-h-[680px]"
          style={{ borderLeft: '1px solid #E8E8E4' }}
        >
          {selectedNode ? (
            <div className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${
                      CATEGORY_STYLES[selectedNode.category].badge
                    }`}
                  >
                    {selectedNode.category} Layer
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#171717]" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {selectedNode.dim}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#171717] tracking-tight" style={{ fontSize: 16, fontWeight: 700, color: '#171717' }}>
                  {selectedNode.label}
                </h4>
                <p className="text-xs text-[#737370] mt-1 leading-relaxed" style={{ fontSize: 12, color: '#737370', lineHeight: 1.5, marginTop: 4 }}>
                  {selectedNode.details.description}
                </p>
              </div>

              {/* Tensor Metadata Box */}
              <div
                className="p-3.5 bg-[#FAF9F6] border border-[#ECECE8] rounded-xl space-y-2.5 text-xs"
                style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: 12, padding: 14 }}
              >
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8E8E88] block font-semibold tracking-wider">
                    Tensor Shape:
                  </span>
                  <p className="font-mono font-semibold text-[#171717] break-all mt-0.5 text-[12px]" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {selectedNode.details.tensorShape}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E8E8E4]" style={{ borderTop: '1px solid #E8E8E4', paddingTop: 8 }}>
                  <span className="text-[10px] uppercase font-mono text-[#8E8E88] block font-semibold tracking-wider">
                    Parameters / Dimension:
                  </span>
                  <p className="font-mono text-[#444441] text-[11px] mt-0.5" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {selectedNode.details.parameters}
                  </p>
                </div>
                {selectedNode.details.activation && (
                  <div className="pt-2 border-t border-[#E8E8E4]" style={{ borderTop: '1px solid #E8E8E4', paddingTop: 8 }}>
                    <span className="text-[10px] uppercase font-mono text-[#8E8E88] block font-semibold tracking-wider">
                      Activation / Output:
                    </span>
                    <p className="font-mono text-[#0F766E] font-medium text-[11px] mt-0.5" style={{ fontFamily: 'ui-monospace, monospace' }}>
                      {selectedNode.details.activation}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E8E8E4]" style={{ borderTop: '1px solid #E8E8E4', paddingTop: 8 }}>
                  <span className="text-[10px] uppercase font-mono text-[#8E8E88] block font-semibold tracking-wider">
                    Source Mapping:
                  </span>
                  <code
                    className="font-mono text-[11px] text-[#4F46E5] bg-white px-2 py-1 rounded border border-[#E0E0DB] block truncate mt-1"
                    style={{ fontFamily: 'ui-monospace, monospace', color: '#4F46E5', backgroundColor: '#FFFFFF', border: '1px solid #E0E0DB', borderRadius: 4 }}
                  >
                    {selectedNode.details.sourceFile}
                  </code>
                </div>
              </div>

              {/* Attributes / Feature List */}
              {selectedNode.details.attributes && (
                <div>
                  <h5 className="text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wider text-[10px]" style={{ fontWeight: 600, color: '#171717', letterSpacing: '0.05em' }}>
                    Encoded Feature Attributes
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#555552]" style={{ paddingLeft: 0, listStyle: 'none' }}>
                    {selectedNode.details.attributes.map((attr, idx) => (
                      <li key={idx} className="flex items-start gap-2" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{attr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Connected Garment Previews for Ranked Recommendations */}
              {(selectedNode.id === 'ranked_recommendations' || selectedNode.id === 'candidate_retrieval') && (
                <div className="pt-3 border-t border-[#E8E8E4]">
                  <h5 className="text-[11px] font-semibold text-[#171717] mb-2.5 flex items-center justify-between">
                    <span>Active Ranked Garments</span>
                    <span className="text-[10px] text-[#8E8E88] font-normal">Top Neural Picks</span>
                  </h5>
                  <div className="space-y-2">
                    {previewProducts.map((prod, idx) => (
                      <div
                        key={prod.product_id}
                        className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E8E4] flex items-center gap-2.5"
                      >
                        <div
                          className="relative w-9 h-12 rounded-md overflow-hidden bg-[#ECECE8] flex-shrink-0"
                          style={{ position: 'relative' }}
                        >
                          <Image
                            src={prod.image_url || '/placeholder-garment.svg'}
                            alt={prod.product_name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#171717] truncate leading-tight">
                            {prod.product_name}
                          </p>
                          <p className="text-[11px] text-[#737370] font-mono mt-0.5">
                            {prod.price_inr_formatted} • {prod.category}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {((prod.score || 0.95) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-[#8E8E88] text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-[#B0B0AA]" />
              <p>Select any node in the architecture diagram to inspect tensor specifications.</p>
            </div>
          )}

          {/* Panel Footer */}
          <div className="pt-4 mt-4 border-t border-[#E8E8E4] text-[11px] text-[#8E8E88]">
            Verified implementation in <code className="font-mono text-[#171717]">ml/models/two_tower.py</code>
          </div>
        </div>
      </div>
    </div>
  );
}
