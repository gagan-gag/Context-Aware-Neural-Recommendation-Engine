# AVERO

AVERO is a context-aware e-commerce recommendation platform. This first milestone provides a runnable demo mode with a FastAPI service, typed recommendation responses, local demo catalog data, and a React dashboard shell.

## Quick start

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

Open `http://localhost:8000/docs` for the API documentation.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Docker

```powershell
docker compose up --build
```

The API will be available at `http://localhost:8000`; the dashboard at `http://localhost:5173`.

## Demo API

```text
GET /health
GET /api/v1/recommendations/demo-user-001?k=5
```

Demo mode reads only the checked-in JSON files under `data/demo`. H&M ingestion, model training, ANN retrieval, Redis feature serving, and Airflow are intentionally deferred to later milestones.

