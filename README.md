# AVERO — Context-Aware Neural Recommendation Engine

> **AI-powered, real-time fashion recommendation engine** built with FastAPI + TensorFlow + Next.js 14 — delivering hyper-personalized H&M product picks at sub-50 ms latency.

---

## ✨ Features

| Layer | Technology | Highlights |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) · React 18 · TailwindCSS · Framer Motion | SSR, luxury design, zero-blink image loading |
| **Backend** | FastAPI · Python 3.12–3.14 · Uvicorn | `/health` + `/api/v1/recommendations/{user_id}` |
| **ML Engine** | TensorFlow · TF-Recommenders · Collaborative Filtering | Context-aware neural scoring |
| **Cache** | Redis 7 | Sub-ms response caching |
| **Infra** | Docker Compose · Kubernetes · Nginx Ingress | HPA, rolling updates, containerized |

---

## 🚀 How to Run — Quick Start

### Prerequisites

- **Node.js 20+** (`node -v`)
- **Python 3.11+** (`python --version`)
- **Git**

---

### Method 1: Local Development (Recommended)

Run the backend and frontend in two separate terminals.

#### Terminal 1 — Start Frontend (Next.js)

```powershell
cd "frontend\avero-next"
npm install
npm run dev
```

- **Frontend URL:** [http://localhost:3000](http://localhost:3000)
- *Note:* The UI runs in high-fidelity offline/demo mode with 16 curated H&M products even if the backend is not yet started.

#### Terminal 2 — Start Backend (FastAPI)

From the project root:

```powershell
# 1. Install API dependencies (Python 3.12 – 3.14 compatible)
pip install -r requirements.txt

# 2. Launch FastAPI with Uvicorn
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **API Base:** [http://localhost:8000](http://localhost:8000)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health) → `{"status": "healthy"}`
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Recommendations Endpoint:** [http://localhost:8000/api/recommendations?user_id=test&top_k=12](http://localhost:8000/api/recommendations?user_id=test&top_k=12)
- **Trending Endpoint:** [http://localhost:8000/api/trending](http://localhost:8000/api/trending)
- **Categories Endpoint:** [http://localhost:8000/api/categories](http://localhost:8000/api/categories)
- **Demo User Route:** [http://localhost:8000/api/v1/recommendations/demo-user-001?k=10](http://localhost:8000/api/v1/recommendations/demo-user-001?k=10)

All recommendation endpoints return strictly formatted INR (`₹`) prices with match relevance score, category, and high-resolution product imagery.

Once the backend is live, the frontend's system status banner automatically turns **green**, streaming live recommendations.


---

### Method 2: Docker Compose (All-in-One Stack)

Runs **Redis 7 + FastAPI Backend + Next.js Frontend** together in containers:

```bash
# Build all service images
docker compose build

# Start services in the background
docker compose up -d

# View live logs
docker compose logs -f

# Stop and remove containers
docker compose down
```

| Service | Address |
|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Redis Cache** | `localhost:6379` |

---

### Method 3: Kubernetes Deployment

Deploy to Minikube, EKS, GKE, or AKS using the manifests in [`deployment/k8s`](deployment/k8s):

```bash
# 1. Build container images
docker build -t avero-api:latest -f deployment/docker/Dockerfile .
docker build -t avero-frontend:latest ./frontend/avero-next

# 2. Apply all Kubernetes manifests
kubectl apply -f deployment/k8s/namespace.yaml
kubectl apply -f deployment/k8s/redis.yaml
kubectl apply -f deployment/k8s/backend.yaml
kubectl apply -f deployment/k8s/frontend.yaml
kubectl apply -f deployment/k8s/ingress.yaml

# 3. Check status
kubectl get all -n avero
```

Or using the Makefile shortcut:
```bash
make k8s-apply
make k8s-status
```

---

## 👥 Demo Users

The backend demo mode provides pre-configured profiles in [`data/demo/users.json`](data/demo/users.json):

| User ID | Name | Preferred Category | Sample Endpoint |
|---|---|---|---|
| `demo-user-001` | Aarav | Dresses | `http://localhost:8000/api/v1/recommendations/demo-user-001?k=10` |
| `demo-user-002` | Maya | Shirts | `http://localhost:8000/api/v1/recommendations/demo-user-002?k=10` |

---

## 🧪 Testing & Validation

Run the test suite across both frontend and backend:

```powershell
# 1. Python API tests (Health, recommendations, 404 validation, query params)
python -m pytest -q backend/

# 2. Frontend TypeScript type-safety check
cd frontend/avero-next
npx tsc --noEmit
```

---

## 🛠️ Python Requirements Reference

We provide modular requirements files to support modern Python versions cleanly:

- [`requirements.txt`](requirements.txt) / [`requirements-api.txt`](requirements-api.txt): Lightweight FastAPI, Uvicorn, Pydantic, Redis, and test stack. Compatible with **Python 3.12, 3.13, and 3.14**.
- [`requirements-ml.txt`](requirements-ml.txt): Full offline model training pipeline (TensorFlow 2.16+, TF-Recommenders, PySpark, Airflow). Requires **Python ≤ 3.12** due to TensorFlow wheel constraints.

---

## ❓ Troubleshooting

### 1. Port 8000 Already In Use (`WinError 10013` / `WinError 10048`)
If another process is bound to port 8000:
```powershell
netstat -ano | findstr :8000
Stop-Process -Id <PID> -Force
```

### 2. Frontend Cannot Reach Backend
Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000` is set in `frontend/avero-next/.env.local` and that the FastAPI backend is running. The frontend auto-retries health checks every 5 seconds.

### 3. TensorFlow Wheels on Python 3.14
TensorFlow does not currently supply prebuilt wheels for Python 3.14. To run the API, use `requirements.txt` (which runs without TensorFlow in high-performance demo mode). If training models with TensorFlow, create a Python 3.12 virtual environment:
```powershell
py -3.12 -m venv .venv-ml
.venv-ml\Scripts\activate
pip install -r requirements-ml.txt
```

---

## 📁 Repository Structure

```
Context-Aware Neural Recommendation Engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS configuration
│   │   ├── api/routes.py        # /health + /recommendations endpoints
│   │   ├── core/config.py       # Pydantic Settings
│   │   ├── schemas/             # Typed Pydantic request/response schemas
│   │   └── services/            # Recommendation scoring & catalog loader
│   └── tests/                   # Backend API test suite
├── frontend/
│   └── avero-next/              # Next.js 14 App Router application
│       ├── app/                 # Pages (/, /recommendations)
│       ├── components/          # Luxury ProductCard, FilterSidebar, HeroSection
│       └── lib/                 # Mock catalog, API client, Zustand store
├── data/
│   └── demo/                    # Curated demo products & users JSON
├── deployment/
│   ├── docker/Dockerfile        # Multi-stage production backend Dockerfile
│   └── k8s/                     # Kubernetes manifests (namespace, redis, backend, frontend, ingress)
├── docker-compose.yml           # Multi-container orchestration
├── Makefile                     # Developer shortcuts
├── requirements.txt             # API runtime dependencies
├── requirements-ml.txt          # Offline ML training stack
└── README.md                    # Documentation
```

---

## 📜 License

[MIT](LICENSE)