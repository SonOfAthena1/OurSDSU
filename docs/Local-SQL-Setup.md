# OurSDSU: Local SQL Setup

Complete this guide after cloning the repository and creating `backend/.env` using the [Clone and App Setup](Clone-and-App-Setup.md) guide. Each teammate creates the same table structure in their **own local** MySQL database.

> Your local database password belongs only in your local `backend/.env`, never in GitHub or a group chat.

## 1. Create your local database and app account

1. Open **MySQL Workbench**.
2. Connect using your normal local MySQL administrator connection—often the `root` account you created while installing MySQL Server.
3. Open a new SQL tab.
4. Run the following, replacing the password placeholder with a password you choose for your local app account:

```sql
CREATE DATABASE IF NOT EXISTS oursdsu;

CREATE USER IF NOT EXISTS 'oursdsu_app'@'localhost'
IDENTIFIED BY 'choose-a-local-password';

GRANT ALL PRIVILEGES ON oursdsu.* TO 'oursdsu_app'@'localhost';

FLUSH PRIVILEGES;
```

Use the exact same password in `backend/.env`:

```env
DB_PASSWORD=choose-a-local-password
```

`oursdsu_app` is the account the FastAPI app uses. It has access to the OurSDSU database, but it is not your MySQL administrator account.

### macOS note

The SQL commands above are identical on macOS. You can use MySQL Workbench just like on Windows. If you installed MySQL through Homebrew instead, make sure the MySQL server is running before opening Workbench:

```bash
brew services start mysql
```

Only run that command if you actually installed MySQL with Homebrew.

## 2. Create the shared tables

In MySQL Workbench, open this file from your cloned repository:

```text
database/schema/001_initial_schema.sql
```

Run it using Workbench’s lightning-bolt execute button. This creates the project’s tables on **your local** `oursdsu` database.

If the file begins with `USE oursdsu;`, the database-creation command from the previous section must have succeeded first.

You can confirm that the tables exist by refreshing the **Schemas** panel in Workbench and expanding `oursdsu`.

## 3. Run and test the backend connection

From the repository root, activate your virtual environment if it is not already active.

**Windows (PowerShell):**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS (Terminal):**

```bash
source .venv/bin/activate
```

Start FastAPI:

```bash
python -m uvicorn app.main:app --reload --app-dir backend
```

Open these in a browser:

- `http://127.0.0.1:8000/` — basic backend response
- `http://127.0.0.1:8000/health` — backend health check
- `http://127.0.0.1:8000/docs` — FastAPI’s interactive API documentation
- `http://127.0.0.1:8000/db-health` — database connection test, if this route has been added

If `/db-health` returns `{"connected": 1}`, the backend is successfully connected to your local MySQL database.

Stop the server with `Ctrl + C` when you are done.

## 4. Applying future schema changes

New schema changes should be committed as new numbered files, for example:

```text
database/schema/002_add_saved_courses.sql
database/schema/003_add_section_index.sql
```

After pulling a new schema file from GitHub, open and run that new file in Workbench against your local `oursdsu` database.

Do not silently change a schema file that teammates may already have run. New numbered files let everyone apply the same structural changes in the same order.

If a schema command says a table already exists, do not keep rerunning the initial schema blindly. Ask the team whether you should apply a newer schema file or reset and recreate **only your own local development database**.
