'use client';

import { useState, useMemo } from 'react';
import { Search, Link as LinkIcon, Eye, Rotate3d } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

interface DatasetInspectorCardProps {
  onInspectPoint?: (id: string) => void;
  selectedId?: string | null;
}

export function DatasetInspectorCard({ onInspectPoint, selectedId }: DatasetInspectorCardProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = ['all', 'Women', 'Men', 'Shoes', 'Collections'];

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((prod) => {
      const matchDept = selectedDept === 'all' || prod.department?.toLowerCase() === selectedDept.toLowerCase();
      const matchSearch =
        !searchQuery ||
        prod.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.article_id?.includes(searchQuery) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [selectedDept, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs flex flex-col h-full">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-[#171717] tracking-tight">
          Dataset Inspector
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-7 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E0E0DB] rounded-lg text-[#171717] placeholder-[#888] focus:outline-none focus:border-[#171717] w-48"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888]" />
          </div>
          <button className="p-1.5 text-[#888] hover:text-[#111] transition-colors">
            <LinkIcon size={14} />
          </button>
        </div>
      </div>

      {/* Dept Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap text-xs">
        <span className="text-[#888] font-semibold text-[11px] mr-1">Dept:</span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
              selectedDept === dept
                ? 'bg-[#171717] text-white font-medium'
                : 'bg-[#F7F7F5] text-[#555] hover:bg-[#EFEFEA]'
            }`}
          >
            {dept === 'all' ? 'All Dept' : dept}
          </button>
        ))}
      </div>

      {/* Sub-search input matching Image 4 */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search point or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs px-3 py-1 bg-[#FAF9F6] border border-[#E5E5E0] rounded-md text-[#171717] placeholder-[#888] w-48"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1 max-h-[300px] border border-[#ECECE8] rounded-xl scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF9F6] border-b border-[#ECECE8] sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3 font-semibold text-[#555]">Artf ID</th>
              <th className="py-2.5 px-3 font-semibold text-[#555]">Two-Tower latent space</th>
              <th className="py-2.5 px-3 font-semibold text-[#555]">Department</th>
              <th className="py-2.5 px-3 font-semibold text-[#555]">Category</th>
              <th className="py-2.5 px-3 font-semibold text-[#555]">Price</th>
              <th className="py-2.5 px-3 font-semibold text-[#555] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {filteredProducts.map((prod) => {
              const isSelected = selectedId === prod.product_id;
              return (
                <tr
                  key={prod.product_id}
                  className={`hover:bg-[#F9F9F6] transition-colors ${
                    isSelected ? 'bg-[#F3F4F6] font-medium' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-[11px] text-[#444] whitespace-nowrap">
                    {prod.article_id}
                  </td>
                  <td className="py-2 px-3 font-medium text-[#171717] whitespace-nowrap">
                    {prod.product_name}
                  </td>
                  <td className="py-2 px-3 text-[#666] whitespace-nowrap">
                    {prod.department}
                  </td>
                  <td className="py-2 px-3 text-[#666] whitespace-nowrap">
                    {prod.category}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#444] whitespace-nowrap">
                    {prod.price_inr_formatted}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onInspectPoint && onInspectPoint(prod.product_id)}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#222] border-[#D0D0CA] hover:bg-[#F0EFEA]'
                      }`}
                    >
                      <Rotate3d size={12} />
                      <span>Inspect in 3D</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
