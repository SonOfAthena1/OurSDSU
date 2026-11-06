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

# Tests for location: online, in-person, and one that is not expected
def test_courses_allow_online_class(client, mock_db):
    response = client.get("/courses?semester_id=1&location=online")

    assert response.status_code == 200

def test_courses_allow_in_person_class(client, mock_db):
    response = client.get("/courses?semester_id=1&location=in_person")

    assert response.status_code == 200

def test_courses_reject_invalid_class_location(client, mock_db):
    response = client.get("/courses",
                          params = {
                              "semester_id": 1,
                              "location": "ucsd",
                          })

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "location"]
        for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()

# Tests for several combinations of date and time
def test_courses_generic_mwf(client, mock_db):
    response = client.get("/courses?semester_id=1&days=21") # Mon = 1, Wed = 4, Fri = 16

    assert response.status_code == 200

def test_courses_generic_tth(client, mock_db):
    response = client.get("/courses?semester_id=1&days=10") # Tue = 2, Thr = 8

    assert response.status_code == 200

def test_courses_generic_weekend(client, mock_db):
    response = client.get("/courses?semester_id=1&days=96") # Sat = 32, Sun = 64

    assert response.status_code == 200

def test_courses_generic_asynch(client, mock_db):
    response = client.get("/courses?semester_id=1&days=0") # Asynchronous = 0

    assert response.status_code == 200

def test_courses_early_mwf(client, mock_db):
    response = client.get("/courses?semester_id=1&days=21&early_start_time=08:00:00")

    assert response.status_code == 200

def test_courses_afternoon_tth(client, mock_db):
    response = client.get("/courses?semester_id=1&days=10&early_start_time=12:00:00&late_start_time=16:00:00")

    assert response.status_code == 200

def test_courses_late_monday(client, mock_db):
    response = client.get("/courses?semester_id=1&days=1&early_start_time=17:00:00&late_start_time=21:40:00")

    assert response.status_code == 200

def test_courses_reject_negative_days(client, mock_db):
    response = client.get("/courses",
                          params = {
                              "semester_id": 1,
                              "days": -1,
                          })

    assert response.status_code == 422
    assert any(
            error["loc"][:2] == ["query", "days"]
            for error in response.json()["detail"]
        )
    
    mock_db.connect.assert_not_called()

def test_courses_reject_invalid_days(client, mock_db):
    response = client.get("/courses",
                              params = {
                                  "semester_id": 1,
                                  "days": 128,
                              })
    
    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "days"]
        for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()

def test_courses_reject_invalid_time(client, mock_db):
    response = client.get("/courses",
                              params = {
                                  "semester_id": 1,
                                  "late_start_time": "25:00:00",
                              })
    
    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "late_start_time"]
        for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()

def test_courses_reject_invalid_time_range(client, mock_db):
    response = client.get("/courses",
                              params = {
                                  "semester_id": 1,
                                  "early_start_time": "21:40:00",
                                  "late_start_time": "08:00:00",
                              })
    
    assert response.status_code == 422
    
    #assert any(
        #error["loc"][:2] == ["query", "early_start_time"]
        #for error in response.json()["detail"]
    #)

    mock_db.connect.assert_not_called()