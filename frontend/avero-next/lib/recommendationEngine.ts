import { HM_PRODUCTS, Product } from './mockData';

export interface RecommendationFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  sortBy?: string;
}

export function getRecommendations(
  userId: string,
  filters: RecommendationFilters = {},
  topK: number = 16
): Product[] {
  let results = [...HM_PRODUCTS];

  // 1. Category Filter
  if (filters.category && filters.category !== 'all') {
    const targetCategory = filters.category.toLowerCase();
    results = results.filter((p) => p.category.toLowerCase() === targetCategory);
  }

  // 2. Price Filter (in INR)
  if (typeof filters.priceMin === 'number' || typeof filters.priceMax === 'number') {
    results = results.filter((p) => {
      const price = p.price_inr;
      if (typeof filters.priceMin === 'number' && price < filters.priceMin) return false;
      if (typeof filters.priceMax === 'number' && price > filters.priceMax) return false;
      return true;
    });
  }

  // 3. Minimum Rating Filter
  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    results = results.filter((p) => p.rating >= filters.minRating!);
  }

  // 4. Sorting logic
  switch (filters.sortBy) {
    case 'price-low':
      results.sort((a, b) => a.price_inr - b.price_inr);
      break;
    case 'price-high':
      results.sort((a, b) => b.price_inr - a.price_inr);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'relevance':
    default:
      results.sort((a, b) => b.score - a.score);
      break;
  }

  return results.slice(0, topK);
}
