'use client';

import { ArrowRight } from 'lucide-react';

interface ShopByCategoryProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CATEGORIES = [
  {
    name: 'Dresses',
    slug: 'dresses',
    image: '/categories/dresses.png',
  },
  {
    name: 'Tops',
    slug: 'tops',
    image: '/categories/tops.png',
  },
  {
    name: 'Shirts & Blouses',
    slug: 'shirts-blouses',
    image: '/categories/shirts-blouses.png',
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    image: '/categories/trousers.png',
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    image: '/categories/outerwear.png',
  },
  {
    name: 'Knitwear',
    slug: 'knitwear',
    image: '/categories/knitwear.png',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: '/categories/accessories.png',
  },
];

export function ShopByCategory({ onSelectCategory, selectedCategory }: ShopByCategoryProps) {
  const handleClick = (catName: string) => {
    onSelectCategory(catName);
    const element = document.getElementById('collection-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="categories-section"
      className="w-full py-10 md:py-14 bg-white border-b border-[#F0EFEA]"
      style={{ marginInline: 'auto' }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Section Header - Centered */}
        <div className="flex flex-col items-center justify-center text-center mb-8 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#171717] tracking-tight mb-2.5">
            Shop by Category
          </h2>

          <button
            onClick={() => handleClick('all')}
            className="text-xs md:text-sm font-medium text-[#555555] hover:text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>View all categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 7 Category Cards Container - Centered as a Group */}
        <div className="w-full flex justify-center items-center">
          <div className="w-full flex justify-start xl:justify-center overflow-x-auto pb-4 pt-1 px-2 scrollbar-none snap-x snap-mandatory">
            <div className="flex items-stretch justify-center gap-3.5 flex-nowrap mx-auto">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleClick(cat.name)}
                    className={`flex-none w-[138px] h-[235px] flex flex-col items-center justify-between rounded-xl p-2.5 transition-all duration-200 cursor-pointer snap-start text-left focus:outline-none ${
                      isSelected
                        ? 'bg-[#F2EFE9] border-2 border-[#171717] shadow-sm ring-1 ring-[#171717]/10'
                        : 'bg-[#FAF8F5] border border-[#ECEBE8] hover:border-[#D5D4CE] hover:bg-[#F5F2EC] hover:shadow-xs'
                    }`}
                  >
                    {/* Garment Image Container */}
                    <div className="w-full flex-1 flex items-center justify-center p-1.5 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="max-h-[160px] max-w-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Category Label */}
                    <span
                      className={`pb-1 text-xs md:text-[13px] text-center w-full truncate px-1 ${
                        isSelected ? 'font-semibold text-[#171717]' : 'font-medium text-[#2E2E2E]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
