import pymysql
import pytest


@pytest.mark.parametrize(
    "query",
    [
        pytest.param("", id="missing-semester"),
        pytest.param("?semester_id=", id="empty-semester"),
        pytest.param("?semester_id=abc", id="non-integer-semester"),
        pytest.param("?semester_id=0", id="zero-semester"),
        pytest.param("?semester_id=-1", id="negative-semester"),
        pytest.param("?semester_id=1,2", id="comma-separated-semesters"),
        pytest.param("?semester_id=1&semester_id=abc", id="mixed-valid-and-invalid"),
    ],
)
def test_courses_rejects_invalid_semesters_before_using_database(
    client, mock_db, query
):
    response = client.get(f"/courses{query}")

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "semester_id"]
        for error in response.json()["detail"]
    )
    mock_db.connect.assert_not_called()


def test_courses_rejects_invalid_open_classes_flag(client, mock_db):
    response = client.get("/courses?semester_id=1&only_open_classes=invalid")

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "only_open_classes"]
        for error in response.json()["detail"]
    )
    mock_db.connect.assert_not_called()


def test_courses_returns_503_when_connection_fails(client, mock_db):
    mock_db.connect.side_effect = pymysql.OperationalError(
        2003, "Private database connection details"
    )

    response = client.get("/courses?semester_id=1")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Could not search courses in the local MySQL database."
    }
    mock_db.connection.close.assert_not_called()
