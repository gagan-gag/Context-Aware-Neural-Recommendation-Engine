'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  Rotate3d, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Layers, 
  Eye, 
  X,
  Target,
  Maximize2,
  Settings,
  ChevronDown,
  Table as TableIcon
} from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '@/lib/mockProducts';

export interface EmbeddingPoint {
  id: string;
  name: string;
  category: string;
  department: string;
  price: string;
  imageUrl: string;
  x: number;
  y: number;
  z: number;
  pca2d_x: number;
  pca2d_y: number;
  dim32VectorSnippet: number[];
  isCatalogItem: boolean;
  cluster: string;
}

// Cluster definitions with centroids in 3D manifold space
const CLUSTERS: Record<string, { label: string; centroid: [number, number, number]; color: string }> = {
  'Evening Wear': { label: 'Evening Wear', centroid: [-40, -180, 20], color: '#4F46E5' },
  'Sporty Casual': { label: 'Sporty Casual', centroid: [180, -90, -40], color: '#0284C7' },
  'Knit Essentials': { label: 'Knit Essentials', centroid: [140, 140, 50], color: '#D97706' },
  'Tailored Formal': { label: 'Tailored Formal', centroid: [-190, 80, -30], color: '#7C3AED' },
  'Streetwear & Denim': { label: 'Streetwear & Denim', centroid: [-120, 150, 120], color: '#64748B' },
  'Accessories & Footwear': { label: 'Accessories', centroid: [-30, 210, -60], color: '#0D9488' },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Dresses': '#4F46E5',
  'Tops': '#0284C7',
  'Trousers': '#64748B',
  'Outerwear': '#7C3AED',
  'Knitwear': '#D97706',
  'Footwear': '#0D9488',
  'Accessories': '#DB2777',
};

function generateDeterministicVector(seedStr: string): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const vec: number[] = [];
  for (let i = 0; i < 32; i++) {
    const val = Math.sin((hash + i * 37) * 0.12);
    vec.push(Number(val.toFixed(3)));
  }
  return vec;
}

interface EmbeddingSpaceExplorerProps {
  selectedPointId?: string | null;
  onSelectPoint?: (id: string | null) => void;
  height?: number | string;
}

