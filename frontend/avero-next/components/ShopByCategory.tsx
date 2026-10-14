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
    <section id="categories-section" className="py-8 md:py-12 bg-white border-b border-[#F0EFEA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#171717] tracking-tight">
            Shop by Category
          </h2>

          <button
            onClick={() => handleClick('all')}
            className="text-xs md:text-sm font-medium text-neutral-600 hover:text-black inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View all categories</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Categories Strip - Horizontally scrollable on mobile, grid on desktop */}
        <div className="flex items-stretch gap-3 md:gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-7 md:overflow-visible md:pb-0">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                onClick={() => handleClick(cat.name)}
                className={`flex-none w-[130px] sm:w-[140px] md:w-auto flex flex-col items-center justify-between rounded-2xl p-3 md:p-3.5 transition-all duration-200 cursor-pointer snap-start text-left focus:outline-none ${
                  isSelected
                    ? 'bg-[#F0EFEA] border-2 border-[#171717] shadow-sm ring-1 ring-[#171717]/10'
                    : 'bg-[#F7F7F5] border border-[#EBEAE5] hover:border-[#D5D4CE] hover:bg-[#F2F2EE] hover:shadow-sm'
                }`}
                style={{
                  minHeight: '190px',
                }}
              >
                {/* Garment Image Container */}
                <div className="w-full flex-1 flex items-center justify-center p-2 min-h-[120px]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-[120px] max-w-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 text-xs sm:text-[13px] text-center w-full truncate px-1 ${
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
    </section>
  );
}

