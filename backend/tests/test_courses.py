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

# Practice writing a simple test that should pass
def test_courses_generic_valid_test(client, mock_db):
    response = client.get("/courses?subject_code=CS&course_number=001&semester_id=1")

    assert response.status_code == 200

# Practice writing a test that would check for a fail
# Reject GET call if a subject code is not passed
# However, I believe that we said semester would be the only one required
# Currently gives a 200 status code, would theoretically fail if implemented as such
def test_courses_reject_missing_subject(client, mock_db):
    response = client.get("/courses?course_number=001&semester_id=1")

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "subject"]
        for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()

# October 29, 2026 - Write some tests that should pass with different combinations of filters