# Backend testing

Use backend tests to check that API endpoints return the expected responses, reject invalid requests, and handle database errors. Add tests alongside each feature or bug fix so teammates can change the app without accidentally breaking existing behavior.

We use **pytest** to discover and run tests and **FastAPI's TestClient** to send requests directly to the app. The test client does not start a development server. Database tests use mocks: objects that return test data or raise an error instead of contacting MySQL.

## Set up and run tests

Run every command below from the **repository root**, the folder containing `backend`, `frontend`, and `package.json`. If you have not created `.venv` yet, follow [Clone and App Setup](Clone-and-App-Setup.md) first.

Activate the project's Python environment in each new terminal.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS or Linux:**

```bash
source .venv/bin/activate
```

Install or update the development dependencies, including pytest and the test client's HTTP library:

```bash
python -m pip install -r backend/requirements-dev.txt
```

Run all backend tests:

```bash
npm run test:back
```

You do not need a running frontend, backend server, MySQL server, or `backend/.env` file to run the current tests.

Pass pytest arguments after `--` to narrow down a failure:

```bash
npm run test:back -- backend/tests/test_db_health.py
npm run test:back -- backend/tests/test_db_health.py::test_db_health_returns_503_when_connection_fails
npm run test:back -- -k invalid_semesters -v
npm run test:back -- -x
```

These commands run one file, one test, tests with matching names, or the suite stopping at its first failure, respectively. See [Repo Scripts](Repo-Scripts.md) for linting and formatting commands; `check:back` and `test:back` are separate checks.

## Where tests go

| File | Purpose |
| --- | --- |
| `pytest.ini` | Finds tests in `backend/tests` and makes `backend/app` importable as `app`. |
| `backend/tests/conftest.py` | Defines shared fixtures and blocks real MySQL connections. |
| `backend/tests/test_health.py` | Basic API response examples. |
| `backend/tests/test_db_health.py` | Database results, errors, and connection cleanup examples. |
| `backend/tests/test_courses.py` | Course request validation and connection failure examples. |

Create files named `test_*.py` and functions named `test_*`. Group related tests by endpoint or feature, such as `test_semesters.py` when a semesters endpoint exists. Test names should describe the behavior being checked.

## Write an API test

This example already exists in `test_health.py`:

```python
def test_health_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

The `client` parameter requests a **fixture**, which is shared setup supplied by pytest. You do not import it or call it yourself. Pytest finds it in `conftest.py`, creates a client for the test, and closes it afterward.

Most tests follow three steps: arrange the inputs or mock data, act by sending a request, and assert the expected outcome. Check both the status code and meaningful response data. For endpoints that accept a JSON body, send it with `client.post("/your-route", json={...})` and use the actual fields required by that endpoint.

## Write a database test

Request both `client` and `mock_db` in the function parameters. Set the query result before making the request:

```python
def test_db_health_returns_query_result_and_closes_connection(client, mock_db):
    mock_db.cursor.fetchone.return_value = {"connected": 1}

    response = client.get("/db-health")

    assert response.status_code == 200
    assert response.json() == {"connected": 1}
    mock_db.connection.close.assert_called_once_with()
```

The mock has three parts:

| Object | How to use it |
| --- | --- |
| `mock_db.connect` | The mocked `get_db_connection()` function. Set `side_effect` to simulate a failed connection or assert that validation never called it. |
| `mock_db.connection` | The returned connection. Check `close()` to verify cleanup. |
| `mock_db.cursor` | The cursor used inside `with connection.cursor()`. Configure `fetchone.return_value` for one row or `fetchall.return_value` for a list of rows. |

Always configure the fetched data that a successful request needs. Use dictionaries with the same field names and value types as the real database returns. Each test receives fresh mocks, and pytest removes the patches afterward.

To simulate a connection failure:

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

To simulate a failed query after a connection succeeds, set `mock_db.cursor.execute.side_effect` instead. Then assert that the endpoint closes the connection even though the query failed. See `test_db_health_closes_connection_when_query_fails` for the complete example.

The fixture currently patches `app.main.get_db_connection`, because that is where the routes look up the function. If you move routes into another module, update the fixture to patch the function **where the route uses it**. Patching only `app.db.get_db_connection` will not replace a reference already imported into a route module.

An automatic fixture blocks calls to the real `pymysql.connect`. If a test reports `Use the mock_db fixture for database tests.`, check that the test requests `mock_db` and that its patch targets the right route module. Do not fix a mocked test by starting MySQL or adding credentials.

## Test several inputs without repeating code

Use `pytest.mark.parametrize` when the same behavior should hold for several inputs. This is a shorter version of the semester validation examples:

```python
import pytest


@pytest.mark.parametrize("semester_id", ["", "abc", "0", "-1"])
def test_courses_rejects_invalid_semester(client, mock_db, semester_id):
    response = client.get("/courses", params={"semester_id": semester_id})

    assert response.status_code == 422
    mock_db.connect.assert_not_called()
```

Pytest runs a separate test case for each value. The assertion on `connect` checks that invalid input is rejected before database access. For FastAPI validation responses, check the relevant field in `detail` when useful; avoid depending on the entire generated error message. The existing `test_courses.py` shows how to check the field location.

## Decide what to cover

For a new feature, cover its successful response, meaningful empty results, invalid input, and relevant failure paths. For a bug fix, add a test that fails with the bug and passes with the fix. Use response assertions as the main evidence, with mock assertions for behavior such as avoiding database access or closing a connection.

`/courses` still has placeholder SQL and response formatting. Its current tests cover input validation and connection errors. As search is implemented, add tests for real row-to-response formatting, filtering, and empty results. Do not write a test that treats the placeholder's always-empty result as the final search behavior.

Mocked tests do **not** prove SQL syntax, joins, migrations, or schema constraints work against MySQL. Those need separate integration tests using a disposable test database. The current suite does not provide that setup; keep real database integration tests separate from these mocked tests.

## Read failures and finish a change

Pytest lists failed test names and shows which assertion failed, including the actual and expected values. Rerun the failing test on its own, inspect the response and setup, and fix either the application behavior or an incorrect expectation. Avoid changing an expectation just to make the test pass.

Run both checks before opening a pull request:

```bash
npm run check:back
npm run test:back
```

If Python cannot find `pytest` or `ruff`, activate `.venv` and reinstall `backend/requirements-dev.txt`. If imports such as `app` fail, confirm you are running from the repository root so pytest uses `pytest.ini`.

Warnings appear separately from failures. The current Starlette version emits a deprecation warning about AnyIO's `BlockingPortal` alias; that warning does not mean a test failed.
