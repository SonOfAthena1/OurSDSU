import pymysql


def test_db_health_returns_query_result_and_closes_connection(client, mock_db):
    mock_db.cursor.fetchone.return_value = {"connected": 1}

    response = client.get("/db-health")

    assert response.status_code == 200
    assert response.json() == {"connected": 1}
    mock_db.connect.assert_called_once_with()
    mock_db.cursor.execute.assert_called_once_with("SELECT 1 AS connected")
    mock_db.cursor.fetchone.assert_called_once_with()
    mock_db.connection.close.assert_called_once_with()


def test_db_health_returns_503_when_connection_fails(client, mock_db):
    mock_db.connect.side_effect = pymysql.OperationalError(
        2003, "Private database connection details"
    )

    response = client.get("/db-health")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Could not connect to the local MySQL database."
    }
    mock_db.connection.close.assert_not_called()


def test_db_health_closes_connection_when_query_fails(client, mock_db):
    mock_db.cursor.execute.side_effect = pymysql.OperationalError(
        2013, "Lost connection during query"
    )

    response = client.get("/db-health")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Could not connect to the local MySQL database."
    }
    mock_db.cursor.fetchone.assert_not_called()
    mock_db.connection.close.assert_called_once_with()
