def test_root_returns_backend_message(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "OurSDSU backend is running"}


def test_health_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
