from datetime import timedelta

import pymysql
import pytest


@pytest.fixture(autouse=True)
def existing_semester(mock_db):
    # First query finds semester 1; the course query returns no rows by default.
    mock_db.cursor.fetchall.side_effect = [[{"semester_id": 1}], []]


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


# Tests for location: online, in-person, and one that is not expected
def test_courses_allow_online_class(client, mock_db):
    response = client.get("/courses?semester_id=1&location=online")

    assert response.status_code == 200


def test_courses_allow_in_person_class(client, mock_db):
    response = client.get("/courses?semester_id=1&location=in_person")

    assert response.status_code == 200


def test_courses_reject_invalid_class_location(client, mock_db):
    response = client.get(
        "/courses",
        params={
            "semester_id": 1,
            "location": "ucsd",
        },
    )

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "location"] for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()


# Tests for several combinations of date and time
def test_courses_generic_mwf(client, mock_db):
    mock_db.cursor.fetchall.side_effect = [
        [{"semester_id": 1}],
        [
            {
                "course_id": 100,
                "subject_code": "CS",
                "course_number": 210,
                "course_name": "Data Structures",
                "course_description": "Introduction to data structures",
                "prerequisites": None,
                "units": 3,
                "ge_category_id": None,
                "ge_category_code": None,
                "ge_category": None,
                "section_id": 101,
                "semester_id": 1,
                "semester_name": "Fall",
                "year": 2026,
                "instructor_id": 50,
                "instructor_name": "Test Instructor",
                "instructor_rating": 4.5,
                "meeting_days": 21,
                "start_time": timedelta(hours=8, minutes=30),
                "end_time": timedelta(hours=9, minutes=45),
                "class_location": "GMCS 325",
                "current_enrollment": 20,
                "max_enrollment": 30,
                "waitlist_size": 0,
                "available_seats": 10,
            }
        ],
    ]

    response = client.get("/courses", params={"semester_id": 1, "days": 21})

    assert response.status_code == 200
    results = response.json()["results"]

    assert len(results) == 1
    assert (
        len(results[0]["sections"]) == 1
    )  # Ensure only section exists for the first course

    section = results[0]["sections"][0]  # Get the first section of the first course

    assert section["section_id"] == 101
    assert section["meeting_days"] == [
        "Monday",
        "Wednesday",
        "Friday",
    ]

    print(section["meeting_days"])


def test_courses_generic_tth(client, mock_db):
    mock_db.cursor.fetchall.side_effect = [
        [{"semester_id": 1}],  # First pass for the semester
        [],  # Second pass for the filtered database itself
    ]

    response = client.get("/courses?semester_id=1&days=10")  # Tue = 2, Thr = 8

    assert response.status_code == 200
    assert (
        response.json()["results"] == []
    )  # Make sure nothing is returned (as expected, since the course list is empty)


def test_courses_generic_weekend(client, mock_db):
    response = client.get("/courses?semester_id=1&days=96")  # Sat = 32, Sun = 64

    assert response.status_code == 200


def test_courses_generic_asynch(client, mock_db):
    response = client.get("/courses?semester_id=1&days=0")  # Asynchronous = 0

    assert response.status_code == 200


def test_courses_early_mwf(client, mock_db):
    response = client.get("/courses?semester_id=1&days=21&early_start_time=08:00:00")

    assert response.status_code == 200


def test_courses_afternoon_tth(client, mock_db):
    response = client.get(
        "/courses?semester_id=1&days=10&early_start_time=12:00:00&late_start_time=16:00:00"
    )

    assert response.status_code == 200


def test_courses_late_monday(client, mock_db):
    response = client.get(
        "/courses?semester_id=1&days=1&early_start_time=17:00:00&late_start_time=21:40:00"
    )

    assert response.status_code == 200


def test_courses_reject_negative_days(client, mock_db):
    response = client.get(
        "/courses",
        params={
            "semester_id": 1,
            "days": -1,
        },
    )

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "days"] for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()


def test_courses_reject_invalid_days(client, mock_db):
    response = client.get(
        "/courses",
        params={
            "semester_id": 1,
            "days": 128,
        },
    )

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "days"] for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()


def test_courses_reject_invalid_time(client, mock_db):
    response = client.get(
        "/courses",
        params={
            "semester_id": 1,
            "late_start_time": "25:00:00",
        },
    )

    assert response.status_code == 422
    assert any(
        error["loc"][:2] == ["query", "late_start_time"]
        for error in response.json()["detail"]
    )

    mock_db.connect.assert_not_called()


def test_courses_reject_invalid_time_range(client, mock_db):
    response = client.get(
        "/courses",
        params={
            "semester_id": 1,
            "early_start_time": "21:40:00",
            "late_start_time": "08:00:00",
        },
    )

    assert response.status_code == 422

    # assert any(
    # error["loc"][:2] == ["query", "early_start_time"]
    # for error in response.json()["detail"]
    # )

    mock_db.connect.assert_not_called()
