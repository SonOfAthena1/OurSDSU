# Frontend developer

When you finish making changes, run `npm run check:front`.

If it reports problems, run `npm run fix:front`, then run `npm run check:front` again. Fix any remaining errors yourself using the messages as a guide.

# Backend developer

When you finish making changes, run `npm run check:back` and `npm run test:back`.

If linting or formatting checks report problems, run `npm run fix:back`. Then run `npm run check:back` again. Fix any remaining errors yourself using the messages as a guide. For test failures, use pytest's output to investigate the failing behavior; `fix:back` does not fix test failures.

**Activate your Python virtual environment first (if it is not activated already)** so Python can find Ruff and pytest. From the repository root in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

# What each script does

Run all commands from the **repository root** (the folder containing `frontend`, `backend`, and this `docs` folder). Install the project's dependencies first using the setup guide.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the frontend development server so you can use the app locally while editing. |
| `npm run backend` | Starts the FastAPI backend development server with automatic reload. Activate `.venv` first. Run this in a separate terminal from `npm run dev` to run both servers at the same time. Stop either server with `Ctrl + C` in its terminal. |
| `npm run lint` | Uses ESLint to check frontend code for common mistakes and React rule violations. |
| `npm run typecheck` | Uses TypeScript to check frontend types. It does not build the frontend app with Vite. |
| `npm run format` | Automatically formats frontend files with Prettier and Python files with Ruff. |
| `npm run format:check` | Checks frontend and Python formatting without changing files. |
| `npm run check` | Runs `check:front`, then `check:back`, checking frontend linting, types, and formatting plus Python linting and formatting once each. |
| `npm run fix` | Applies available frontend and Python lint fixes, then formats frontend and Python files. |
| `npm run format:front` | Automatically formats frontend files with Prettier. |
| `npm run format:back` | Automatically formats Python files with Ruff. |
| `npm run check:front` | Checks frontend linting, types, and formatting without changing files. |
| `npm run check:back` | Checks Python linting and formatting without changing files. |
| `npm run fix:front` | Applies available frontend lint fixes, then formats frontend files. |
| `npm run fix:back` | Applies available Python lint fixes, then formats Python files. |
| `npm run test:back` | Runs backend tests with pytest. Activate `.venv` first. Tests use FastAPI's test client and mocked database connections; no running server, MySQL instance, or database credentials are needed. |

# Running backend tests

With `.venv` activated, install or update the backend development dependencies:

```bash
python -m pip install -r backend/requirements-dev.txt
```

Run the suite from the repository root:

```bash
npm run test:back
```

Pass pytest options after `--` to run one file or select tests by name:

```bash
npm run test:back -- backend/tests/test_db_health.py
npm run test:back -- -k invalid_semesters -v
```

Tests live in `backend/tests/`. Name files `test_*.py` and functions `test_*` so pytest discovers them. Shared fixtures live in `conftest.py`; request a fixture by adding its name to a test function's parameters:

- `client` sends HTTP requests directly to the FastAPI app.
- `mock_db` replaces the route's connection function. Set `mock_db.cursor.fetchone.return_value` or `fetchall.return_value` to simulate query results, and set `mock_db.connect.side_effect` or `mock_db.cursor.execute.side_effect` to simulate failures.
- An automatic fixture blocks real MySQL connections, so a test that accidentally reaches the database fails instead of using your local data.

See `test_health.py` for basic response assertions, `test_db_health.py` for database success and failure examples, and `test_courses.py` for parameterized validation tests. These mocks test application behavior; they do not verify real SQL or the database schema. Course search results are still a placeholder, so these examples cover validation and connection failures rather than unfinished search behavior.

# A few things to remember

- **Checks report problems; fixes and formatting can change files.** Review those changes before committing.
- Automatic fixes cannot solve every problem. Type errors and some lint errors need manual edits.
- Scripts with multiple steps stop at the first failed step. Run the check again after fixing that problem to see whether anything else needs attention.
- Activate `.venv` before `npm run backend`, `npm run test:back`, or any command that runs Ruff, including the backend commands and the shared `check`, `fix`, `format`, and `format:check` commands. Frontend-only commands do not need `.venv`.
- `check` and `check:back` run linting and formatting checks; run `test:back` separately for automated backend tests.
