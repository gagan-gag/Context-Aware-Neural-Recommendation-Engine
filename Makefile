.PHONY: api test frontend-build up

api:
	uvicorn backend.app.main:app --reload

test:
	pytest

frontend-build:
	cd frontend && npm run build

up:
	docker compose up --build

