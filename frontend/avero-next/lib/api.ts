import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { MOCK_PRODUCTS, Product } from './mockProducts';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

console.log(`[AVERO] Initialized API Client with baseURL: ${API_BASE_URL}`);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add timestamp for latency measurement
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  (config as any)._startTime = performance.now();
  console.log(`[AVERO API] 📡 Outgoing Request: ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
    data: config.data,
  });
  return config;
});

// Response interceptor: logging latency, size & retry logic
apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any)._startTime;
    const latency = startTime ? Math.round(performance.now() - startTime) : 0;
    const size = JSON.stringify(response.data || '').length;

    console.log(
      `[AVERO API] ✅ Success: ${response.config.method?.toUpperCase()} ${response.config.url} | Status: ${response.status} | Latency: ${latency}ms | Size: ${size} bytes`,
      { data: response.data }
    );
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retryCount?: number; _startTime?: number }) | undefined;
    const status = error.response?.status;
    const latency = config?._startTime ? Math.round(performance.now() - config._startTime) : 0;

    console.error(`[AVERO API] ❌ Error: ${config?.method?.toUpperCase()} ${config?.url} | Status: ${status ?? 'NETWORK_ERROR'} | Latency: ${latency}ms`, {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount ?? 0;

    // Retry 3 times on network failure or 5xx server errors
    if (config._retryCount < 3 && (!error.response || (status && status >= 500))) {
      config._retryCount += 1;
      const delay = config._retryCount * 1000;
      console.warn(`[AVERO API] 🔄 Retrying (${config._retryCount}/3) in ${delay}ms...`);
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

export async function checkApiHealth(): Promise<{ ok: boolean; data?: ApiHealthResponse; error?: string }> {
  try {
    const { data } = await apiClient.get<ApiHealthResponse>('/health', {
      timeout: 5000,
    });
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API server offline';
    return { ok: false, error: message };
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

export function normalizeProduct(raw: any, index: number = 0): Product {
  const fallback = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
  const priceUSD = typeof raw.price_usd === 'number' ? raw.price_usd : typeof raw.price === 'number' ? raw.price : fallback.price_usd;
  const priceINR = typeof raw.price_inr === 'number' ? raw.price_inr : Math.round(priceUSD * 83.5);

  return {
    product_id: String(raw.product_id || raw.article_id || raw.item_id || fallback.product_id),
    product_name: String(raw.product_name || raw.name || fallback.product_name),
    category: String(raw.category || fallback.category),
    price_usd: Number(priceUSD.toFixed(2)),
    price_inr: Number(priceINR.toFixed(2)),
    price_inr_formatted: formatInr(priceINR),
    score: typeof raw.score === 'number' ? raw.score : typeof raw.context_score === 'number' ? raw.context_score : fallback.score,
    currency: raw.currency || 'USD',
    image_url: raw.image_url || fallback.image_url,
    rating: typeof raw.rating === 'number' ? raw.rating : fallback.rating,
    review_count: typeof raw.review_count === 'number' ? raw.review_count : fallback.review_count,
    discount: typeof raw.discount === 'number' ? raw.discount : typeof raw.discount_percent === 'number' ? raw.discount_percent : fallback.discount,
    brand: raw.brand || fallback.brand,
    color: raw.color || 'Onyx',
    reason: raw.reason || raw.explanation || fallback.reason,
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
    console.log(`[AVERO] Serving ${cached.data.length} cached recommendations for key:`, cacheKey);
    return { products: cached.data, fromFallback: false };
  }

  const userId = params.user_id || 'demo-user-001';
  const topK = params.top_k || 12;

  console.log('[AVERO API] 🚀 Fetching recommendations with filter values:', params);

  try {
    // Try primary endpoint (/api/v1/recommendations/{user_id})
    const res = await apiClient.get(`/api/v1/recommendations/${userId}`, {
      params: { k: topK },
    });

    const rawList = res.data?.recommendations || res.data || [];
    const products = rawList.map((item: any, i: number) => normalizeProduct(item, i));
    
    console.log(`[AVERO API] 🎁 Received ${products.length} recommendations from backend!`);
    cache.set(cacheKey, { data: products, expiry: Date.now() + 5 * 60 * 1000 });
    return { products, fromFallback: false };
  } catch (error) {
    console.warn('[AVERO API] ⚠️ Live API endpoint unavailable. Engaging high-fidelity fallback catalog:', error);

    // Filter fallback products based on passed params so filter testing works offline
    let list = [...MOCK_PRODUCTS];

    if (params.category) {
      const cats = params.category.toLowerCase().split(',');
      list = list.filter((p) => cats.includes(p.category.toLowerCase()));
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
    } else if (params.sort_by === 'rating') {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      list.sort((a, b) => b.score - a.score);
    }

    return { products: list.slice(0, topK), fromFallback: true };
  }
}

// Deprecated alias for backwards compatibility
export async function fetchRecommendations(userId: string, k: number = 12) {
  const result = await fetchRecommendationsWithFilters({ user_id: userId, top_k: k });
  return {
    user_id: userId,
    mode: result.fromFallback ? 'fallback' : 'real',
    recommendations: result.products,
  };
}

export async function fetchTrending(k: number = 12) {
  const result = await fetchRecommendationsWithFilters({ user_id: 'trending-user-001', top_k: k });
  return {
    user_id: 'trending-user-001',
    mode: result.fromFallback ? 'fallback' : 'real',
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
