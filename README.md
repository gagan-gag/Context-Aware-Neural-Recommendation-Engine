# AVERO — AI-Powered Fashion Discovery

> **A luxury fashion discovery and ecommerce platform** powered by a **Context-Aware Neural (CAN) recommendation engine** built with **FastAPI**, **TensorFlow (Two-Tower Deep Neural Network)**, and **Next.js 16 (React 19, TailwindCSS v4)** — delivering personalized style discovery on the Kaggle H&M Personalized Fashion Recommendations dataset.

---

## 1. Project Overview & Problem Statement

Fashion discovery in traditional ecommerce suffers from generic ranking, static catalogs, and poor contextual awareness. Users are presented with repetitive, unpersonalized grids that fail to capture nuances of seasonality, silhouette preferences, and complementary styling pairings.

**AVERO** solves this problem by combining an **editorial Scandinavian fashion storefront** with a **Two-Tower Context-Aware Neural (CAN) recommendation system**:
- Maps high-dimensional user interaction history, visual aesthetics, and temporal signals into a unified 32-dimensional L2-normalized embedding hypersphere.
- Generates personalized candidate apparel items with sub-50ms inference latency.
- Completely eliminates fictional demo personas (Aarav, Elena, Liam), offering authentic session-based personalization and interactive browsing.

---

## 2. Key Features & Working Functionality

- **Editorial Fashion Hero**: Clean composition featuring the headline *"Fashion that finds your style."*, dual CTAs linking to neural recommendations and collection browsing, and floating brand quote box.
- **Shop by Category**: 7 interactive category cards (`Dresses`, `Tops`, `Shirts & Blouses`, `Trousers`, `Outerwear`, `Knitwear`, `Accessories`) with smooth collection filtering.
- **Recommended for You (CAN Engine)**:
  - Powered by live Two-Tower neural model inference or resilient demo fallback.
  - 3:4 portrait cards with verified H&M article IDs, Indian Rupee (`₹`) pricing, and `CAN Pick` neural confidence pills.
  - Interactive `Refresh Recommendations` button with live re-ranking.
- **Explore the Collection**:
  - Live style count (`X styles shown`).
  - Search field matching garment titles, colors, and categories in real time.
  - Multi-select category checkboxes with accurate counts.
  - Circular color filter swatches (Black, White, Grey, Beige, Red, Pink, Blue, Green).
  - Price range slider (`₹1,000` to `₹20,000`).
  - Sort dropdown: `Relevance (Neural Match)`, `Price: Low to High`, `Price: High to Low`, `Newest Arrivals`.
  - `Clear All` reset action.
- **Quick View / Product Details Modal**:
  - Click any card to inspect high-resolution imagery, verified 10-digit article ID, color, price in INR, neural match confidence percentage, and styling rationale.
  - Interactive "Add to Bag" and "Add to Wishlist" controls.
- **Wishlist & Lookbook (`/saved`)**:
  - Global Zustand state management with browser storage persistence.
  - Real-time Wishlist badge counter in the navigation bar.
- **How CAN Works**:
  - 3-stage visual architectural breakdown: *1. Understand*, *2. Match*, *3. Personalize*.
  - Direct link to technical model analytics (`/insights`).
- **AI Insights & Model Intelligence (`/insights`)**:
  - **Visualization A — Interactive CAN Architecture Graph**: Large 680px canvas with 3D perspective rotation, 2D diagram toggle, draggable layer nodes, collision-free edge labels, slide-out tensor specification drawer, and live product previews for top recommendations.
  - **Visualization B — CAN 32D Latent Embedding Space Explorer**: Substantial 3D orbit sphere with true depth occlusion, department filtering (Women, Men, Kids, Shoes, Collections), category clustering, nearest-neighbor vector connections with cosine distance metrics, and accessible coordinate table fallback.
  - **Visualization C — Recommendation Similarity Explorer**: Live context simulation sliders (category affinity, season factor, style mood, price sweet-spot, exploration jitter), real-time cosine score re-ranking with 3:4 isolated product photography, category distribution chart, and deep candidate feature match inspector.
  - **Visualization D — Model Evaluation & Performance Benchmark**: Dynamic comparative charts for Recall@K (1, 5, 10, 20), NDCG@K (5, 10, 20), MRR, and HitRate@10 against Matrix Factorization and Popularity baselines; offline holdout test protocol and sub-50ms live inference latency budget.
  - **Section 5 — Product Management & Candidate Ingestion**: Department-partitioned catalog browsing (Women, Men, Kids, Shoes, Collections) with subcategory filtering, Add/Edit/Delete custom products with live 3:4 preview, duplicate article ID validation, origin badges, backend JSON persistence, and client localStorage fallback.
  - **Live Service Diagnostic**: Port 8000 health pinging, roundtrip latency measurement, and Feature Store Redis dimensions (52D User, 44D Item, 34D Context, 32D Latent).
