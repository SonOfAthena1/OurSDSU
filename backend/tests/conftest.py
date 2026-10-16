from types import SimpleNamespace
from unittest.mock import MagicMock, Mock

import pytest
from app import main
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def block_real_database_connections(monkeypatch):
    """Fail if a test accidentally attempts a real MySQL connection."""
    monkeypatch.setattr(
        "app.db.pymysql.connect",
        Mock(side_effect=AssertionError("Use the mock_db fixture for database tests.")),
    )


@pytest.fixture
def mock_db(monkeypatch):
    """Replace the route's database connection with configurable test doubles."""
    cursor = MagicMock(
        spec=["__enter__", "__exit__", "execute", "fetchone", "fetchall"]
    )
    cursor.__enter__.return_value = cursor
    cursor.__exit__.return_value = False

    connection = MagicMock(spec=["cursor", "close"])
    connection.cursor.return_value = cursor
    connect = Mock(return_value=connection)

    # Patch where the route uses the function, rather than its original definition.
    monkeypatch.setattr(main, "get_db_connection", connect)

    return SimpleNamespace(connect=connect, connection=connection, cursor=cursor)


@pytest.fixture
def client():
    """Give each test a client that calls the app without starting a server."""
    with TestClient(app) as test_client:
        yield test_client
