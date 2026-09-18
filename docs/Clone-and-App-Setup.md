# OurSDSU: Clone and App Setup

This guide gets a teammate from a fresh clone to a working local React frontend and FastAPI backend. Complete the [Local SQL Setup](Local-SQL-Setup.md) guide before expecting the backend to connect to the database.

> Every developer needs their own `.venv` and `backend/.env` file. Do not copy either one from another teammate.

## 1. Install prerequisites

Install these once if you do not already have them:

- **Git**
- **Node.js LTS** (includes `npm`)
- **Python 3**
- **MySQL Community Server**
- **MySQL Workbench**
- **VS Code** (recommended extensions: Python and ESLint)

MySQL Workbench is the program used to connect to MySQL; it is **not** the MySQL database server itself. Install MySQL Server too.   
**All of us should already have both MySQL things installed.**

Open a terminal and check that the command-line tools work.

**Windows (PowerShell):**

```powershell
git --version
node --version
npm --version
py --version
```

**macOS (Terminal):**

```bash
git --version
node --version
npm --version
python3 --version
```

If `node` or `npm` is missing, install Node.js LTS and reopen the terminal. If `python3` is missing on a Mac, install Python 3 from [python.org](https://www.python.org/downloads/macos/) or with Homebrew if you already use it:

```bash
brew install python
```
If you need help with any of this stuff, just Google it really. *"How do I install ___"* or *"How to check if I have ___ installed"*. 

## 2. Clone the repository

1. On the GitHub repository page, choose **Code → HTTPS** and copy the repository URL. 
2. Open a new window in VSCode via **File → New Window** if it doesn't open a new window automatically.
3. Click on **Clone git repository** and then paste the link from Github.
4. After that it should prompt you to choose a location on your computer for the project. Put it wherever you want that makes sense. 
5. You should be done, it should have opened the project in your VSCode window. 

## 3. Set up and run the frontend

In the VS Code terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite will display a local address, normally `http://localhost:5173/`. Open it in your browser. Stop the development server with `Ctrl + C` or press **q** and hit **Enter** when you are done.

`npm install` downloads the packages listed in `frontend/package.json`. Do **not** commit `frontend/node_modules/`; Git should already ignore it.

Return to the repository root before the backend steps:

```bash
cd ..
```
This is a command you can always use to go back to the repo root.

## 4. Set up the Python backend

From the repository root, create a virtual environment. A virtual environment keeps this project’s Python packages separate from your other Python projects.

**Windows (PowerShell):**

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation only because of its script-execution setting, run this for the **current terminal only**, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**macOS (Terminal):**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

After activation, your prompt should normally start with `(.venv)`. Then, on either operating system, install the packages the team committed:

```bash
python -m pip install -r backend/requirements.txt
```

In VS Code, select the `.venv` interpreter if prompted. You can also use **Python: Select Interpreter** from the Command Palette and choose the one inside this project’s `.venv` folder.

To leave the virtual environment later, run:

```bash
deactivate
```

## 5. Create your private environment file

The committed example file lists the settings the backend needs, but contains no real password. Copy it to your local private file:

**Windows (PowerShell):**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS (Terminal):**

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your own local MySQL password. You will create the database account and choose that password in the SQL guide.   
**Don't worry** about this part as we haven't got there yet. 

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=oursdsu_app
DB_PASSWORD=put-your-local-password-here
DB_NAME=oursdsu
```

### Important: `.env` location

This project keeps environment files in `backend/`. To reliably find it no matter which folder starts Uvicorn, `backend/app/db.py` should explicitly load that exact file:

```python
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
```

Keep the rest of the database connection code below that line as normal. Never put a real password in `.env.example`.