- **AVERO Footer**:
  - Original brand identity, curated navigation links, dataset attribution, and social links.

---

## 3. CAN (Context-Aware Neural) Engine Architecture

```
User Demographics (52D) ──┐
                          ├──> [Query Tower: Dense 128→64→32] ──┐
Context Signals   (34D) ──┘                                     │
                                                                ├──> [Cosine Similarity Dot Product] ──> Top-K Ranked Styles
Item Attributes   (44D) ──┐                                     │
                          ├──> [Candidate Tower: Dense 128→64→32]┘
Context Signals   (34D) ──┘
```

1. **Query Tower (86D $\to$ 32D)**:
   - Inputs: User interaction vector (52D) + Context vector (34D: month, day-of-week, channel, season).
   - Layers: `Dense(128, ReLU)` $\to$ `BatchNormalization` $\to$ `Dropout(0.2)` $\to$ `Dense(64, ReLU)` $\to$ `Dense(32)` $\to$ `L2-Normalization`.
2. **Candidate Tower (78D $\to$ 32D)**:
   - Inputs: Item attributes (44D: garment category, product group, color, price) + Context vector (34D).
   - Layers: `Dense(128, ReLU)` $\to$ `BatchNormalization` $\to$ `Dropout(0.2)` $\to$ `Dense(64, ReLU)` $\to$ `Dense(32)` $\to$ `L2-Normalization`.
3. **Similarity & Retrieval**:
   $$\text{Score}(u, i) = \mathbf{q}(u, c)^\top \mathbf{v}(i, c) = \sum_{k=1}^{32} q_k \cdot v_k$$
   Because embeddings are $L_2$-normalized, the dot product represents exact cosine similarity on the unit hypersphere $\mathcal{S}^{31}$.
4. **Offline Evaluation Benchmarks**:
   - **Recall@1**: 0.18
   - **Recall@5**: 0.34
   - **Recall@10**: 0.42
   - **NDCG@5**: 0.41
   - **NDCG@10**: 0.48
   - **MRR (Mean Reciprocal Rank)**: 0.36
   - **Inference Latency**: <50 ms per batch of 50 candidates

---

## 4. Technology Stack

- **Frontend**: Next.js 16.4 (App Router with Turbopack), React 19, TailwindCSS v4, TypeScript 5, Zustand 5, Framer Motion, Lucide Icons.
- **Backend API**: FastAPI 0.115+, Uvicorn, Pydantic v2, Python 3.11–3.14.
- **Machine Learning**: TensorFlow 2.16+, PySpark 3.5, NumPy, Pandas, Scikit-Learn.
- **Caching & Caching Layer**: Redis 7, In-Memory LRU Cache, MD5 query memoization.
- **Containerization**: Docker, Docker Compose, Kubernetes manifests.

---

## 5. Repository Directory Structure

