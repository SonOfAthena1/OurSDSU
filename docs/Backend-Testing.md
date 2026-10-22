# Backend testing

Backend tests check that our API returns the right results, rejects invalid requests, and handles errors. Add them as you build a feature or fix a bug. Read the overview first, then follow the later sections as you write tests.

## Start here: what are we actually testing?

**Our current tests use a mock database.** A mock is a pretend Python object, not a running MySQL database. We tell it which rows to return or which error to raise. The actual backend route runs, but its SQL does not run against MySQL.

For example, we can give the mock two course rows and check whether the backend turns them into the correct API response. This checks what our code does **with those rows**. It does not prove that the SQL would find those rows: even broken SQL could pass if the mock returns the data we told it to return.

**An integration test checks the backend and real MySQL working together.** Use the local development database you already have; you do not need to create another database for this guide. Give the test known records so it has a dependable answer to compare against.

For example, an integration test for course filtering could:

1. Insert a semester, two courses, one open section, and one full section into your local database.
2. Request `/courses` with that semester and `only_open_classes=true`.
3. Check that the response contains the open section and excludes the full one.
4. Remove the records the test inserted, even if an assertion fails.

**Integration tests are tests too.** Mock-based tests check response handling and let us simulate errors; integration tests check actual SQL, table relationships, and filtering. Passing the current mock-based tests does not mean our database queries work.

### What to write, and in what order

For a new endpoint, use this as a starting order, not a requirement to finish one entire category before the next:

1. **Check basic behavior and input validation.** Are missing or invalid inputs rejected? Does the basic response work?
2. **Check database queries with integration tests as you implement them.** Start with known matching records, then test filters and no matching results.
3. **Check response formatting with sample rows.** Use mocks to test grouping and other transformations as they become more involved.
4. **Check relevant failures.** Use mocks to simulate connection or query errors and verify the response and cleanup.

| What you want to verify | Suitable test |
| --- | --- |
| Missing or invalid inputs are rejected | API test without real database access |
| Returned rows become the correct response | Mock-based test with sample rows |
| SQL selects the correct courses and sections | Integration test using your local MySQL database |
| Connection failures produce the right error response | Mock-based test that raises an error |
| The whole application works through the browser | End-to-end test, a later layer beyond this guide |

You do not need to check every behavior in every way. Choose a test that can catch the mistake you care about. For a bug fix, add a test that fails with the bug and passes with the fix.

## 1. Run the existing tests

We use **pytest** to find and run tests and **FastAPI's TestClient** to send requests directly to the app without starting a server.

Run all commands from the **repository root**, the folder containing `backend`, `frontend`, and `package.json`. If you have not created `.venv`, follow [Clone and App Setup](Clone-and-App-Setup.md) first.

Activate the Python environment in each new terminal:

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS or Linux:**

```bash
source .venv/bin/activate
```

Install or update the test dependencies, then run the tests:

```bash
python -m pip install -r backend/requirements-dev.txt
npm run test:back
```

The current tests need no running frontend, backend server, MySQL server, or `backend/.env` file.

### Where tests go

| File | Purpose |
| --- | --- |
| `pytest.ini` | Finds tests in `backend/tests` and makes backend code importable as `app`. |
| `backend/tests/conftest.py` | Shared test setup, including mocks and a rule blocking real MySQL connections. |
| `backend/tests/test_health.py` | Simple API response examples. |
| `backend/tests/test_db_health.py` | Mocked database results, errors, and connection cleanup examples. |
| `backend/tests/test_courses.py` | Course input validation and connection failure examples. |

Name files `test_*.py` and functions `test_*` so pytest finds them. Group related tests by endpoint or feature, and name each test after the behavior it checks.

## 2. Write a simple API test

This example already exists in `test_health.py`:

```python
def test_health_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

The `client` parameter asks pytest for a **fixture**: reusable setup defined in `conftest.py`. You do not import or call it yourself. Pytest supplies a fresh client and closes it afterward.

Most tests have three steps: **arrange** the inputs or data, **act** by making a request, and **assert** the expected outcome. An `assert` fails the test if its condition is false. Check the status code and meaningful response data.

### Check several invalid inputs

`parametrize` runs the same test once for each value, saving repeated code:

```python
import pytest


@pytest.mark.parametrize("semester_id", ["", "abc", "0", "-1"])
def test_courses_rejects_invalid_semester(client, mock_db, semester_id):
    response = client.get("/courses", params={"semester_id": semester_id})

    assert response.status_code == 422
    mock_db.connect.assert_not_called()
```

The last line checks that invalid input was rejected before database access. The existing `test_courses.py` also shows how to check which input field caused the validation error without depending on the entire error message.

## 3. Give a mock database data

Request `mock_db` alongside `client`. You do not create tables or insert records into a mock. Instead, set the result it should return **before** sending the request:

```python
def test_db_health_returns_query_result_and_closes_connection(client, mock_db):
    mock_db.cursor.fetchone.return_value = {"connected": 1}

    response = client.get("/db-health")

    assert response.status_code == 200
    assert response.json() == {"connected": 1}
    mock_db.connection.close.assert_called_once_with()
