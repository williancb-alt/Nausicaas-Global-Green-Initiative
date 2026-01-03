# Nausicaas Global Green Initiative - Backend API

Flask REST API with PostgreSQL database for managing grants and user authentication.

## Tech Stack

- **Python**: 3.11+
- **Framework**: Flask 3.1.0+
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy
- **API Documentation**: Flask-RESTx (Swagger UI)
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: Flask-Bcrypt
- **Migrations**: Flask-Migrate (Alembic)
- **Package Manager**: `uv` (fast Python package installer)
- **Testing**: pytest, tox
- **Code Quality**: Black, Flake8, pre-commit

## Running Locally

### Option 1 - Using Docker Compose

From root directory within project

Ensure that Docker is running on the local machine, then run the below command

```
docker compose up --build
```

Database migrations set to run automatically within the setup

To add a user for testing, open a new terminal and run the below command (changing email to your own)

```
docker compose exec backend python -m flask --app run.py add-user demo@example.com --admin
```

### Option 2 - Manually

#### Pre-requisites

- Python 3.11 or higher
- PostgreSQL 16
- `uv` package manager ([installation guide](https://github.com/astral-sh/uv))

#### Starting server locally

Have Postgres running locally

Create databases for use across environments with the following names

```
nausicaa_dev
nausicaa_test
nausicaa_prod
```

Navigate to backend directory

```
cd backend
```

Create virtual environment

```
uv venv
```

Activate the virtual environment

```
source .venv/bin/activate
```

Install dependencies

```
uv pip install -e ".[dev]"
```

Add .env file (see .env.sample for required values)

Run migrations using the below command

```
uv run flask --app run.py db upgrade
```

Run the Flask server

```
uv run flask --app run.py run
```

## Useful commands

### Running the api

```
uv run flask --app run.py run
```

### Running Tox for testing and linting checks

```
uv run tox
```

### Adding new database migration

Add new model within models directory with target table properties (see other existing files in the directory for example)

Replace message with description of migration you are adding

```
uv run flask --app db migrate --message "add grant model"
```

Once the new migration files have been populated, run the below to update the local database

```
uv run flask --app run.py db upgrade
```

## API Documentation

Once the Flask server is running, the Swagger API documentation can be accessed at:

- **Swagger UI**: http://127.0.0.1:5000/api/v1/ui