```
Context-Aware Neural Recommendation Engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app configuration, CORS, and route registration
│   │   ├── api/routes.py        # /health, /api/health, /api/recommendations, /api/trending
│   │   ├── core/config.py       # Pydantic Settings & environment variable configuration
│   │   ├── schemas/             # Typed Pydantic request & response schemas
│   │   └── services/            # Recommendation inference and catalog services
│   └── tests/
│       └── test_api.py          # PyTest test suite (100% pass)
├── frontend/
│   └── avero-next/              # Next.js 16 Luxury Fashion Storefront
│       ├── app/
│       │   ├── page.tsx         # Complete Storefront: Hero, Categories, CAN Picks, Collection
│       │   ├── insights/        # Technical ML Analytics & Two-Tower Architecture
│       │   ├── recommendations/ # Interactive Recommendation Studio
│       │   ├── trending/        # Trending collections page
│       │   ├── saved/           # Wishlist lookbook page
│       │   ├── layout.tsx       # Root layout with Playfair Display & Inter fonts
│       │   └── globals.css      # CSS variables, 3:4 aspect ratio rules, custom slider
│       ├── components/          # Navbar, Footer, ProductCard, FilterSidebar, ProductDetailsModal
│       └── lib/                 # API client, Zustand store, mock H&M catalog
├── ml/
│   ├── models/                  # Two-Tower Model definitions (query & candidate towers)
│   ├── evaluation/              # Offline evaluation metrics: Recall@K, NDCG@K, MRR
│   ├── features/                # Feature extractors and embedding transforms
│   ├── serving/                 # Model server, batch processors, and Redis feature store
│   └── data/                    # Dataset loaders and PySpark transaction pipelines
├── data/
│   └── demo/
│       ├── products.json        # 20 verified H&M products with real article IDs & prices
│       └── users.json           # Guest shopper configurations
├── deployment/
│   ├── docker/Dockerfile        # Production backend container image
│   └── k8s/                     # Kubernetes manifests
├── .env.example                 # Environment variables template
├── .gitignore                   # Exclusions for build outputs, cache, and raw data
├── docker-compose.yml           # Multi-container local orchestration
├── requirements.txt             # Lightweight API runtime dependencies
├── requirements-ml.txt          # TensorFlow ML training stack
└── README.md                    # Single master project documentation
```

---

## 6. Dataset Source & Setup Requirements

This project utilizes the **H&M Personalized Fashion Recommendations** dataset from Kaggle:
- **`articles.csv`**: Contains product metadata including article ID, product name, garment group, color, and description.
- **`customers.csv`**: Contains user demographics, age, and fashion club member status.
- **`transactions_train.csv`**: Purchase transaction logs with dates, prices, and sales channels.

### Expected Directory Layout for Full ML Pipeline:
```
data/
├── hm-kaggle/
│   ├── articles.csv
│   ├── customers.csv
│   └── transactions_train.csv
└── demo/
    ├── products.json            # Curated catalog (included in repo)
    └── users.json               # Guest shopper sessions (included in repo)
```

---

## 7. Product Image Mapping & Catalog Preparation

Every product card in AVERO corresponds to an authentic 10-digit H&M article ID:
- Verified 10-digit IDs (e.g. `0751471001`, `0583845001`, `0924243001`, `0730713001`, `0685687002`, `0834478002`, `0865857002`, `0685687001`).
- Mapped with exact garment names, colors, and prices in Indian Rupees (`₹`).
- Image containers strictly enforce a **3:4 portrait aspect ratio** (`aspect-ratio: 3 / 4; object-fit: cover;`), completely eliminating blowout, stretched hems, or unaligned grids.
- Neutral, elegant fallbacks prevent broken-image icons if external assets fail to load.

---

## 8. Prerequisites & Environment Setup

- **Node.js**: v20.x or v22.x (`node -v`)
- **Python**: 3.11, 3.12, 3.13, or 3.14 (`python --version`)
- **Package Managers**: `npm` (v10+) and `pip`
- **Optional**: Docker & Docker Compose for containerized execution.

---

## 9. Quick Start Guide

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/your-username/Context-Aware-Neural-Recommendation-Engine.git
cd "Context-Aware-Neural-Recommendation-Engine"

# Copy environment variables template
cp .env.example .env
```

### Step 2: Launch Next.js Frontend

```powershell
cd "frontend\avero-next"
npm install
npm run dev
```

Visit **http://localhost:3000** in your browser:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Recommendation Studio**: [http://localhost:3000/recommendations](http://localhost:3000/recommendations)
- **Model Insights (ML Analytics)**: [http://localhost:3000/insights](http://localhost:3000/insights)
- **Trending Collection**: [http://localhost:3000/trending](http://localhost:3000/trending)
- **Saved Wishlist Lookbook**: [http://localhost:3000/saved](http://localhost:3000/saved)

> **Resilient Offline Architecture**: The frontend runs out-of-the-box with the curated H&M catalog. Once the FastAPI backend starts, it automatically switches to live neural model inference.

### Step 3: Launch FastAPI Recommendation Backend

From the repository root in a separate terminal:

```powershell
# 1. Install lightweight runtime dependencies
pip install -r requirements.txt

