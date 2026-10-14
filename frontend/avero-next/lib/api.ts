import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { MOCK_PRODUCTS, Product } from './mockProducts';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
  _retryCount?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add timestamp for latency measurement
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const customConfig = config as CustomRequestConfig;
  customConfig._startTime = performance.now();
  return customConfig;
});

// Response interceptor: latency tracking & retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as CustomRequestConfig | undefined;
    const status = error.response?.status;

    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount ?? 0;

    // Retry 2 times on network failure or 5xx server errors
    if (config._retryCount < 2 && (!error.response || (status && status >= 500))) {
      config._retryCount += 1;
      const delay = config._retryCount * 800;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

// ─── Health Check ─────────────────────────────────────────────────────────────

export interface ApiHealthResponse {
  status: string;
  mode?: string;
  service?: string;
  model_loaded?: boolean;
  timestamp?: string;
}

export async function checkApiHealth(): Promise<{
  ok: boolean;
  data?: ApiHealthResponse;
  error?: string;
  latencyMs?: number;
}> {
  const start = performance.now();
  try {
    const { data } = await apiClient.get<ApiHealthResponse>('/health', {
      timeout: 4000,
    });
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, data, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : 'API server offline';
    return { ok: false, error: message, latencyMs };
  }
}

// ─── Query Parameters Interface ──────────────────────────────────────────────

export interface RecommendationQueryParams {
  user_id?: string;
  top_k?: number;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: string;
}

// ─── Helpers: Format & Map ───────────────────────────────────────────────────

function formatInr(val: number): string {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export function normalizeProduct(raw: Record<string, unknown>, index: number = 0): Product {
  const fallback = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
  
  const rawPriceUsd = typeof raw.price_usd === 'number' ? raw.price_usd : typeof raw.price === 'number' ? raw.price : fallback.price_usd;
  const priceUSD = typeof rawPriceUsd === 'number' ? rawPriceUsd : fallback.price_usd;
  const rawPriceInr = typeof raw.price_inr === 'number' ? raw.price_inr : Math.round(priceUSD * 83.5);
  const priceINR = typeof rawPriceInr === 'number' ? rawPriceInr : Math.round(priceUSD * 83.5);

  const rawScore = typeof raw.score === 'number' ? raw.score : typeof raw.context_score === 'number' ? raw.context_score : fallback.score;
  const score = typeof rawScore === 'number' ? rawScore : fallback.score;

  return {
    product_id: String(raw.product_id || raw.article_id || raw.item_id || fallback.product_id),
    product_name: String(raw.product_name || raw.name || fallback.product_name),
    category: String(raw.category || fallback.category),
    price_usd: Number(priceUSD.toFixed(2)),
    price_inr: Number(priceINR.toFixed(2)),
    price_inr_formatted: formatInr(priceINR),
    score: score,
    currency: typeof raw.currency === 'string' ? raw.currency : 'USD',
    image_url: typeof raw.image_url === 'string' ? raw.image_url : fallback.image_url,
    rating: typeof raw.rating === 'number' ? raw.rating : fallback.rating,
    review_count: typeof raw.review_count === 'number' ? raw.review_count : fallback.review_count,
    discount: typeof raw.discount === 'number' ? raw.discount : typeof raw.discount_percent === 'number' ? raw.discount_percent : fallback.discount,
    brand: typeof raw.brand === 'string' ? raw.brand : fallback.brand,
    color: typeof raw.color === 'string' ? raw.color : 'Natural',
    reason: typeof raw.reason === 'string' ? raw.reason : typeof raw.explanation === 'string' ? raw.explanation : fallback.reason,
    article_id: String(raw.article_id || raw.product_id || fallback.product_id),
    name: String(raw.name || raw.product_name || fallback.product_name),
    price: Number(priceUSD.toFixed(2)),
  };
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const cache = new Map<string, { data: Product[]; expiry: number }>();

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

// ─── Recommendations Fetcher ────────────────────────────────────────────────

export async function fetchRecommendationsWithFilters(
  params: RecommendationQueryParams
): Promise<{ products: Product[]; fromFallback: boolean }> {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return { products: cached.data, fromFallback: false };
  }

  const userId = params.user_id || 'demo-user-001';
  const topK = params.top_k || 12;

  try {
    // Attempt live FastAPI endpoint: /api/v1/recommendations/{user_id}?k={topK}
    const res = await apiClient.get<{ recommendations: Record<string, unknown>[] }>(
      `/api/v1/recommendations/${userId}`,
      { params: { k: topK } }
    );

    const rawList = res.data?.recommendations || [];
    const products = rawList.map((item, i) => normalizeProduct(item, i));
    
    cache.set(cacheKey, { data: products, expiry: Date.now() + 5 * 60 * 1000 });
    return { products, fromFallback: false };
  } catch {
    // Graceful fallback to verified catalog
    let list = [...MOCK_PRODUCTS];

    if (params.category && params.category !== 'all') {
      const cats = params.category.toLowerCase().split(',');
      list = list.filter((p) => cats.some((c) => p.category.toLowerCase().includes(c)));
    }

    if (typeof params.min_price === 'number') {
      list = list.filter((p) => p.price_inr >= params.min_price!);
    }

    if (typeof params.max_price === 'number') {
      list = list.filter((p) => p.price_inr <= params.max_price!);
    }

    if (typeof params.min_rating === 'number' && params.min_rating > 0) {
      list = list.filter((p) => (p.rating ?? 0) >= params.min_rating!);
    }

    if (params.sort_by === 'price-low') {
      list.sort((a, b) => a.price_usd - b.price_usd);
    } else if (params.sort_by === 'price-high') {
      list.sort((a, b) => b.price_usd - a.price_usd);
    } else if (params.sort_by === 'popularity') {
      list.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    } else {
      list.sort((a, b) => b.score - a.score);
    }

    return { products: list.slice(0, topK), fromFallback: true };
  }
}

export async function fetchRecommendations(userId: string, k: number = 12) {
  const result = await fetchRecommendationsWithFilters({ user_id: userId, top_k: k });
  return {
    user_id: userId,
    mode: result.fromFallback ? 'demo' : 'real',
    recommendations: result.products,
  };
}

export async function fetchTrending(k: number = 12) {
  const result = await fetchRecommendationsWithFilters({ user_id: 'trending', top_k: k });
  return {
    user_id: 'trending',
    mode: result.fromFallback ? 'demo' : 'real',
    recommendations: result.products,
  };
}

export async function fetchHealth(): Promise<ApiHealthResponse> {
  const result = await checkApiHealth();
  if (!result.ok) {
    throw new Error(result.error || 'API server offline');
  }
  return result.data!;
}

// ─── Custom Product Management ────────────────────────────────────────────────

export interface ProductItem {
  article_id: string;
  product_name: string;
  category: string;
  department?: string;
  subcategory?: string;
  price_inr: number;
  image_url: string;
  description?: string;
  color?: string;
  rating?: number;
  review_count?: number;
  is_custom?: boolean;
}

export interface ProductCreatePayload {
  article_id: string;
  product_name: string;
  category: string;
  department?: string;
  subcategory?: string;
  price_inr: number;
  image_url: string;
  description?: string;
  color?: string;
  rating?: number;
  review_count?: number;
}

const LOCAL_STORAGE_KEY = 'avero_custom_products_v1';

function getLocalCustomProducts(): ProductItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomProducts(items: ProductItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export async function fetchAllCatalogProducts(): Promise<{
  products: ProductItem[];
  fromFallback: boolean;
}> {
  try {
    const res = await apiClient.get<ProductItem[]>('/api/products', { timeout: 4000 });
    return { products: res.data, fromFallback: false };
  } catch {
    // Merge MOCK_PRODUCTS + localStorage custom products
    const custom = getLocalCustomProducts();
    const defaults: ProductItem[] = MOCK_PRODUCTS.map((m) => ({
      article_id: m.product_id,
      product_name: m.product_name,
      category: m.category,
      department: m.department,
      subcategory: m.subcategory,
      price_inr: m.price_inr,
      image_url: m.image_url || '/placeholder-garment.svg',
      description: m.reason,
      color: m.color,
      rating: m.rating,
      review_count: m.review_count,
      is_custom: false,
    }));
    return { products: [...defaults, ...custom], fromFallback: true };
  }
}

export async function createCustomProduct(payload: ProductCreatePayload): Promise<ProductItem> {
  try {
    const res = await apiClient.post<ProductItem>('/api/products', payload);
    // Also sync to localStorage
    const local = getLocalCustomProducts().filter((p) => p.article_id !== payload.article_id);
    local.push(res.data);
    saveLocalCustomProducts(local);
    return res.data;
  } catch {
    // Offline / fallback storage
    const customItem: ProductItem = {
      ...payload,
      is_custom: true,
    };
    const local = getLocalCustomProducts().filter((p) => p.article_id !== payload.article_id);
    local.push(customItem);
    saveLocalCustomProducts(local);
    return customItem;
  }
}

export async function updateCustomProduct(
  articleId: string,
  payload: Partial<ProductCreatePayload>
): Promise<ProductItem> {
  try {
    const res = await apiClient.put<ProductItem>(`/api/products/${articleId}`, payload);
    const local = getLocalCustomProducts().map((p) =>
      p.article_id === articleId ? { ...p, ...payload } : p
    );
    saveLocalCustomProducts(local);
    return res.data;
  } catch {
    const local = getLocalCustomProducts();
    const index = local.findIndex((p) => p.article_id === articleId);
    if (index === -1) {
      throw new Error(`Product ${articleId} not found`);
    }
    const updated = { ...local[index], ...payload };
    local[index] = updated;
    saveLocalCustomProducts(local);
    return updated;
  }
}

export async function deleteCustomProduct(articleId: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/products/${articleId}`);
  } catch {
    // Continue to remove from local
  }
  const local = getLocalCustomProducts().filter((p) => p.article_id !== articleId);
  saveLocalCustomProducts(local);
  return true;
}

