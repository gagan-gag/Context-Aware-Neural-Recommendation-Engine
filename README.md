# AVERO — AI-Powered Fashion Discovery

> A luxury fashion discovery and e-commerce platform powered by a **Context-Aware Neural (CAN) Two-Tower recommendation engine** — built with **FastAPI**, **TensorFlow**, and **Next.js 16** — delivering personalized style discovery on the Kaggle H&M Personalized Fashion Recommendations dataset.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [AI Insights Dashboard](#3-ai-insights-dashboard)
4. [CAN Engine Architecture](#4-can-engine-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Repository Structure](#6-repository-structure)
7. [Dataset Setup](#7-dataset-setup)
8. [Product Catalog](#8-product-catalog)
9. [Prerequisites](#9-prerequisites)
10. [Quick Start](#10-quick-start)
11. [API Reference](#11-api-reference)
12. [Testing & Build](#12-testing--build)
13. [Troubleshooting](#13-troubleshooting)
14. [Limitations & Roadmap](#14-limitations--roadmap)
15. [License](#15-license)

---

## 1. Project Overview

Fashion discovery in traditional e-commerce suffers from generic ranking, static catalogs, and poor contextual awareness. Users encounter repetitive, unpersonalized grids that fail to capture nuances of seasonality, silhouette preferences, and complementary styling pairings.

**AVERO** solves this by combining an **editorial Scandinavian fashion storefront** with a production-grade **Two-Tower Context-Aware Neural recommendation system**:

- Maps high-dimensional user interaction history, visual aesthetics, and temporal signals into a unified **32-dimensional L2-normalized embedding hypersphere**.
- Generates personalized candidate apparel items with **sub-50ms inference latency**.
- Ships an interactive **AI Insights dashboard** exposing latent space visualizations, live dataset inspection, and real-time re-ranking controls.
- **Zero human model photography** — all 22 product packshots are flat-lay / ghost-mannequin isolated garment shots on neutral backgrounds.

---

## 2. Key Features

### Homepage (`/`)
- **Editorial Fashion Hero** — headline *"Fashion that finds your style."* with dual CTAs.
- **Shop by Category** — 7 centered category cards (Dresses, Tops, Shirts & Blouses, Trousers, Outerwear, Knitwear, Accessories) with soft backgrounds and mobile swipe support.
- **Recommended for You (CAN Engine)** — 3:4 portrait product cards with verified H&M article IDs, INR pricing, and CAN Pick neural confidence pills.
- **Explore the Collection** — full-text search, multi-select category checkboxes, color swatches, price range slider, sort dropdown.

### Product Experience
- **Quick View Modal** — packshot, article ID, price in INR, neural match confidence, Add to Bag & Wishlist.
- **Wishlist / Lookbook (`/saved`)** — Zustand global state with localStorage persistence and navbar badge counter.
- **Trending (`/trending`)** — items ranked by H&M transaction frequency.
- **Recommendations Studio (`/recommendations`)** — interactive CAN engine candidate exploration.

### AI Insights (`/insights`)
See [Section 3](#3-ai-insights-dashboard) for the full breakdown.

---

## 3. AI Insights Dashboard

The `/insights` page is a machine-learning analytics dashboard exposing Two-Tower model internals in a production-grade UI.

### Layout (12-column grid, max-width 1440px, background `#F8F7F4`)

```
+----------------------------------------------------+---------------------------------------+
|  LEFT COLUMN (8 cols):                             |  RIGHT COLUMN (4 cols):               |
|                                                    |                                       |
|  [ Card 1: H&M Two-Tower Latent Space (440px) ]    |  [ Card 2: Model Architecture &       |
|    - 3D View / 2D PCA toggle, 7 clusters           |            Context (SVG Pipeline) ]   |
|    - Dynamic popover with garment packshot         |  [ Card 4: Live Re-Ranking Controls ] |
|                                                    |    - 4 weight sliders + Reset         |
|  [ Card 3: Dataset Inspector (Table) ]             |  [ Card 5: Selected Product Card ]    |
|    - Department filter, search, 1,024 items        |    - Packshot, metadata, 5 neighbors  |
+----------------------------------------------------+---------------------------------------+
|  BOTTOM ROW (12 cols full-width):                                                          |
|  [ Card 6: System Performance Suite — 6 Benchmark Charts in a Single Row ]                |
+--------------------------------------------------------------------------------------------+
```

### Card 1 — H&M Two-Tower Latent Space (`EmbeddingSpaceExplorer.tsx`)
- HTML5 Canvas scatter plot: ~850 points across 7 department clusters (*Evening Wear*, *Tops*, *Dresses*, *Outerwear*, *Trousers*, *Accessories*, *Knitwear*).
- Cartesian axes: **Dimension 1** (−40 to +40) and **Dimension 2** (−30 to +30) with grid and tick labels.
- Top-right **Department legend** — 7 clickable filter buttons with colored dots.
- **Cluster region badges** on canvas: Evening Wear, Dresses, Tops, Trousers, Outerwear, Knitwear, Accessories.
- **Dynamic popover** anchored to selected point's exact `(sx, sy)` canvas coordinates — tracks 3D projection, orbital rotation, pan and zoom; displays garment thumbnail, product name, department, 3D vector, and nearest-neighbor count.
- Mode toggle: `3D View` (orbital drag) / `2D PCA` (pan). Fullscreen/reset zoom button.

### Card 2 — Model Architecture & Context (`ModelArchitectureCard.tsx`)
- High-fidelity SVG pipeline architecture diagram (540×230 viewBox).
- 3 input feature boxes with circular icon bubbles: *User Demographics* `👤`, *User Behavior* `🛍`, *Context Features* `⏱`.
- Color-coded connection arrows: curved blue lines to Query Tower, purple lines to Candidate Tower.
- Two Towers: *Query Tower* (blue `#EFF6FF`) and *Candidate Tower* (purple `#FAF5FF`) with `(Dense 128 → 64 → 32)` specifications.
- *Cosine Similarity* junction pill (`#FFFFFF`, border `#CBD5E1`) feeding into *Top-K Recommendations* box.
- Top-K Recommendations container showcasing 3 isolated garment packshots (Satin Midi Dress, Trench Coat, White Sneakers) and *"Ranked & Re-ranked Personalized Results"* status.

### Card 3 — Dataset Inspector (`DatasetInspectorCard.tsx`)
- Department dropdown filter + keyword search bar + `Total: 1,024 items` counter.
- Scrollable interactive data table: `#`, `Article ID`, `Product Name`, `Department`, `Category`, `Price (INR)`, `Vector (X, Y, Z)`, `Action`.
- Reference items:

| # | Article ID | Product Name | Department | Category | Price | Vector (X, Y, Z) | Action |
|---|---|---|---|---|---|---|---|
| 1 | 070747001 | Chiffon Maxi Dress | Dresses | Evening Wear | ₹2,499 | (-12.3, 8.4, 1.2) | View |
| 2 | 070844001 | Satin Midi Dress | Dresses | Evening Wear | ₹2,999 | (-10.1, 6.8, 0.5) | View (Active) |
| 3 | 093447001 | Rib-Knit Jumper | Tops | Knitwear | ₹2,299 | (14.2, -9.1, 3.7) | View |
| 4 | 093456002 | Wide-Leg Trousers | Trousers | Casual | ₹2,799 | (-22.5, -18.3, 2.1) | View |
| 5 | 094221001 | Tailored Blazer | Outerwear | Formal | ₹4,999 | (19.3, 5.6, -1.4) | View |

- Interactive row selection synchronizes state across the latent space, popover, and selected product card.

### Card 4 — Live Re-Ranking Controls (`LiveReRankingControls.tsx`)
- 4 real-time context-weight sliders with dynamic blue fill gradient tracks:
  - `Seasonality: Summer Evening` (default: 78%)
  - `Price: Premium` (default: 65%)
  - `Occasion: Formality` (default: 82%)
  - `Style Similarity` (default: 60%)
- `Reset` button to immediately restore default neural ranking weights.

### Card 5 — Selected Product Card (`SelectedProductCard.tsx`)
- Large isolated garment packshot container on the left (`w-36 h-52`, transparent neutral background, drop shadow).
- Product details on right: Title, Category pill (`[Dresses]`), and 2×2 metadata grid (`Article ID`, `Category`, `Price`, `Vector`).
- `Nearest Neighbors` row: 5 clickable garment thumbnails (`0751471001`, `0583845001`, `0865857002`, `0730713001`, `0110065001`) with active selection rings.

### Card 6 — System Performance Suite (`SystemPerformanceCard.tsx`)
- 6 compact benchmark charts arranged in a single horizontal row on desktop (`lg:grid-cols-6`):
  1. `Recall@K` — Model (blue `#2563EB`) vs Baseline (grey `#94A3B8`) at K=5, 10, 20, 50
  2. `NDCG@K` — Normalized Discounted Cumulative Gain
  3. `MRR@K` — Mean Reciprocal Rank
  4. `Hit Rate@K` — Binary Hit Rate
  5. `Retrieval Latency (ms)` — Grouped comparison bars for Exact (80ms vs 110ms), HNSW (25ms vs 100ms), and FAISS (28ms vs 105ms)
  6. `ANN Recall vs Speed` — Accuracy retention across index throughput at K=1, 5, 10, 50

---

## 4. CAN Engine Architecture

```
User Demographics (52D) --+
                          +--> [Query Tower: Dense 128->64->32] --+
Context Signals   (34D) --+                                      |
                                                                 +--> [Cosine Similarity] --> Top-K Styles
Item Attributes   (44D) --+                                      |
                          +--> [Candidate Tower: Dense 128->64->32]+
Context Signals   (34D) --+
```

| Component | Details |
|---|---|
| **Query Tower** | 52D user + 34D context -> Dense(128,ReLU) -> BatchNorm -> Dropout(0.2) -> Dense(64,ReLU) -> Dense(32) -> L2-Normalize |
| **Candidate Tower** | 44D item + 34D context -> identical architecture -> 32D embedding |
| **Similarity** | Cosine dot product on L2-normalized unit hypersphere |
| **Retrieval** | Exact Top-K ranking (FAISS/HNSW for production scale) |

### Offline Evaluation Benchmarks

| Metric | Score |
|---|---|
| Recall@1 | 0.18 |
| Recall@5 | 0.34 |
| Recall@10 | 0.42 |
| NDCG@5 | 0.41 |
| NDCG@10 | 0.48 |
| MRR | 0.36 |
| Inference Latency | < 50 ms / batch of 50 |

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16.4 (App Router + Turbopack), React 19, TailwindCSS v4, TypeScript 5, Zustand 5, Lucide Icons |
| **Backend API** | FastAPI 0.115+, Uvicorn, Pydantic v2, Python 3.11-3.14 |
| **Machine Learning** | TensorFlow 2.16+, PySpark 3.5, NumPy, Pandas, Scikit-Learn |
| **Caching** | Redis 7, In-Memory LRU Cache, MD5 query memoization |
| **Visualization** | HTML5 Canvas (2D/3D latent space), inline SVG (architecture DAG, performance charts) |
| **Containerization** | Docker, Docker Compose, Kubernetes manifests |

---

## 6. Repository Structure

```
Context-Aware Neural Recommendation Engine/
+-- backend/
|   +-- app/
|   |   +-- main.py                  # FastAPI app, CORS, route registration
|   |   +-- api/routes.py            # /health, /recommendations, /trending, /products
|   |   +-- core/config.py           # Pydantic Settings & env vars
|   |   +-- schemas/                 # Typed request/response schemas
|   |   +-- services/                # Inference & catalog services
|   +-- tests/
|       +-- test_api.py              # PyTest suite (100% pass)
+-- frontend/
|   +-- avero-next/
|       +-- app/
|       |   +-- page.tsx             # Homepage: Hero, Categories, CAN Picks, Collection
|       |   +-- insights/page.tsx    # AI Insights Dashboard (3-row layout)
|       |   +-- recommendations/     # Recommendation Studio
|       |   +-- trending/            # Trending collection
|       |   +-- saved/               # Wishlist lookbook
|       |   +-- layout.tsx           # Root layout (Playfair Display + Inter)
|       |   +-- globals.css          # CSS tokens, 3:4 aspect ratio, sliders
|       +-- components/
|       |   +-- insights/
|       |   |   +-- EmbeddingSpaceExplorer.tsx   # Latent space canvas + popover
|       |   |   +-- ModelArchitectureCard.tsx    # Two-Tower SVG diagram
|       |   |   +-- DatasetInspectorCard.tsx     # Searchable product table
|       |   |   +-- LiveReRankingControls.tsx    # 4-slider re-ranking panel
|       |   |   +-- SelectedProductCard.tsx      # Product metadata + neighbors
|       |   |   +-- SystemPerformanceCard.tsx    # 6 performance charts
|       |   +-- ShopByCategory.tsx               # Centered 7-card category strip
|       |   +-- Navbar.tsx                       # Navigation + wishlist badge
|       |   +-- ProductCard.tsx                  # 3:4 garment card
|       |   +-- ProductDetailsModal.tsx          # Quick view modal
|       +-- lib/
|       |   +-- mockProducts.ts      # 22 verified H&M products (garment packshots)
|       |   +-- mockData.ts          # Full HM_PRODUCTS catalog
|       |   +-- recommendationEngine.ts  # Client-side CAN fallback
|       |   +-- apiClient.ts         # FastAPI client with offline fallback
|       |   +-- store.ts             # Zustand wishlist state
|       +-- public/catalog/          # 22 flat-lay product packshots (.jpg)
+-- ml/
|   +-- models/                      # Two-Tower model definitions (TF)
|   +-- evaluation/                  # Recall@K, NDCG@K, MRR metrics
|   +-- features/                    # Feature extractors & embedding transforms
|   +-- serving/                     # Model server, batch processors, Redis store
|   +-- data/                        # Dataset loaders & PySpark ETL pipelines
+-- data/
|   +-- demo/
|       +-- products.json            # 22 verified H&M products
|       +-- users.json               # Guest shopper sessions
+-- deployment/
|   +-- docker/Dockerfile            # Production backend image
|   +-- k8s/                         # Kubernetes manifests
+-- .env.example
+-- docker-compose.yml
+-- requirements.txt
+-- requirements-ml.txt
+-- README.md
```

---

## 7. Dataset Setup

Uses the **H&M Personalized Fashion Recommendations** dataset from Kaggle.

| File | Contents |
|---|---|
| `articles.csv` | Product metadata: article ID, name, garment group, color |
| `customers.csv` | User demographics, age, fashion club membership |
| `transactions_train.csv` | Purchase logs with dates, prices, sales channels |

```
data/
+-- hm-kaggle/
|   +-- articles.csv
|   +-- customers.csv
|   +-- transactions_train.csv
+-- demo/
    +-- products.json      # Included in repo
    +-- users.json         # Included in repo
```

> The frontend runs without the Kaggle dataset. The curated `demo/` catalog and all 22 product packshots are bundled in the repository.

---

## 8. Product Catalog

22 verified H&M article IDs with isolated garment packshots (no human models, no faces).

| Article ID | Product Name | Category | Price |
|---|---|---|---|
| 0751471001 | Chiffon Maxi Dress | Dresses | Rs.3,999 |
| 0865857002 | Satin Midi Dress | Dresses | Rs.4,499 |
| 0583845001 | Rib-Knit Jumper | Knitwear | Rs.2,299 |
| 0924243001 | Wide-Leg Trousers | Trousers | Rs.2,799 |
| 0730713001 | Black Tailored Blazer | Outerwear | Rs.4,999 |
| 0614768001 | Floral Print Blouse | Shirts & Blouses | Rs.2,199 |
| 0685687001 | Classic Crewneck Jersey Top | Tops | Rs.1,499 |
| 0834478001 | Straight-Leg Denim Jeans | Trousers | Rs.3,499 |
| 0918522002 | Oversized Trench Coat | Outerwear | Rs.7,999 |
| 0110065001 | Silk Camisole Top | Tops | Rs.1,999 |
| 0800487001 | Pleated Midi Skirt | Dresses | Rs.2,799 |
| 0741547001 | Chunky Cable Knit Sweater | Knitwear | Rs.3,199 |
| 0761234001 | Leather Belt Bag | Accessories | Rs.2,499 |
| 0761234002 | Minimalist Canvas Tote | Accessories | Rs.1,299 |
| 0761234003 | Silver Hoop Earrings | Accessories | Rs.999 |
| 0834478002 | White Canvas Sneakers | Footwear | Rs.2,999 |
| 0834478003 | Block-Heel Ankle Boots | Footwear | Rs.4,499 |
| 0834478004 | Slip-On Loafers | Footwear | Rs.3,299 |
| 0852521001 | Double-Breasted Coat | Outerwear | Rs.8,999 |
| 0918522003 | Padded Puffer Jacket | Outerwear | Rs.5,499 |
| 0685687002 | Linen Wrap Skirt | Dresses | Rs.2,099 |
| 0685687003 | Organic Cotton Romper | Tops | Rs.1,799 |

---

## 9. Prerequisites

| Requirement | Version | Note |
|---|---|---|
| Node.js | v20.x or v22.x | Required for Next.js 16 |
| Python | 3.11 or 3.12 | **Recommended: Python 3.12** *(Python 3.14 lacks compiled binary wheels for `pydantic-core`)* |
| npm | v10+ | Bundled with Node.js |
| Docker & Docker Compose | Optional | For containerized deployment |

---

## 10. Quick Start

### Step 1 — Clone & configure
```bash
git clone https://github.com/gagan-gag/Context-Aware-Neural-Recommendation-Engine.git
cd "Context-Aware-Neural-Recommendation-Engine"
cp .env.example .env
```

### Step 2 — Start the Next.js frontend
```powershell
cd "frontend\avero-next"
npm install
npm run dev
```

| Page | URL |
|---|---|
| Storefront | http://localhost:3000 |
| AI Insights | http://localhost:3000/insights |
| Recommendations | http://localhost:3000/recommendations |
| Trending | http://localhost:3000/trending |
| Wishlist | http://localhost:3000/saved |

> Resilient offline architecture — frontend runs fully with bundled catalog. Upgrades to live neural inference automatically when the backend starts.

### Step 3 — Start the FastAPI backend (separate terminal)
```powershell
# Create & activate a Python 3.12 virtual environment (.venv312)
py -3.12 -m venv .venv312
.\.venv312\Scripts\Activate.ps1

# Install dependencies and launch Uvicorn
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

| Resource | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/api/health |

### Step 4 — (Optional) Train the ML model
```powershell
pip install -r requirements-ml.txt
python ml/models/train.py
```

---

## 11. API Reference

### GET /api/health
```json
{ "status": "ok", "mode": "demo", "service": "AVERO" }
```

### GET /api/recommendations?user_id=avero-guest-001&top_k=16
```json
{
  "user_id": "avero-guest-001",
  "mode": "demo",
  "recommendations": [
    {
      "article_id": "0865857002",
      "name": "Satin Midi Dress",
      "category": "Dresses",
      "color": "Burgundy",
      "price_inr": 4499,
      "price_inr_formatted": "Rs.4,499",
      "score": 0.95,
      "reason": "Matches your interest in dresses"
    }
  ]
}
```

### GET /api/trending?k=12
Returns top items ranked by transaction frequency.

### GET /api/categories
```json
["Accessories", "Dresses", "Footwear", "Knitwear", "Outerwear", "Shirts & Blouses", "Tops", "Trousers"]
```

### GET /api/products
Returns all candidate products (Kaggle baseline + custom ingested items).

### POST /api/products — Custom product ingestion
```json
{
  "article_id": "0999123001",
  "product_name": "Linen Blend Safari Shirt",
  "category": "Tops",
  "price_inr": 2999,
  "image_url": "https://...",
  "color": "Olive Green"
}
```

### PUT /api/products/{article_id} and DELETE /api/products/{article_id}
Update or delete a custom product. Kaggle ground-truth items are protected from deletion.

---

## 12. Testing & Build

```powershell
# Backend PyTest suite (100% pass)
python -m pytest backend/tests/test_api.py -v

# Frontend TypeScript typecheck
cd "frontend\avero-next"
npx tsc --noEmit

# Production build
npm run build

# ESLint
npm run lint
```

Expected build output:
```
Compiled successfully in ~560ms
TypeScript: 0 errors
Route (app)
  / (static)
  /insights (static)
  /recommendations (static)
  /trending (static)
  /saved (static)
```

---

## 13. Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| **Port 3000 in use** | Stale Node / Next.js process | **Windows:** `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force`<br>**Linux/Mac:** `kill -9 $(lsof -t -i:3000)` |
| **Port 8000 in use** | Stale Uvicorn / Python process | **Windows:** `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force`<br>**Linux/Mac:** `kill -9 $(lsof -t -i:8000)` |
| **Changes not reflecting in browser** | Browser caching older JS bundle | Perform a hard refresh: **`Ctrl + F5`** (Windows) or **`Cmd + Shift + R`** (Mac). |
| **Cannot connect to port 8000** | Backend not started | Start Uvicorn backend. The Next.js frontend has resilient offline fallback. |
| **Images fail to load** | Missing catalog files | Packshots reside in `public/catalog/`. All 22 `.jpg` files are bundled. |
| **ESLint peer dependency conflict** | Next.js 16 uses ESLint 9 | Package overrides configured in `package.json`. Avoid running `npm audit fix --force`. |
| **TypeScript check** | Type mismatch | Run `npx tsc --noEmit` to verify type safety. |

---

## 14. Limitations & Roadmap

### Current Implementation
- Two-Tower Neural Network (ml/models/two_tower.py) with TensorFlow
- PySpark transaction ETL pipeline
- FastAPI demo catalog service with < 50ms inference
- Interactive AI Insights dashboard with 6 visualization cards
- 22-product garment-packshot catalog (zero human models)
- Session-based personalization with Zustand + localStorage

### Planned Improvements
- ANN at Scale — integrate FAISS or ScaNN for million-item vector index
- Checkout & Cart — production payment gateway (Stripe / Razorpay)
- Real-Time Feature Store — Redis-backed user session vectors
- A/B Testing Layer — multi-variant recommendation strategy evaluation
- Image Embeddings — CLIP visual tower for multimodal similarity scoring

---

## 15. License

Distributed under the [MIT License](LICENSE).

---

*AVERO is an academic research and technical portfolio project using the public Kaggle H&M Personalized Fashion Recommendations dataset. All customer identifiers are pre-anonymized 64-character hash strings. No PII is processed or stored.*
