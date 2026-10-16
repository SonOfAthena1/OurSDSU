import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Give each test a client that calls the app without starting a server."""
    with TestClient(app) as test_client:
        yield test_client
