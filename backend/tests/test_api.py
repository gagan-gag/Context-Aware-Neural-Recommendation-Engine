from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_is_available() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "mode": "demo",
        "service": "AVERO",
    }


def test_api_health_is_available() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


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


def test_list_products_returns_catalog() -> None:
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 10


def test_create_and_delete_custom_product() -> None:
    test_article_id = "test-custom-item-999"

    # 1. Create custom product
    create_payload = {
        "article_id": test_article_id,
        "name": "Sculpted Cashmere Wrap",
        "category": "Knitwear",
        "color": "Oatmeal",
        "price": 89.99,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
        "description": "Hand-spun Italian cashmere with draped neckline."
    }
    create_resp = client.post("/api/products", json=create_payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["article_id"] == test_article_id
    assert created["is_custom"] is True

    # 2. Duplicate prevention test
    dup_resp = client.post("/api/products", json=create_payload)
    assert dup_resp.status_code == 400

    # 3. Clean up by deleting
    del_resp = client.delete(f"/api/products/{test_article_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "deleted"
