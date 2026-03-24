# Quickstart Guide

Get the Nausicaa's Global Green Initiative application running locally with Docker.

## TL;DR - Up and Running in 4 Commands

```bash
git clone https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative.git
cd Nausicaas-Global-Green-Initiative
cp .env.sample .env                    # then edit with real values (ask team) or set EMAIL_ENABLED=false
docker compose --profile dev up --build
```

Once logs show all services are ready, open http://localhost:5173 and click **Sign Up** to create an account.

For an admin user, open a second terminal:
```bash
docker compose --profile dev exec backend python -m flask --app run.py add-user admin@test.com --admin
```

That's it. Read on for the full details.

---

## Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- **Optional (for local frontend dev, linting, and tests):** [Node.js](https://nodejs.org/) 18+ and npm. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions. Required for:
  - Frontend linting and formatting (`npm run lint`, `npm run format`)
  - Frontend unit tests (`npm test`)
  - E2E tests with Playwright (`npx playwright test`)
- **Optional (for local code analysis):** [CodeScene CLI](https://codescene.io/) - run `cs delta main` to check code health before pushing. Requires a PAT token (see team for setup).

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative.git
cd Nausicaas-Global-Green-Initiative
```

Create a feature branch off `main` (do not work directly on `main`):

```bash
git checkout -b feature-your-branch-name
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables (contact team members for OAuth values):

```
ACS_EMAIL_CONNECTION_STRING="REPLACE WITH CONNECTION STRING"
ACS_EMAIL_SENDER="REPLACE WITH SENDER ADDRESS"
EMAIL_ENABLED=true
GOOGLE_CLIENT_ID="REPLACE"
GOOGLE_CLIENT_SECRET="REPLACE"
GITHUB_CLIENT_ID="REPLACE"
GITHUB_CLIENT_SECRET="REPLACE"
FRONTEND_URL="http://localhost:5173"
```

> **Note:** OAuth and email features won't work without valid values, but the app will still run. Set `EMAIL_ENABLED=false` to skip email functionality.

### 3. Build and Start the Application

```bash
docker compose --profile dev up --build
```

This will:
- Pull the PostgreSQL 16 image
- Build the Flask backend
- Build the React frontend (via Nginx)
- Run database migrations automatically
- Start all services

Wait until logs indicate all services are ready.

> **Tip:** If you hit database migration issues, do a clean rebuild:
> ```bash
> docker compose --profile dev down -v && docker compose --profile dev up --build
> ```

### 4. Create Users

With a fresh database there are no users. Create them via the UI or CLI.

**Option A: Via the UI**

1. Open http://localhost:5173
2. Click **Sign Up**
3. Enter an email and password

**Option B: Via CLI**

Open a new terminal (don't use the one running Docker):

```bash
# Create an admin user (you'll be prompted for a password)
docker compose --profile dev exec backend python -m flask --app run.py add-user admin@test.com --admin

# Create a regular user
docker compose --profile dev exec backend python -m flask --app run.py add-user user@test.com
```

Create both user types so you can test admin and regular user views.

### 5. Access the Application

| Service              | URL                              |
|----------------------|----------------------------------|
| Frontend (Web App)   | http://localhost:5173            |
| Backend API          | http://localhost:8080            |
| Swagger UI (API Docs)| http://localhost:8080/api/v1/ui  |

> **Note:** Admin privileges are required to create, update, and delete grants. Regular users can view grants and submit applications.

## Development Workflow

### Branching

- Create feature branches from `main`
- Open a PR back to `main` when ready
- Merges to `main` auto-deploy to **staging**
- **Production** deploys are manual, triggered by a git tag (e.g. `v1.2.3`)

### What CI Checks on Your PR

When you open a PR, these checks run automatically:

| Check | What it does |
|-------|-------------|
| **Backend CI** | Black (formatting), Flake8 (linting), pytest (80% coverage gate) |
| **Frontend CI** | ESLint, Prettier, Vitest |
| **E2E** | Playwright tests against a Docker test environment |
| **CodeScene** | Code health analysis (complexity, file size, nesting) |

### Running Linters Locally (Before Pushing)

Run these to catch issues before CI does:

**Backend:**
```bash
# Formatting check
docker compose --profile dev exec backend python -m black --check src tests run.py

# Linting
docker compose --profile dev exec backend python -m flake8

# Auto-format
docker compose --profile dev exec backend python -m black src tests run.py
```

**Frontend:**
```bash
cd frontend
npm install   # first time only
npm run lint
npm run format
```

### Rebuilding After Code Changes

Backend changes require a rebuild:
```bash
docker compose --profile dev up -d --build backend
```

Frontend changes also require a rebuild (served via Nginx, not Vite dev server):
```bash
docker compose --profile dev up -d --build frontend
```

## Running Tests

### Backend Tests

The backend uses [tox](https://tox.wiki/) as its test runner. Tox runs pytest with Black (formatting) and Flake8 (linting) checks in a single command - this is what CI runs, so it's the best way to verify your code before pushing.

```bash
# Full test suite with linting (tox) - matches what CI runs
docker compose --profile dev exec backend python -m tox

# Pytest only (faster, skips linting)
docker compose --profile dev exec backend python -m pytest tests/ -v
```

> **Note:** Tests use a separate test database. Create it if it doesn't exist:
> ```bash
> docker compose --profile dev exec db psql -U postgres -c "CREATE DATABASE nausicaa_test;"
> ```

### Frontend Tests

```bash
cd frontend
npm install   # first time only
npm test
```

### E2E Tests (Playwright)

E2E tests run against a separate test profile with its own database:

```bash
# Start test services
docker compose --profile test up -d --build

# Run tests (from e2e/ directory)
cd e2e
npm install   # first time only
npx playwright test

# Tear down test services
docker compose --profile test down
```

## Database

### Connect to the Database

```bash
docker compose --profile dev exec db psql -U postgres -d nausicaa_dev
```

### Common Queries

```bash
# List all tables
docker compose --profile dev exec db psql -U postgres -d nausicaa_dev -c "\dt"

# View all users
docker compose --profile dev exec db psql -U postgres -d nausicaa_dev -c "SELECT id, email, admin FROM \"user\";"

# View all grants
docker compose --profile dev exec db psql -U postgres -d nausicaa_dev -c 'SELECT * FROM "grant";'
```

### Migrations

```bash
# Apply pending migrations (also runs automatically on container start)
docker compose --profile dev exec backend python -m flask --app run.py db upgrade

# Generate a new migration after model changes
docker compose --profile dev exec backend python -m flask --app run.py db migrate -m "description of changes"

# Copy migration file out of the container
docker compose --profile dev cp backend:/app/migrations/versions/<filename> backend/migrations/versions/
```

## Useful Docker Commands

```bash
# Run in detached mode (background)
docker compose --profile dev up --build -d

# View logs
docker compose --profile dev logs -f

# View logs for a specific service
docker compose --profile dev logs -f backend

# Stop all services
docker compose --profile dev down

# Stop and remove volumes (resets database)
docker compose --profile dev down -v

# Check service status
docker compose --profile dev ps
```

## Troubleshooting

**Port already in use**
Stop other services using ports 5173, 8080, or 55432, or modify the ports in `docker-compose.yml`.

**Database connection or migration errors**
Reset the database and rebuild:
```bash
docker compose --profile dev down -v && docker compose --profile dev up --build
```

**Changes not reflected**
Rebuild the affected service:
```bash
docker compose --profile dev up -d --build backend
docker compose --profile dev up -d --build frontend
```

## Deployed Environments

| Environment | Frontend | API / Swagger |
|-------------|----------|---------------|
| Staging | https://ui-staging.nausicaaglobalgreeninitiative.ie | https://api-staging.nausicaaglobalgreeninitiative.ie/api/v1/ui |
| Production | https://ui.nausicaaglobalgreeninitiative.ie | https://api.nausicaaglobalgreeninitiative.ie/api/v1/ui |

## Further Reading

- [Backend README](./backend/README.md) - Flask API details, manual (non-Docker) setup
- [Frontend README](./frontend/README.md) - React app details, manual setup
- [Infrastructure README](./infrastructure/README.md) - Terraform, Azure/AKS, CI/CD pipelines, deployment process
