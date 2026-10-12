import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_PRODUCTS } from './mockProducts';

export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price_usd: number;
  price_inr: number;
  price_inr_formatted: string;
  score: number;
  currency: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  discount?: number;
  brand?: string;
  color?: string;
  reason?: string;
  article_id?: string;
  name?: string;
  price?: number;
  discount_percent?: number;
}

export interface Filters {
  selectedCategories: string[];
  priceRange: [number, number];
  minRating: number;
  currency: 'USD' | 'INR';
}

interface RecommendationStore {
  // Data
  recommendations: Product[];
  trendingProducts: Product[];
  categories: string[];
  loading: boolean;
  trendingLoading: boolean;
  error: string | null;
  apiConnected: boolean;
  apiHealthStatus: 'idle' | 'checking' | 'connected' | 'disconnected';

  // Filters
  selectedCategories: string[];
  priceRange: [number, number];
  minRating: number;
  currency: 'USD' | 'INR';

  // UI
  viewMode: 'grid' | 'list';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating';
  searchQuery: string;

  // User
  userId: string;
  savedItems: string[];
  recentSearches: string[];

  // Actions
  setRecommendations: (products: Product[]) => void;
  setTrendingProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setLoading: (loading: boolean) => void;
  setTrendingLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setApiConnected: (connected: boolean) => void;
  setApiHealthStatus: (status: 'idle' | 'checking' | 'connected' | 'disconnected') => void;
  setFilters: (filters: Partial<Filters>) => void;
  setCurrency: (currency: 'USD' | 'INR') => void;
  addSavedItem: (productId: string) => void;
  removeSavedItem: (productId: string) => void;
  toggleSavedItem: (productId: string) => void;
  addRecentSearch: (query: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: 'relevance' | 'price-low' | 'price-high' | 'rating') => void;
  setSearchQuery: (query: string) => void;
  setUserId: (userId: string) => void;
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 50000];

export const useStore = create<RecommendationStore>()(
  persist(
    (set, get) => ({
      // Data - Start with high-fidelity mock catalog to ensure grid is NEVER empty
      recommendations: MOCK_PRODUCTS,
      trendingProducts: MOCK_PRODUCTS.slice(0, 8),
      categories: ['Outerwear', 'Dresses', 'Tops', 'Footwear', 'Bottoms', 'Bags', 'Accessories'],
      loading: false,
      trendingLoading: false,
      error: null,
      apiConnected: false,
      apiHealthStatus: 'idle',

      // Filters
      selectedCategories: [],
      priceRange: DEFAULT_PRICE_RANGE,
      minRating: 0,
      currency: 'USD',

      // UI
      viewMode: 'grid',
      sortBy: 'relevance',
      searchQuery: '',

      // User
      userId: 'demo-user-001',
      savedItems: [],
      recentSearches: [],

      // Actions
      setRecommendations: (products: Product[]) => set({ recommendations: products }),
      setTrendingProducts: (products: Product[]) => set({ trendingProducts: products }),
      setCategories: (categories: string[]) => set({ categories }),
      setLoading: (loading: boolean) => set({ loading }),
      setTrendingLoading: (loading: boolean) => set({ trendingLoading: loading }),
      setError: (error: string | null) => set({ error }),
      setApiConnected: (connected: boolean) => set({ apiConnected: connected }),
      setApiHealthStatus: (status: 'idle' | 'checking' | 'connected' | 'disconnected') =>
        set({ apiHealthStatus: status }),

      setFilters: (filters: Partial<Filters>) =>
        set((state) => ({
          ...state,
          ...filters,
        })),

      setCurrency: (currency: 'USD' | 'INR') => set({ currency }),

      addSavedItem: (productId: string) =>
        set((state) => ({
          savedItems: state.savedItems.includes(productId)
            ? state.savedItems
            : [...state.savedItems, productId],
        })),

      removeSavedItem: (productId: string) =>
        set((state) => ({
          savedItems: state.savedItems.filter((id: string) => id !== productId),
        })),

      toggleSavedItem: (productId: string) => {
        const { savedItems } = get();
        if (savedItems.includes(productId)) {
          set({ savedItems: savedItems.filter((id: string) => id !== productId) });
        } else {
          set({ savedItems: [...savedItems, productId] });
        }
      },

      addRecentSearch: (query: string) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((q: string) => q !== query),
          ].slice(0, 8),
        })),

      clearFilters: () =>
        set({
          selectedCategories: [],
          priceRange: DEFAULT_PRICE_RANGE,
          minRating: 0,
        }),

      setViewMode: (mode: 'grid' | 'list') => set({ viewMode: mode }),
      setSortBy: (sort: 'relevance' | 'price-low' | 'price-high' | 'rating') => set({ sortBy: sort }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setUserId: (userId: string) => set({ userId }),
    }),
    {
      name: 'avero-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedItems: state.savedItems,
        recentSearches: state.recentSearches,
        currency: state.currency,
        userId: state.userId,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
    }
  )
);