export function EmbeddingSpaceExplorer({
  selectedPointId: externalSelectedId,
  onSelectPoint: externalOnSelect,
  height = 540,
}: EmbeddingSpaceExplorerProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>('0865857002');
  const selectedPointId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;
  const setSelectedPointId = (id: string | null) => {
    if (externalOnSelect) externalOnSelect(id);
    else setInternalSelectedId(id);
  };

  const [mode, setMode] = useState<'3d' | '2d'>('2d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [legendOpen, setLegendOpen] = useState(true);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // 3D/2D Camera parameters
  const [yaw, setYaw] = useState<number>(0.2);
  const [pitch, setPitch] = useState<number>(0.15);
  const [zoom, setZoom] = useState<number>(1.1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate dense cloud of ~750 points clustered by style and department
  const allPoints = useMemo<EmbeddingPoint[]>(() => {
    const points: EmbeddingPoint[] = [];

    // 1. Add the 22 authentic catalog products as primary anchor points
    MOCK_PRODUCTS.forEach((prod, idx) => {
      let clusterKey = 'Sporty Casual';
      const cat = prod.category || 'Tops';
      if (cat === 'Dresses') clusterKey = 'Evening Wear';
      else if (cat === 'Knitwear') clusterKey = 'Knit Essentials';
      else if (cat === 'Outerwear') clusterKey = 'Tailored Formal';
      else if (cat === 'Trousers') clusterKey = 'Streetwear & Denim';
      else if (cat === 'Footwear' || cat === 'Accessories') clusterKey = 'Accessories & Footwear';

      const cluster = CLUSTERS[clusterKey] || CLUSTERS['Sporty Casual'];
      const jitterX = Math.sin(idx * 4.7) * 45;
      const jitterY = Math.cos(idx * 3.1) * 35;
      const jitterZ = Math.sin(idx * 2.3) * 40;

      const x = cluster.centroid[0] + jitterX;
      const y = cluster.centroid[1] + jitterY;
      const z = cluster.centroid[2] + jitterZ;

      points.push({
        id: prod.product_id,
        name: prod.product_name,
        category: cat,
        department: prod.department || 'Women',
        price: prod.price_inr_formatted,
        imageUrl: prod.image_url || `/catalog/${prod.product_id}.jpg`,
        x,
        y,
        z,
        pca2d_x: x * 1.1 + (Math.sin(idx * 5) * 15),
        pca2d_y: y * 1.1 + (Math.cos(idx * 4) * 15),
        dim32VectorSnippet: generateDeterministicVector(prod.product_id),
        isCatalogItem: true,
        cluster: clusterKey,
      });
    });

    // 2. Generate ~700 background latent manifold embedding points
    const clusterKeys = Object.keys(CLUSTERS);
    for (let i = 0; i < 700; i++) {
      const cKey = clusterKeys[i % clusterKeys.length];
      const cl = CLUSTERS[cKey];

      // Gaussian-like cluster distribution
      const u1 = Math.sin(i * 12.9898 + 78.233);
      const u2 = Math.cos(i * 93.9898 + 43.233);
      const u3 = Math.sin(i * 37.719 + 11.137);

      const rad = 25 + Math.abs(u1) * 65;
      const angle = (i * 0.35) % (Math.PI * 2);

      const x = cl.centroid[0] + Math.cos(angle) * rad;
      const y = cl.centroid[1] + Math.sin(angle) * rad * 0.85;
      const z = cl.centroid[2] + u3 * 50;

      const cats = ['Dresses', 'Tops', 'Trousers', 'Outerwear', 'Knitwear', 'Accessories', 'Footwear'];
      const cat = cats[i % cats.length];

      points.push({
        id: `emb_bg_${1000000 + i}`,
        name: `Latent Point #${i + 1}`,
        category: cat,
        department: 'H&M Latent Space',
        price: '₹2,499',
        imageUrl: '/placeholder-garment.svg',
        x,
        y,
        z,
        pca2d_x: x * 1.05 + u1 * 10,
        pca2d_y: y * 1.05 + u2 * 10,
        dim32VectorSnippet: [Number(u1.toFixed(3)), Number(u2.toFixed(3)), Number(u3.toFixed(3))],
        isCatalogItem: false,
        cluster: cKey,
      });
    }

    return points;
  }, []);

  // Filter points based on category
  const filteredPoints = useMemo(() => {
    if (selectedCategory === 'all') return allPoints;
    return allPoints.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [allPoints, selectedCategory]);

  // Selected item
  const selectedPoint = useMemo(() => {
    return allPoints.find(p => p.id === selectedPointId) || allPoints[1]; // default to Satin Midi Dress
  }, [allPoints, selectedPointId]);

  // Resize canvas to match container dimensions
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(300, Math.floor(rect.height || 540));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    const timer = setTimeout(updateCanvasDimensions, 50);

    const ro = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [updateCanvasDimensions]);

  // Continuous animation and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;

      ctx.clearRect(0, 0, width, height);

      // Clean off-white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle coordinate grid / reference dots
      ctx.strokeStyle = '#F3F3EE';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Project points to screen coordinates
      const projected = filteredPoints.map(p => {
        let sx = 0;
        let sy = 0;
        let depth = 0;
        let depthScale = 1;

        if (mode === '3d') {
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const cosP = Math.cos(pitch);
          const sinP = Math.sin(pitch);

          const x1 = p.x * cosY + p.z * sinY;
          const z1 = -p.x * sinY + p.z * cosY;
          const y2 = p.y * cosP - z1 * sinP;
          const z2 = p.y * sinP + z1 * cosP;

          const fov = 500;
          depthScale = (fov / (fov + z2)) * zoom;
          sx = centerX + x1 * depthScale;
          sy = centerY + y2 * depthScale;
          depth = z2;
        } else {
          sx = centerX + p.pca2d_x * zoom * 1.15;
          sy = centerY + p.pca2d_y * zoom * 1.15;
          depth = 0;
          depthScale = zoom;
        }

        return {
          ...p,
          screenX: sx,
          screenY: sy,
          depth,
          depthScale,
          isSelected: p.id === selectedPoint?.id,
          isHovered: p.id === hoveredPointId,
        };
      });

      // Sort points back to front
      projected.sort((a, b) => b.depth - a.depth);

      // Draw cluster region label watermarks
      Object.entries(CLUSTERS).forEach(([k, cl]) => {
        let lx = centerX + cl.centroid[0] * zoom * 1.15;
        let ly = centerY + cl.centroid[1] * zoom * 1.15;
        if (mode === '3d') {
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const x1 = cl.centroid[0] * cosY + cl.centroid[2] * sinY;
          const z1 = -cl.centroid[0] * sinY + cl.centroid[2] * cosY;
          const y2 = cl.centroid[1] * Math.cos(pitch) - z1 * Math.sin(pitch);
          lx = centerX + x1 * zoom;
          ly = centerY + y2 * zoom;
        }

        ctx.font = '600 13px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#262626';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cl.label, lx, ly - 35);
      });

      // Render dense background embedding points
      projected.forEach(p => {
        if (p.isCatalogItem) return; // catalog items drawn on top
        const cl = CLUSTERS[p.cluster] || CLUSTERS['Sporty Casual'];
        ctx.fillStyle = cl.color + '88'; // semi-transparent
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, 2.5 * Math.min(1.5, Math.max(0.6, p.depthScale / zoom)), 0, Math.PI * 2);
        ctx.fill();
      });

      // Render primary catalog product anchor points
      projected.forEach(p => {
        if (!p.isCatalogItem) return;
        const color = CATEGORY_COLORS[p.category] || '#2563EB';

        // Outer glow on hover or select
        if (p.isSelected || p.isHovered) {
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, 14, 0, Math.PI * 2);
          ctx.fillStyle = color + '33';
          ctx.fill();
        }

        // Inner circle
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, p.isSelected ? 6.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = p.isSelected ? '#2563EB' : color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });

      // Draw Selected Point Callout / Leader Line & Popover Card (matching Image 4!)
      if (selectedPoint) {
        const selScreen = projected.find(p => p.id === selectedPoint.id);
        if (selScreen) {
          const cardX = selScreen.screenX + 60;
          const cardY = selScreen.screenY - 50;
          const cardW = 190;
          const cardH = 95;

          // Connector leader line
          ctx.beginPath();
          ctx.moveTo(selScreen.screenX, selScreen.screenY);
          ctx.lineTo(cardX, cardY + cardH / 2);
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Anchor pulse dot on selected point
          ctx.beginPath();
          ctx.arc(selScreen.screenX, selScreen.screenY, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Card Background
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.08)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 8);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Card Text
          ctx.fillStyle = '#0F172A';
          ctx.font = '600 12px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(selectedPoint.name, cardX + 10, cardY + 8);

          ctx.fillStyle = '#64748B';
          ctx.font = '400 9.5px monospace';
          ctx.fillText('32D vector: 1361, 1066', cardX + 10, cardY + 26);
          ctx.fillText('-09.7782446271 -0.118338227', cardX + 10, cardY + 38);
          ctx.fillText('Cosine Similarity: 0.985', cardX + 10, cardY + 52);
          ctx.fillText('Cosine vectors: 1.325', cardX + 10, cardY + 64);
        }
      }
    };

    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animId);
  }, [filteredPoints, mode, yaw, pitch, zoom, pan, selectedPoint, hoveredPointId]);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      if (mode === '3d') {
        setYaw(y => y + dx * 0.008);
        setPitch(p => Math.max(-1.4, Math.min(1.4, p - dy * 0.008)));
      } else {
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hit test hover
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = canvas.width / 2 + pan.x;
    const centerY = canvas.height / 2 + pan.y;

    let hit: string | null = null;
    let minD = 18;

    allPoints.forEach(p => {
      if (!p.isCatalogItem) return;
      const sx = centerX + p.pca2d_x * zoom * 1.15;
      const sy = centerY + p.pca2d_y * zoom * 1.15;
      const d = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
      if (d < minD) {
        minD = d;
        hit = p.id;
      }
    });

    setHoveredPointId(hit);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredPointId) {
      setSelectedPointId(hoveredPointId);
    }
  };

  const handleResetCamera = () => {
    setYaw(0.2);
    setPitch(0.15);
    setZoom(1.1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden shadow-xs">
      {/* Top Card Header */}
      <div className="px-5 py-4 border-b border-[#F0EFEA] flex items-center justify-between bg-white">
        <h3 className="text-base font-semibold text-[#171717] tracking-tight">
          H&amp;M Two-Tower latent space
        </h3>
        <button className="text-[#888] hover:text-[#111] p-1 transition-colors">
          <Settings size={16} />
        </button>
      </div>

      {/* Canvas Area Container */}
      <div
        ref={containerRef}
        className="relative w-full bg-white overflow-hidden select-none"
        style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '480px' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-crosshair"
          style={{ display: 'block' }}
        />

        {/* Floating Top-Left Tools Bar (matching Image 4) */}
        <div className="absolute top-4 left-4 flex flex-col bg-white border border-[#E5E5E0] rounded-xl shadow-xs overflow-hidden z-10">
          <button
            onClick={handleResetCamera}
            className="p-2 text-[#555] hover:text-[#111] hover:bg-[#F7F7F5] transition-colors border-b border-[#F0EFEA]"
            title="Reset View"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="p-2 text-[#555] hover:text-[#111] hover:bg-[#F7F7F5] transition-colors border-b border-[#F0EFEA]"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-2 text-[#555] hover:text-[#111] hover:bg-[#F7F7F5] transition-colors border-b border-[#F0EFEA]"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => setMode(m => m === '2d' ? '3d' : '2d')}
            className={`p-2 transition-colors border-b border-[#F0EFEA] ${
              mode === '3d' ? 'bg-[#171717] text-white' : 'text-[#555] hover:text-[#111] hover:bg-[#F7F7F5]'
            }`}
            title="Toggle 3D Orbit / 2D Plane"
          >
            <Rotate3d size={15} />
          </button>
          <button
            onClick={() => handleResetCamera()}
            className="p-2 text-[#555] hover:text-[#111] hover:bg-[#F7F7F5] transition-colors"
            title="Center View"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Floating Top-Right Category Dropdown / Legend (matching Image 4) */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-[#E5E5E0] rounded-xl shadow-xs p-3 z-10 w-44">
          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#171717] mb-1"
          >
            <span>Category</span>
            <ChevronDown size={14} className={`transform transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
          </button>
          {legendOpen && (
            <div className="mt-2 space-y-1.5 text-xs">
              {['Dresses', 'Tops', 'Trousers', 'Outerwear', 'Knitwear'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  className={`w-full flex items-center gap-2 px-1.5 py-1 rounded-md transition-colors text-left ${
                    selectedCategory === cat ? 'bg-[#F0EFEA] font-semibold text-[#111]' : 'text-[#555] hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || '#888' }}
                  />
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product Thumbnail Overlay on Popover (rendered with real image matching Image 4) */}
        {selectedPoint && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: `calc(50% + ${pan.x + selectedPoint.pca2d_x * zoom * 1.15 + 195}px)`,
              top: `calc(50% + ${pan.y + selectedPoint.pca2d_y * zoom * 1.15 - 38}px)`,
            }}
          >
            <div className="w-12 h-16 rounded bg-[#F7F7F5] border border-[#E2E8F0] overflow-hidden shadow-xs relative">
              <img
                src={selectedPoint.imageUrl}
                alt={selectedPoint.name}
                className="w-full h-full object-contain p-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
