# Quickstart Guide

Get the Nausicaä's Global Green Initiative application running locally with Docker.

## Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

## Setup

### 1. Clone the Repository & Checkout relevant branch

```bash
git clone https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative.git
cd Nausicaas-Global-Green-Initiative
```

If you aren't working on main (which is advised) checkout the relavent branch:

````bash
git checkout branch-name
````

### 2. Build and Start the Application

```bash
docker compose up --build
```

This will:
- Pull the PostgreSQL 16 image
- Build the Flask backend
- Build the React frontend
- Run database migrations automatically
- Start all services

Wait until you see logs indicating all services are ready

### 3. Create a User

With a fresh clone, the database has no users. Create one using the signup form or CLI.

**Option A: Via the UI**

1. Open http://localhost:5173
2. Click **Sign up**
3. Enter an email and password

**Option B: Via Command Line**

Open a new terminal window in the root directory (don't use the window currently running docker).

```bash
# Create an admin user
docker compose exec backend python -m flask --app run.py add-user admin@example.com --admin

# Create a regular user
docker compose exec backend python -m flask --app run.py add-user user@example.com
```

You will be prompted to enter a password.

**Recommended: Create both user types for testing**

```bash
docker compose exec backend python -m flask --app run.py add-user admin@test.com --admin
docker compose exec backend python -m flask --app run.py add-user user@test.com
```

This allows you to test the application from both admin and regular user perspectives.

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend (Web App) | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI (API Docs) | http://localhost:8080/api/v1/ui |

Log in with your credentials and you can create and manage grants from the home page.

> **Note:** Admin privileges are required to create, update, and delete grants. Regular users can view grants only.

## Useful Commands

```bash
# Run in detached mode (background)
docker compose up --build -d

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v

# Check service status
docker compose ps
```

## Running Tests

### Backend Tests

```bash
# Run all backend tests with tox
docker compose exec backend /app/.venv/bin/python -m tox

# Run pytest directly (faster, skips linting)
docker compose exec backend /app/.venv/bin/python -m pytest tests/ -v
```

### Frontend Tests

Frontend tests run locally (not in Docker):

```bash
cd frontend
npm install
npm test
```

## Database Commands

### Inspect Database Tables

```bash
# Connect to PostgreSQL
docker compose exec db psql -U postgres -d nausicaa_dev

# List all tables
docker compose exec db psql -U postgres -d nausicaa_dev -c "\dt"

# View grant table structure
docker compose exec db psql -U postgres -d nausicaa_dev -c '\d "grant"'

# View user table structure
docker compose exec db psql -U postgres -d nausicaa_dev -c '\d "user"'

# Query all grants (grant is a reserved word, must be quoted)
docker compose exec db psql -U postgres -d nausicaa_dev -c 'SELECT * FROM "grant";'

# Query all users
docker compose exec db psql -U postgres -d nausicaa_dev -c "SELECT id, email, admin FROM \"user\";"
```

### Database Migrations

```bash
# Apply pending migrations
docker compose exec backend /app/.venv/bin/python -m flask --app run.py db upgrade

# Generate a new migration after model changes
docker compose exec backend /app/.venv/bin/python -m flask --app run.py db migrate -m "description of changes"

# View migration history
docker compose exec backend /app/.venv/bin/python -m flask --app run.py db history
```

### Create Test Database (for running tests)

```bash
docker compose exec db psql -U postgres -c "CREATE DATABASE nausicaa_test;"
```

## Troubleshooting

**Port already in use**
Stop other services using ports 5173, 8080, or 55432, or modify the ports in `docker-compose.yml`.

**Database connection errors**
Ensure the `db` service is healthy before the backend starts. Run `docker compose down -v` and try again.

**Changes not reflected**
Rebuild with `docker compose up --build`.

**Migration errors ("Can't locate revision")**
The database migration history is out of sync. Reset the database:
```bash
docker compose down -v
docker compose up -d
```

**Column does not exist errors**
Run database migrations:
```bash
docker compose exec backend /app/.venv/bin/python -m flask --app run.py db upgrade
docker compose restart backend
```

## Manual Setup (Without Docker)

For running the frontend or backend manually, see:
- [Backend README](./backend/README.md) - Python/Flask setup with `uv`
- [Frontend README](./frontend/README.md) - Node.js/React setup with `npm`
