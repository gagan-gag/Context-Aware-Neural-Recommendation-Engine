'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Maximize2,
  Info,
  RotateCcw
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

export interface LatentPoint {
  id: string;
  name: string;
  category: string;
  department: string;
  price: string;
  imageUrl: string;
  x: number;
  y: number;
  z: number;
  vector: string;
  cluster: string;
  isCatalog: boolean;
}

// 7 Department colors matching Reference Image:
// Dresses (Rose/Pink), Tops (Purple/Indigo), Shirts & Blouses (Blue), Trousers (Light Blue),
// Outerwear (Orange), Knitwear (Amber), Accessories (Teal)
const DEPT_COLORS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  'Dresses': { dot: '#E11D48', text: '#E11D48', bg: '#FDF2F8', border: '#FBCFE8' },
  'Tops': { dot: '#9333EA', text: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  'Shirts & Blouses': { dot: '#2563EB', text: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'Trousers': { dot: '#38BDF8', text: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  'Outerwear': { dot: '#EA580C', text: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  'Knitwear': { dot: '#F59E0B', text: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  'Accessories': { dot: '#10B981', text: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
};

// Clusters matching Reference Image coordinates:
// - Evening Wear: top-left (x=-18, y=22) - Navy/Indigo
// - Tops: top-right (x=24, y=20) - Purple
// - Dresses: mid-left (x=-28, y=0) - Rose
// - Outerwear: mid-right (x=33, y=5) - Orange
// - Trousers: bottom-left (x=-18, y=-18) - Light Blue
// - Accessories: bottom-center (x=8, y=-22) - Teal
// - Knitwear: bottom-right (x=24, y=-18) - Amber
const CLUSTER_CONFIG: Record<string, { label: string; cx: number; cy: number; color: string; bg: string; border: string }> = {
  'Evening Wear': { label: 'Evening Wear', cx: -18, cy: 22, color: '#1E3A8A', bg: '#EFF6FF', border: '#BFDBFE' },
  'Tops': { label: 'Tops', cx: 24, cy: 20, color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  'Dresses': { label: 'Dresses', cx: -28, cy: 0, color: '#E11D48', bg: '#FDF2F8', border: '#FBCFE8' },
  'Outerwear': { label: 'Outerwear', cx: 33, cy: 5, color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  'Trousers': { label: 'Trousers', cx: -18, cy: -18, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  'Accessories': { label: 'Accessories', cx: 8, cy: -22, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  'Knitwear': { label: 'Knitwear', cx: 24, cy: -18, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
};

interface EmbeddingSpaceExplorerProps {
  selectedPointId?: string | null;
  onSelectPoint?: (id: string | null) => void;
  height?: number | string;
}

export function EmbeddingSpaceExplorer({
  selectedPointId = '0865857002', // Satin Midi Dress
  onSelectPoint,
  height = 420,
}: EmbeddingSpaceExplorerProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Camera & pan state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [yaw, setYaw] = useState<number>(0.15);
  const [pitch, setPitch] = useState<number>(0.1);

  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate dense cloud of points matching Reference Image (~850 points)
  const points = useMemo<LatentPoint[]>(() => {
    const list: LatentPoint[] = [];

    // 1. Primary Catalog items (22 products)
    MOCK_PRODUCTS.forEach((prod, idx) => {
      let clusterKey = 'Tops';
      const cat = prod.category || 'Tops';
      if (prod.product_id === '0865857002') clusterKey = 'Evening Wear'; // Satin Midi Dress at (-12.3, 8.4)
      else if (cat === 'Dresses') clusterKey = 'Dresses';
      else if (cat === 'Tops' || cat === 'Shirts & Blouses') clusterKey = 'Tops';
      else if (cat === 'Trousers') clusterKey = 'Trousers';
      else if (cat === 'Outerwear') clusterKey = 'Outerwear';
      else if (cat === 'Knitwear') clusterKey = 'Knitwear';
      else if (cat === 'Accessories' || cat === 'Footwear') clusterKey = 'Accessories';

      const cl = CLUSTER_CONFIG[clusterKey] || CLUSTER_CONFIG['Tops'];
      // Fixed deterministic coordinates
      let px = cl.cx + Math.sin(idx * 4.3) * 6;
      let py = cl.cy + Math.cos(idx * 3.7) * 5;

      // Special pin for Satin Midi Dress to match Reference screenshot exactly (-12.3, 8.4)
      if (prod.product_id === '0865857002') {
        px = -12.3;
        py = 8.4;
      }

      list.push({
        id: prod.product_id,
        name: prod.product_name,
        category: cat,
        department: cat,
        price: prod.price_inr_formatted,
        imageUrl: prod.image_url || `/catalog/${prod.product_id}.jpg`,
        x: px,
        y: py,
        z: Math.sin(idx * 2) * 5,
        vector: `[${px.toFixed(1)}, ${py.toFixed(1)}, ${(Math.sin(idx) * 2).toFixed(1)}]`,
        cluster: clusterKey,
        isCatalog: true,
      });
    });

    // 2. Dense background points (~800 points distributed across the 7 clusters)
    const clusterKeys = Object.keys(CLUSTER_CONFIG);
    const totalBg = 800;
    for (let i = 0; i < totalBg; i++) {
      const clKey = clusterKeys[i % clusterKeys.length];
      const cl = CLUSTER_CONFIG[clKey];

      // Gaussian-like cluster spread
      const u1 = Math.sin(i * 12.9898 + 45.1);
      const u2 = Math.cos(i * 78.233 + 67.2);
      const radius = 2 + Math.abs(u1) * 8.5;
      const angle = (i * 0.42) % (Math.PI * 2);

      const px = cl.cx + Math.cos(angle) * radius;
      const py = cl.cy + Math.sin(angle) * radius * 0.85;

      list.push({
        id: `bg_${i}`,
        name: `Latent Garment #${i + 1}`,
        category: clKey === 'Evening Wear' ? 'Dresses' : clKey,
        department: clKey === 'Evening Wear' ? 'Dresses' : clKey,
        price: '₹2,499',
        imageUrl: '/placeholder-garment.svg',
        x: px,
        y: py,
        z: u2 * 4,
        vector: `[${px.toFixed(1)}, ${py.toFixed(1)}, ${(u2 * 4).toFixed(1)}]`,
        cluster: clKey,
        isCatalog: false,
      });
    }

    return list;
  }, []);

  // Filtered points
  const filteredPoints = useMemo(() => {
    if (selectedDept === 'all') return points;
    return points.filter(p => p.department.toLowerCase() === selectedDept.toLowerCase());
  }, [points, selectedDept]);

  // Selected item
  const selectedPoint = useMemo(() => {
    return points.find(p => p.id === selectedPointId) || points.find(p => p.id === '0865857002') || points[0];
  }, [points, selectedPointId]);

  // Canvas resize logic
  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(300, Math.floor(rect.height || 480));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  useEffect(() => {
    updateSize();
    const timer = setTimeout(updateSize, 60);
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [updateSize]);

  // Render loop
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

      const originX = width * 0.44 + pan.x;
      const originY = height * 0.52 + pan.y;

      // Coordinate scaling: range X [-40, 40], range Y [-30, 30]
      const scaleX = (width * 0.78 / 80) * zoom;
      const scaleY = (height * 0.76 / 60) * zoom;

      // Clean white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Coordinate Grid Lines (Ticks: X [-40 to 40 step 10], Y [-30 to 30 step 10])
      ctx.strokeStyle = '#F1F1ED';
      ctx.lineWidth = 1;

      // Vertical lines & X axis labels
      for (let tx = -40; tx <= 40; tx += 10) {
        const sx = originX + tx * scaleX;
        ctx.beginPath();
        ctx.moveTo(sx, 20);
        ctx.lineTo(sx, height - 30);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tx.toString(), sx, height - 14);
      }

      // Horizontal lines & Y axis labels
      for (let ty = -30; ty <= 30; ty += 10) {
        const sy = originY - ty * scaleY;
        ctx.beginPath();
        ctx.moveTo(35, sy);
        ctx.lineTo(width - 25, sy);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 10px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(ty.toString(), 28, sy + 3.5);
      }

      // Axis Titles
      ctx.fillStyle = '#64748B';
      ctx.font = '600 10.5px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Dimension 1', originX, height - 2);

      ctx.save();
      ctx.translate(12, originY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Dimension 2', 0, 0);
      ctx.restore();

      // Project points
      const projected = filteredPoints.map(p => {
        let px = p.x;
        let py = p.y;
        if (viewMode === '3d') {
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          px = p.x * cosY + p.z * sinY;
          py = p.y * Math.cos(pitch) - p.z * Math.sin(pitch);
        }
        const sx = originX + px * scaleX;
        const sy = originY - py * scaleY;

        return {
          ...p,
          sx,
          sy,
          isSelected: selectedPoint?.id === p.id,
        };
      });

      // Draw cluster region label badges (e.g. [Evening Wear], [Tops], [Dresses], etc.)
      Object.entries(CLUSTER_CONFIG).forEach(([k, cl]) => {
        let cx = cl.cx;
        let cy = cl.cy;
        if (viewMode === '3d') {
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          cx = cl.cx * cosY;
          cy = cl.cy * Math.cos(pitch);
        }
        const sx = originX + cx * scaleX;
        const sy = originY - cy * scaleY;

        ctx.font = '600 10px system-ui, sans-serif';
        const txt = cl.label;
        const metrics = ctx.measureText(txt);
        const bw = metrics.width + 14;
        const bh = 18;

        // Badge background
        ctx.fillStyle = cl.bg || '#F8FAFC';
        ctx.strokeStyle = cl.border || '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sx - bw / 2, sy - 18, bw, bh, 5);
        ctx.fill();
        ctx.stroke();

        // Badge text
        ctx.fillStyle = cl.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, sx, sy - 9);
      });

      // Render dense points
      projected.forEach(p => {
        if (p.isSelected) return; // selected point rendered on top
        const cl = CLUSTER_CONFIG[p.cluster] || CLUSTER_CONFIG['Tops'];
        ctx.fillStyle = cl.color;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.isCatalog ? 3.2 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render selected point with glowing highlight ring
      if (selectedPoint) {
        const sel = projected.find(p => p.id === selectedPoint.id);
        if (sel) {
          // Glow ring
          ctx.beginPath();
          ctx.arc(sel.sx, sel.sy, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Center solid dot
          ctx.beginPath();
          ctx.arc(sel.sx, sel.sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#2563EB';
          ctx.fill();
        }
      }
    };

    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animId);
  }, [filteredPoints, viewMode, pan, zoom, yaw, pitch, selectedPoint]);

  // Mouse drag & zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    if (viewMode === '3d') {
      setYaw(y => y + dx * 0.008);
      setPitch(p => Math.max(-1.2, Math.min(1.2, p - dy * 0.008)));
    } else {
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const originX = canvas.width * 0.44 + pan.x;
    const originY = canvas.height * 0.52 + pan.y;
    const scaleX = (canvas.width * 0.78 / 80) * zoom;
    const scaleY = (canvas.height * 0.76 / 60) * zoom;

    let closest: LatentPoint | null = null;
    let minD = 22;

    points.forEach(p => {
      if (!p.isCatalog) return;
      let px = p.x;
      let py = p.y;
      if (viewMode === '3d') {
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        px = p.x * cosY + p.z * sinY;
        py = p.y * Math.cos(pitch) - p.z * Math.sin(pitch);
      }
      const sx = originX + px * scaleX;
      const sy = originY - py * scaleY;
      const d = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
      if (d < minD) {
        minD = d;
        closest = p;
      }
    });

    if (closest !== null && onSelectPoint) {
      onSelectPoint((closest as LatentPoint).id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(4.0, z * delta)));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs flex flex-col relative">
      {/* Card Header matching Reference Image */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-[#171717] tracking-tight">
            H&amp;M Two-Tower Latent Space
          </h3>
          <span className="text-[#94A3B8] cursor-help" title="2D PCA & 3D t-SNE projections of 32D garment embedding space">
            <Info size={14} />
          </span>
        </div>

        {/* 3D View / 2D PCA Mode Toggles + Fullscreen Button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F1F1ED] p-0.5 rounded-lg border border-[#E5E5E0] text-xs font-medium">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === '3d'
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === '2d'
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              2D PCA
            </button>
          </div>

          <button
            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1.0); }}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors"
            title="Reset Zoom & Pan"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Canvas Area Container — explicit height so canvas always renders */}
      <div
        ref={containerRef}
        className="relative w-full bg-white rounded-xl overflow-hidden select-none"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={typeof height === 'number' ? height : 440}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Floating Department Legend on Top Right (matching Reference Image) */}
        <div 
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-[#E2E8F0] rounded-xl p-3 shadow-xs text-xs z-10 w-36 pointer-events-auto"
          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '144px' }}
        >
          <span className="font-semibold text-[#1E293B] block mb-2 text-[11.5px]">
            Department
          </span>
          <div className="space-y-1.5 text-[11px]">
            {Object.entries(DEPT_COLORS).map(([dept, col]) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(selectedDept === dept ? 'all' : dept)}
                className={`flex items-center gap-2 w-full text-left py-0.5 px-1 rounded transition-colors ${
                  selectedDept === dept ? 'bg-[#F1F5F9] font-semibold text-[#0F172A]' : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.dot }} />
                <span className="truncate">{dept}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Product Floating Tooltip Popover (dynamically anchored to selected point) */}
        {selectedPoint && (() => {
          const canvas = canvasRef.current;
          const w = canvas?.width || 600;
          const h = canvas?.height || 420;
          const originX = w * 0.44 + pan.x;
          const originY = h * 0.52 + pan.y;
          const scaleX = (w * 0.78 / 80) * zoom;
          const scaleY = (h * 0.76 / 60) * zoom;

          let px = selectedPoint.x;
          let py = selectedPoint.y;
          if (viewMode === '3d') {
            const cosY = Math.cos(yaw);
            const sinY = Math.sin(yaw);
            px = selectedPoint.x * cosY + selectedPoint.z * sinY;
            py = selectedPoint.y * Math.cos(pitch) - selectedPoint.z * Math.sin(pitch);
          }

          const sx = originX + px * scaleX;
          const sy = originY - py * scaleY;
          const clampedX = Math.max(12, Math.min(w - 270, sx + 14));
          const clampedY = Math.max(12, Math.min(h - 95, sy - 36));

          return (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-75"
              style={{
                position: 'absolute',
                left: `${clampedX}px`,
                top: `${clampedY}px`,
                zIndex: 20,
              }}
            >
              <div className="bg-white rounded-xl border border-[#CBD5E1] p-2.5 shadow-xl flex items-center gap-2.5 w-60 pointer-events-auto">
                {/* Garment Thumbnail on Left */}
                <div className="w-11 h-14 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                  <img
                    src={selectedPoint.imageUrl}
                    alt={selectedPoint.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Product Info on Right */}
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="font-bold text-xs text-[#0F172A] truncate leading-tight">
                    {selectedPoint.name}
                  </h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Dept: {selectedPoint.department}
                  </p>
                  <p className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    Vector: {selectedPoint.vector}
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Nearest neighbors: 12
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
