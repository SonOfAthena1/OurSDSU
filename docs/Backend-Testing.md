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

### Where tests go

| File | Purpose |
| --- | --- |
| `pytest.ini` | Finds tests in `backend/tests` and makes backend code importable as `app`. |
| `backend/tests/conftest.py` | Shared test setup, including mocks and a rule blocking real MySQL connections. |
| `backend/tests/test_health.py` | Simple API response examples. |
| `backend/tests/test_db_health.py` | Mocked database results, errors, and connection cleanup examples. |
| `backend/tests/test_courses.py` | Course input validation and connection failure examples. |

Name files `test_*.py` and functions `test_*` so pytest finds them. Group related tests by endpoint or feature, and name each test after the behavior it checks.

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


### Read failures and finish your change

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
- **`Use the mock_db fixture for database tests.`:** for a mocked test, request `mock_db` and check its patch target. For an intended integration test, the integration setup in section 4 must exist first; starting MySQL alone will not fix this error.
- **Mock no longer replaces the connection after moving routes:** the fixture patches `app.main.get_db_connection`. Update it to patch the function where the route uses it. Patching only `app.db.get_db_connection` will not replace a reference already imported into another module.

Before opening a pull request, run both checks:

```bash
npm run check:back
npm run test:back
```

The first checks code style; the second checks behavior. Once integration tests are added, also run their separate command when changing database behavior. See [Repo Scripts](Repo-Scripts.md) for other commands.

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

**The integration setup below is not implemented yet.** These are instructions for adding it, rather than examples you can run unchanged today. Start small: first prove that a test can reach MySQL, then add tests for course queries.

### A. Let integration tests connect to MySQL

Currently, `conftest.py` automatically blocks real database connections for every test. We need a way to tell pytest, “This particular test is supposed to use MySQL.” A **marker** is a label we attach to a test for this purpose.

Add the following under the existing `[pytest]` settings in `pytest.ini`:

```ini
markers =
    integration: uses the local MySQL database
```

Then update the beginning of `block_real_database_connections` in `conftest.py` to accept `request` and skip blocking for marked tests:

```python
@pytest.fixture(autouse=True)
def block_real_database_connections(monkeypatch, request):
    if request.node.get_closest_marker("integration"):
        return

    # Keep the existing monkeypatch.setattr(...) block here.
```

`request` gives the fixture information about the test that is running. The `if` checks its label; `return` leaves the real connection function in place. Unmarked tests still get the existing blocker. This snippet shows the change to the function, not a replacement for the whole file.

Once marked tests exist, update the ordinary `test:back` script in `package.json` to `python -m pytest -m "not integration"` so it continues running without MySQL. Add a companion script named `test:back:integration` with the value `python -m pytest -m integration`. The `-m` option selects tests by their label. A marker alone does not exclude a test from ordinary runs.

### B. Start with one real connection test

Start your existing local MySQL server and check your own `backend/.env` and table setup using [Local SQL Setup](Local-SQL-Setup.md). You still do not need to start FastAPI or the frontend: `client` calls the app directly.

Create `backend/tests/test_database_integration.py` with this first test:

```python
import pytest


@pytest.mark.integration
def test_db_health_reaches_local_mysql(client):
    response = client.get("/db-health")

    assert response.status_code == 200
    assert response.json() == {"connected": 1}
```

There is no `mock_db` parameter here: we want the real connection and real `SELECT 1` query. After completing step A, run it with:

```bash
npm run test:back:integration
```

This proves connectivity, not course-search correctness. If it fails, first check whether MySQL is running and whether the app's local credentials work.

### C. Give a course test known records

Next, add a fixture that inserts a small set of records into **the local database you already use**. Like `mock_db`, this fixture supplies setup for a test, but it inserts actual rows instead of configuring pretend return values.

For the filtering example, create a semester just for the test, two courses, an instructor, and two sections. Our schema requires an instructor for each section. Make one section open, for example enrollment `5` out of `30`, and the other full, `30` out of `30`.

Use real SQL in the fixture. For example, inserting the semester could look like this inside an open connection:

```python
with connection.cursor() as cursor:
    cursor.execute(
        "INSERT INTO semesters (semester_name, year) VALUES (%s, %s)",
        ("Fall", 2099),
    )
    semester_id = cursor.lastrowid
connection.commit()
```

`lastrowid` gives you the ID MySQL assigned to the new record. Save it and use it when inserting sections and making the request; do not assume a particular ID is available. Supply values separately from the SQL using `%s` placeholders, as shown above.

`commit()` saves the inserted rows so the API's separate connection can see them. Choose course subject/number combinations that do not collide with existing local records. Insert all required fields from the schema, and return the created IDs from your fixture.

Then the test can request its own semester:

```python
response = client.get(
    "/courses",
    params={"semester_id": semester_id, "only_open_classes": True},
)
assert response.status_code == 200
```

This is part of a test, not a complete one: obtain `semester_id` from your fixture, then check the response's `results` and section IDs using the agreed API response structure. Assert that the open section is present and the full section is absent. A `200` status alone would not catch a broken filter.

Once that works, add a request without the open-only filter and check that both sections appear. Also test a semester you created with no sections and expect empty results. Check records within your test's semester rather than totals across everyone's different local data.

### D. Clean up after the test

Make cleanup part of the fixture so teammates do not have to delete test records by hand. A fixture can use `yield` to hand its data to the test, then continue afterward to clean up:

```python
# Outline of the fixture's structure, not runnable code:
try:
    # Insert records and track their IDs as each insert succeeds.
    # Commit, then yield the IDs to the test.
    yield created_ids
finally:
    # Delete only the records this fixture inserted, then commit.
    # Close the connection even if cleanup fails.
```

Put inserts inside the `try` as well, so cleanup can handle partly completed setup. Delete sections first, then the courses, instructor, and semester they refer to. Track your own IDs; do not clear whole tables or delete unrelated local records.

Do not rely on rolling back the fixture's connection to remove committed records: the API uses its own connection. Explicit cleanup is needed. With that setup in place, each test follows the same cycle: **insert known data → call the API → check the result → remove the test data**.