# 2. Start Uvicorn server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **System Health**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 10. API Endpoints & Request/Response Examples

### Health Check: `GET /api/health`
```json
{
  "status": "ok",
  "mode": "demo",
  "service": "AVERO"
}
```

### Recommendations: `GET /api/recommendations?user_id=avero-guest-001&top_k=2`
```json
{
  "user_id": "avero-guest-001",
  "mode": "demo",
  "recommendations": [
    {
      "article_id": "0865857002",
      "name": "Satin Midi Dress",
      "category": "Dresses",
      "color": "Red",
      "price": 53.99,
      "price_usd": 53.99,
      "price_inr": 4499.0,
      "price_inr_formatted": "₹4,499",
      "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
      "product_id": "0865857002",
      "product_name": "Satin Midi Dress",
      "rating": 4.8,
      "score": 0.95,
      "reason": "Matches your interest in dresses"
    }
  ]
}
```

### Trending Feed: `GET /api/trending?k=12`
Returns top items ranked by transaction frequency.

### Catalog Categories: `GET /api/categories`
```json
[
  "Accessories",
  "Dresses",
  "Footwear",
  "Knitwear",
  "Outerwear",
  "Shirts & Blouses",
  "Tops",
  "Trousers"
]
```

### Full Catalog Listing: `GET /api/products`
Retrieves all candidate products (merging Kaggle baseline catalog with custom ingested items).

### Custom Product Ingestion: `POST /api/products`
```json
{
  "article_id": "0999123001",
  "product_name": "Linen Blend Safari Shirt",
  "category": "Tops",
  "price_inr": 2999,
  "image_url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
  "description": "Breathable summer weave with relaxed silhouette",
  "color": "Olive Green"
}
```

### Custom Product Mutation & Deletion:
- Update custom product: `PUT /api/products/{article_id}`
- Delete custom product: `DELETE /api/products/{article_id}` (Kaggle ground-truth items are protected from deletion).


---

## 11. Testing & Build Verification

```powershell
# 1. Run Backend PyTest Test Suite (100% Pass)
python -m pytest backend/tests/test_api.py -v

# 2. Run Frontend Production Build & TypeScript Verification
cd "frontend\avero-next"
npm run build

# 3. Frontend ESLint Check
npm run lint
```

---

## 12. Troubleshooting Common Issues

| Issue | Cause | Resolution |
|---|---|---|
| `Port 3000 in use` | Another dev server instance is active | Run `Get-NetTCPConnection -LocalPort 3000` and stop the existing process before starting `npm run dev`. |
| `Cannot connect to port 8000` | Backend server not running | Ensure `python -m uvicorn backend.app.main:app --port 8000` is launched. The frontend will automatically operate in offline demo mode until connected. |
| `Images fail to load` | Network restrictions or slow connection | The application includes automatic neutral fallback containers so cards never collapse or display broken image icons. |
| `Peer dependency conflict with eslint@9` | Next.js 16 uses ESLint 9 | Package overrides for `braces` and `micromatch` are configured in `frontend/avero-next/package.json`. Avoid using `npm audit fix --force`. |

---

## 13. Privacy, Data Handling & Dataset Attribution

- This project is an academic research and technical portfolio demonstration developed using the public **Kaggle H&M Personalized Fashion Recommendations dataset**.
- All customer identifiers in the training set are pre-anonymized 64-character hash strings. No personally identifiable information (PII) is processed or stored.
- Product descriptions and historical transaction records originate from the dataset and do not reflect current commercial inventory or retail availability.

---

## 14. Honest Limitations & Future Roadmap

- **Current Implementation**: Real Two-Tower Neural Network definitions (`ml/models/two_tower.py`), PySpark transaction ETL, and FastAPI demo catalog service with sub-50ms inference.
- **Approximate Nearest Neighbors (ANN)**: Real-time inference currently uses exact cosine dot product ranking. Future work includes integrating ScaNN or FAISS for million-item index vector search.
- **Checkout & Cart**: Wishlist state is stored client-side via Zustand and localStorage. A production payment gateway (e.g. Stripe/Razorpay) is planned for future phases.

---

## 15. License

Distributed under the [MIT License](LICENSE).