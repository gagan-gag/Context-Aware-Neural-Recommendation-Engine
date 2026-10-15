'use client';

import { useState, useMemo } from 'react';
import { Search, Info, ChevronDown } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockProducts';

interface DatasetInspectorCardProps {
  onInspectPoint?: (id: string) => void;
  selectedId?: string | null;
}

// Preset vector coordinates mapping to match Reference Image
const PRODUCT_VECTORS: Record<string, string> = {
  '0751471001': '(-12.3, 8.4, 1.2)',
  '0865857002': '(-10.1, 6.8, 0.5)',
  '0583845001': '(14.2, -9.1, 3.7)',
  '0924243001': '(-22.5, -18.3, 2.1)',
  '0730713001': '(19.3, 5.6, -1.4)',
  '0614768001': '(12.4, -6.8, 2.9)',
  '0685687001': '(22.1, 14.5, -0.8)',
  '0834478001': '(-18.6, -15.2, 1.8)',
  '0918522002': '(28.4, 4.2, -2.1)',
  '0110065001': '(16.5, 18.2, -1.1)',
  '0800487001': '(-14.8, -12.4, 1.5)',
  '0741547001': '(18.9, 12.1, -0.9)',
  '0761234001': '(6.2, -19.4, 0.5)',
  '0761234002': '(8.7, -21.8, 0.8)',
  '0761234003': '(-16.2, -14.8, 1.2)',
  '0834478002': '(5.4, -23.1, -1.2)',
  '0834478003': '(9.1, -20.5, -0.8)',
  '0834478004': '(11.2, -18.9, -1.5)',
  '0852521001': '(31.5, 6.8, -1.8)',
  '0918522003': '(34.2, 7.5, -2.4)',
  '0685687002': '(7.8, -24.3, 0.4)',
  '0685687003': '(10.4, -22.1, 0.6)',
};

export function DatasetInspectorCard({ onInspectPoint, selectedId = '0865857002' }: DatasetInspectorCardProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = ['All Departments', 'Dresses', 'Tops', 'Trousers', 'Outerwear', 'Knitwear', 'Accessories'];

  const filteredProducts = useMemo(() => {
    // Curated catalog items mapped with reference screenshot metadata
    const tableItems = [
      {
        product_id: '0751471001',
        article_id: '070747001',
        product_name: 'Chiffon Maxi Dress',
        department: 'Dresses',
        category: 'Evening Wear',
        price: '₹2,499',
        vector: '(-12.3, 8.4, 1.2)',
      },
      {
        product_id: '0865857002',
        article_id: '070844001',
        product_name: 'Satin Midi Dress',
        department: 'Dresses',
        category: 'Evening Wear',
        price: '₹2,999',
        vector: '(-10.1, 6.8, 0.5)',
      },
      {
        product_id: '0583845001',
        article_id: '093447001',
        product_name: 'Rib-Knit Jumper',
        department: 'Tops',
        category: 'Knitwear',
        price: '₹2,299',
        vector: '(14.2, -9.1, 3.7)',
      },
      {
        product_id: '0924243001',
        article_id: '093456002',
        product_name: 'Wide-Leg Trousers',
        department: 'Trousers',
        category: 'Casual',
        price: '₹2,799',
        vector: '(-22.5, -18.3, 2.1)',
      },
      {
        product_id: '0730713001',
        article_id: '094221001',
        product_name: 'Tailored Blazer',
        department: 'Outerwear',
        category: 'Formal',
        price: '₹4,999',
        vector: '(19.3, 5.6, -1.4)',
      },
      // Additional items from catalog
      ...MOCK_PRODUCTS.slice(5).map((p, idx) => ({
        product_id: p.product_id,
        article_id: p.article_id || p.product_id,
        product_name: p.product_name,
        department: p.category || 'Tops',
        category: p.subcategory || 'Casual',
        price: p.price_inr_formatted || '₹2,499',
        vector: PRODUCT_VECTORS[p.product_id] || '(12.4, -6.8, 2.9)',
      })),
    ];

    return tableItems.filter((item) => {
      const matchDept = selectedDept === 'all' || selectedDept === 'All Departments' ||
        item.department.toLowerCase() === selectedDept.toLowerCase();

      const matchSearch =
        !searchQuery ||
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.article_id.includes(searchQuery) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDept && matchSearch;
    });
  }, [selectedDept, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 shadow-xs flex flex-col">
      {/* Header matching Reference Image */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-[#171717] tracking-tight">
            Dataset Inspector
          </h3>
          <span className="text-[#94A3B8] cursor-help" title="Curated H&M fashion dataset with Two-Tower embeddings">
            <Info size={14} />
          </span>
        </div>
      </div>

      {/* Filter and Search Bar matching Reference Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Department</span>
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="appearance-none bg-[#FAFAF8] border border-[#CBD5E1] rounded-lg px-3 py-1.5 pr-7 text-xs text-[#1E293B] font-medium focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] font-medium">Search</span>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search product name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-[#FAFAF8] border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] w-56"
              />
            </div>
          </div>
        </div>

        {/* Total Item Count */}
        <span className="text-[#64748B] font-medium text-xs">
          Total: <span className="font-semibold text-[#0F172A]">1,024 items</span>
        </span>
      </div>

      {/* Table Container matching Reference Image */}
      <div 
        className="overflow-x-auto flex-1 max-h-[340px] border border-[#ECECE8] rounded-xl scrollbar-thin"
        style={{ maxHeight: '340px', overflowY: 'auto' }}
      >
        <table className="w-full text-left text-xs" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead className="bg-[#FAF9F6] border-b border-[#ECECE8] text-[#475569] sticky top-0 z-10 font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-8">#</th>
              <th className="py-2.5 px-3">Article ID</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Price (INR)</th>
              <th className="py-2.5 px-3">Vector (X, Y, Z)</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {filteredProducts.map((prod, idx) => {
              const isSelected = selectedId === prod.product_id || 
                (selectedId === '0865857002' && prod.article_id === '070844001') ||
                selectedId === prod.article_id;

              return (
                <tr
                  key={prod.article_id}
                  onClick={() => onInspectPoint && onInspectPoint(prod.product_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                      : 'hover:bg-[#F8FAFC] text-[#334155]'
                  }`}
                >
                  <td className="py-2 px-3 text-[#94A3B8] font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#475569]">
                    {prod.article_id}
                  </td>
                  <td className="py-2 px-3 font-medium text-[#0F172A] whitespace-nowrap">
                    {prod.product_name}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {prod.department}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-[#64748B]">
                    {prod.category}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                    {prod.price}
                  </td>
                  <td className="py-2 px-3 font-mono text-[10.5px] text-[#64748B] whitespace-nowrap">
                    {prod.vector}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onInspectPoint) onInspectPoint(prod.product_id);
                      }}
                      className="px-3 py-1 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] text-[11px] font-medium transition-colors"
                    >
                      View
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
