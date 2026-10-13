# Frontend developer

When you finish making changes, run `npm run check:front`.

If it reports problems, run `npm run fix:front`, then run `npm run check:front` again. Fix any remaining errors yourself using the messages as a guide.

# Backend developer

When you finish making changes, run `npm run check:back`.

If it reports problems, run `npm run fix:back`. Then run `npm run check:back` again. Fix any remaining errors yourself using the messages as a guide.

**Activate your Python virtual environment first (if it is not activated already)** so Python can find Ruff. From the repository root in Windows PowerShell:

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

# A few things to remember

- **Checks report problems; fixes and formatting can change files.** Review those changes before committing.
- Automatic fixes cannot solve every problem. Type errors and some lint errors need manual edits.
- Scripts with multiple steps stop at the first failed step. Run the check again after fixing that problem to see whether anything else needs attention.
- Activate `.venv` before any command that runs Ruff, including the backend commands and the shared `check`, `fix`, `format`, and `format:check` commands. Frontend-only commands do not need `.venv`.
- These scripts do not start the backend server or run automated tests.