```

For a route that reads multiple rows with `fetchall()`, the setup could look like this:

```python
mock_db.cursor.fetchall.return_value = [
    {"course_id": 10, "title": "Intro to Biology"},
    {"course_id": 20, "title": "General Chemistry"},
]
```

These rows are illustrative: use the actual field names and value types your query returns. Then request the route and assert the expected API response. Set the return value to `[]` to test handling of no matching rows. Each test gets fresh mocks, so one test's sample data does not carry into the next.

| Mock object | Use it to… |
| --- | --- |
| `mock_db.connect` | Simulate a connection error or check whether a connection was requested. |
| `mock_db.connection` | Check that the connection was closed. |
| `mock_db.cursor` | Supply `fetchone()` or `fetchall()` results, or simulate a query error. |

`/courses` currently has placeholder SQL and response formatting. Its tests cover validation and connection errors. Add successful search tests as the implementation is added; do not treat its temporary always-empty result as the intended behavior.

### Simulate an error

Use `side_effect` to make the mock raise an exception instead of returning data:

```python
import pymysql


def test_db_health_returns_503_when_connection_fails(client, mock_db):
    mock_db.connect.side_effect = pymysql.OperationalError(2003, "Connection failed")

    response = client.get("/db-health")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Could not connect to the local MySQL database."
    }
    mock_db.connection.close.assert_not_called()
```

To simulate a query failing after connection, set `mock_db.cursor.execute.side_effect` instead. In that case, check that the connection **is** closed. See `test_db_health_closes_connection_when_query_fails` for the full example.

## 4. Add integration tests for actual SQL

**This setup is not implemented yet.** The current automatic fixture in `conftest.py` deliberately blocks real MySQL connections. Adding a test that requests only `client` will not bypass it.

When adding integration testing, build this shared setup first:

1. **Make real database access an explicit choice.** Register an `integration` marker in `pytest.ini`, and update the connection-blocking fixture to allow only those marked tests to connect. Keep ordinary runs mock-only and provide a separate command that opts into integration tests. A marker labels a test; by itself it does not change the connection blocker or exclude tests from a run.
2. **Use your existing local database configuration.** Start local MySQL, apply the project's schema changes, and use your own `backend/.env`, as described in [Local SQL Setup](Local-SQL-Setup.md). Integration tests should use the real connection function, not `mock_db`.
3. **Create a fixture for known records.** Insert only the records the test needs, including required related records. Use their IDs in requests instead of assuming everyone's database has the same imported data or record counts.
4. **Guarantee cleanup.** Record the inserted IDs and delete only those records afterward, removing dependent records first. Put setup and cleanup in a fixture using `try/finally` so cleanup also runs after a failed assertion or partially completed setup. Do not clear local tables to reset a test.

Once that setup exists, the course-filtering example from the overview becomes a test: the fixture inserts the semester, courses, and sections; the test makes the request and checks the response; teardown removes those records.

A read-only endpoint test may still **insert setup data** so it has known records to read. Keep those records isolated from existing local data, for example by creating a semester specifically for the test. Check exact results within that semester rather than totals across the database.

Do not assume rolling back the fixture's connection will undo everything: API requests currently open their own connections. Setup records must be committed so those requests can see them, and cleanup must explicitly remove them.

## 5. Read failures and finish your change

Pytest shows the failed test name, the failed assertion, and the actual and expected values. Run a smaller selection while investigating:

```bash
npm run test:back -- backend/tests/test_db_health.py
npm run test:back -- backend/tests/test_db_health.py::test_db_health_returns_503_when_connection_fails
npm run test:back -- -k invalid_semesters -v
```

These select a file, a single test, or tests whose names match a phrase. Check the application behavior and the test's setup before changing an expectation just to get a passing result.

Common setup issues:

- **Missing `pytest` or `ruff`:** activate `.venv` and reinstall `backend/requirements-dev.txt`.
- **Cannot import `app`:** run from the repository root so pytest uses `pytest.ini`.
- **`Use the mock_db fixture for database tests.`:** for a mocked test, request `mock_db` and check its patch target. For an intended integration test, the opt-in setup above must exist first; starting MySQL alone will not fix this error.
- **Mock no longer replaces the connection after moving routes:** the fixture patches `app.main.get_db_connection`. Update it to patch the function where the route uses it. Patching only `app.db.get_db_connection` will not replace a reference already imported into another module.

Before opening a pull request, run both checks:

```bash
npm run check:back
npm run test:back
```

The first checks code style; the second checks behavior. Once integration tests are added, also run their separate command when changing database behavior. See [Repo Scripts](Repo-Scripts.md) for other commands.
