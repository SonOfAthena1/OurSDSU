import pymysql


def test_semesters_return_empty_semesters_list(client, mock_db):
    mock_db.cursor.fetchall.return_value = []  # A mock database with no semester entries

    response = client.get("/semesters")

    assert response.status_code == 200
    assert response.json() == {"results": []}  # Verify that the output is also empty

    mock_db.cursor.execute.assert_called_once()
    mock_db.connection.close.assert_called_once()


def test_semesters_return_all_semesters(client, mock_db):
    mock_db.cursor.fetchall.return_value = [  # Mock data base with some entries
        {"semester_id": 1, "semester_name": "Winter", "year": 2027},
        {"semester_id": 2, "semester_name": "Spring", "year": 2027},
        {"semester_id": 3, "semester_name": "Summer", "year": 2027},
        {"semester_id": 4, "semester_name": "Fall", "year": 2027},
    ]

    response = client.get("/semesters")

    assert response.status_code == 200
    assert (
        response.json()
        == {  # Verify that the returned output is what we expect given our mock database entries above
            "results": [
                {"semester_id": 1, "semester_name": "Winter", "year": 2027},
                {"semester_id": 2, "semester_name": "Spring", "year": 2027},
                {"semester_id": 3, "semester_name": "Summer", "year": 2027},
                {"semester_id": 4, "semester_name": "Fall", "year": 2027},
            ]
        }
    )

    mock_db.cursor.execute.assert_called_once()
    mock_db.connection.close.assert_called_once()


def test_semesters_returns_503_when_connection_fails(client, mock_db):
    mock_db.connect.side_effect = pymysql.OperationalError(
        2003, "Private database connection details"
    )

    response = client.get("/semesters")

    assert response.status_code == 503
    assert (
        response.json()
        == {
            "detail": "Could not search semesters in the local MySQL database."  # Verify the error message matches what is thrown in main.py
        }
    )
    mock_db.connection.close.assert_not_called()
