# OurSDSU: Git and General Team Tips

This is the shared workflow for keeping the project organized and keeping private information out of GitHub.  
Our goal is to **keep our `main` branch runnable at all times**, as in, no errors. For that reason,
we're going to try working on new things on branches, until they work, and then merge them into main.


## 0. Checking Git for Updates

### Check your Git status in VS Code first

Open the **Source Control** panel in VS Code (`Ctrl+Shift+G`) and look below where it says "Graph" - that it a list of the commit history:

- If you see **purple**, your local branch is behind the remote branch. Pull or sync the incoming changes before starting work.
- If you see **blue**, your local branch is up-to-date with the remote branch.

The exact colors can vary with your VS Code theme, so also look for a **down arrow at the very bottom left corner** of the window. That is a commit count for how many commits you are behind the remote. For example, `↓3` means there are three remote commits to pull.

### Turn on automatic fetching

Automatic fetching lets VS Code regularly check GitHub for new commits. Open VS Code Settings with `Ctrl+,`, search for **Git: Autofetch**, and enable it. Then search for **Git: Autofetch Period** and set it to `60` seconds (or leave the default `180` seconds).

You can also add these settings to your VS Code **User** `settings.json`:

```json
{
  "git.autofetch": true,
  "git.autofetchPeriod": 60
}
```

>Fetching only checks for and downloads information about remote commits; it does not apply them to your local branch. If VS Code shows incoming changes, you still need to click **Pull**, type `git pull` or **Sync Changes**.

## 1. Normal Git workflow

Before starting a new task, make sure your local `main` matches GitHub (is up-to-date): 
```bash
git switch main
git pull origin main
```

Then create a new branch:
```bash
git switch -c feature/short-description
```

Example branch names:

```text
fix/meeting-day-filter
feature/course-search-endpoint
feature/search-page-layout
feature/catalog-scraper
```

>You can also **pull** and **create new branches** using the VSCode source control interface. Up to you.

### Make sure you commit and push regularly.  
I really recommend you just use the VSCode interface for this especially, but if you want the CLI commands here they are:

```bash
git status
git add path/to/the/files-you-changed
git commit -m "Commit message here"
git push -u origin feature/short-description
```

### When you finish your fix/feature:
1. Start by switching to `main` and making sure it is up-to-date (pulling).
2. Then switch back to your branch.
3. Merge `main` into your branch.
4. Make sure everything still works and resolve any conflicts.
```Bash
git switch main
git pull
git switch your-branch-name
git merge main
```
5. After you checked that everything still works, go to GitHub and open a Pull Request (PR). We can keep PR texts simple for this project, so don't worry  about writing alot for those. Just try to get the main points in. 
6. Don't merge your own PRs into `main`. I will do that for now, though we can always change that later. Don't delete your branches either, again I will do that. 


## 2. Keep these private and out of GitHub:

- API keys, database passwords, and connection strings
- real user data or scraped data that should not be published
- MySQL backups/dumps containing non-test data
- `node_modules/`, `.venv/`, build output, and editor-specific files

The project’s `.gitignore` should already protect the usual local files. Before committing, run `git status` and make sure `backend/.env` is not listed.


## 3. Where project documentation should go

Commit team-readable information to `docs/`, for example:

```text
docs/
  CLONE_AND_APP_SETUP.md
  LOCAL_SQL_SETUP.md
  GIT_AND_TEAM_TIPS.md
  ERD.md
  API_CONTRACT.md
```

Useful things to commit include the setup guides, ERD, table decisions, API endpoint formats, screenshots that contain no private data, and fake seed data. The goal is for a new teammate to be able to understand and run the project without guessing.


## 4. Quick troubleshooting

- **`npm` is not recognized:** Install Node.js LTS, then reopen VS Code/Terminal.
- **`py` is not recognized on Windows:** Install Python 3 and check **Add Python to PATH** during installation.
- **`python3` is not recognized on macOS:** Install Python 3, then reopen Terminal.
- **`ModuleNotFoundError`:** Activate `.venv`, then run `python -m pip install -r backend/requirements.txt` again.
- **MySQL connection fails:** Confirm MySQL Server is running, the password in `backend/.env` matches the one used in `CREATE USER`, and `DB_NAME` is `oursdsu`.
- **A merge conflict appears:** Do not panic or delete code. Ask the teammate who changed the same area, resolve it together, then run the app before committing the resolution.


## 5. First shared milestone

Before moving into scraping or advanced filters, we should get one small end-to-end feature working:

1. Put a few fake courses in the local database.
2. Make FastAPI return them from a course endpoint.
3. Display them in the React app.

That proves the frontend, backend, and database can communicate before the team adds the harder pieces.
