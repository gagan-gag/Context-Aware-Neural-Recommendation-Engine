# AVERO — Context-Aware Neural Recommendation Engine
# Makefile — common dev & deployment shortcuts

.PHONY: help dev dev-backend dev-frontend build up down logs test clean k8s-apply k8s-delete

DOCKER_COMPOSE := docker compose
K8S_DIR := deployment/k8s

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Local Development ─────────────────────────────────────────────────────────
dev: ## Start both backend and frontend in dev mode (requires two terminals)
	@echo "Starting AVERO in development mode..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@start /b cmd /c "cd frontend\avero-next && npm run dev"
	@python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

dev-backend: ## Start FastAPI backend only
	python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend: ## Start Next.js frontend only
	cd frontend/avero-next && npm run dev

# ── Docker Compose ────────────────────────────────────────────────────────────
build: ## Build all Docker images
	$(DOCKER_COMPOSE) build

up: ## Start all services (Redis + API + Frontend)
	$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo " AVERO is starting..."
	@echo "   Frontend : http://localhost:3000"
	@echo "   API      : http://localhost:8000"
	@echo "   API Docs : http://localhost:8000/docs"

down: ## Stop all services
	$(DOCKER_COMPOSE) down

logs: ## Tail logs for all services
	$(DOCKER_COMPOSE) logs -f

logs-api: ## Tail API logs
	$(DOCKER_COMPOSE) logs -f api

logs-frontend: ## Tail frontend logs
	$(DOCKER_COMPOSE) logs -f frontend

restart: ## Restart all services
	$(DOCKER_COMPOSE) restart

# ── Testing ───────────────────────────────────────────────────────────────────
test: ## Run Python tests
	pytest -q --tb=short ml/tests/ backend/tests/ -v

test-docker: ## Run tests inside Docker
	$(DOCKER_COMPOSE) --profile testing run --rm spark-tests

test-frontend: ## Run Next.js type-check
	cd frontend/avero-next && npx tsc --noEmit

# ── Kubernetes ────────────────────────────────────────────────────────────────
k8s-apply: ## Apply all K8s manifests
	kubectl apply -f $(K8S_DIR)/namespace.yaml
	kubectl apply -f $(K8S_DIR)/redis.yaml
	kubectl apply -f $(K8S_DIR)/backend.yaml
	kubectl apply -f $(K8S_DIR)/frontend.yaml
	kubectl apply -f $(K8S_DIR)/ingress.yaml
	@echo "AVERO deployed to Kubernetes namespace: avero"

k8s-delete: ## Delete all K8s resources
	kubectl delete namespace avero --ignore-not-found=true

k8s-status: ## Check K8s deployment status
	kubectl get all -n avero

k8s-logs-api: ## Stream API pod logs
	kubectl logs -n avero -l app=avero-api -f

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove Docker containers, volumes, and build artifacts
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f
	cd frontend/avero-next && rm -rf .next node_modules/.cache
