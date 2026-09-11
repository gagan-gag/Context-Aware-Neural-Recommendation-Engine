from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_is_available() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "mode": "demo", "service": "RecomNova"}


def test_recommendations_return_typed_demo_results() -> None:
    response = client.get("/api/v1/recommendations/demo-user-001?k=2")
    payload = response.json()
    assert response.status_code == 200
    assert payload["user_id"] == "demo-user-001"
    assert len(payload["recommendations"]) == 2
    assert payload["recommendations"][0]["category"] == "Dresses"


def test_unknown_user_returns_not_found() -> None:
    assert client.get("/api/v1/recommendations/unknown-user").status_code == 404


def test_invalid_k_is_rejected() -> None:
    assert client.get("/api/v1/recommendations/demo-user-001?k=0").status_code == 422
