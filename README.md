# Collector API

Simple implementation of the Collector API project.

## Project Structure

- `app/`: Main application code
  - `core/`: Configuration and security
  - `db/`: Database session and base models
  - `models/`: SQLAlchemy models
  - `schemas/`: Pydantic schemas
  - `services/`: Business logic services
  - `api/`: API endpoints and router
- `tests/`: Test suite
- `Dockerfile` & `docker-compose.yml`: Containerization

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

## Running with Docker (Recommended)

1.  Build and start the containers:
    ```bash
    docker-compose up --build
    ```
2.  The API will be available at `http://localhost:8000`.
3.  Swagger UI documentation: `http://localhost:8000/docs` (default FastAPI docs).

## Running Locally

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Start the database (e.g., using Docker for just Postgres):
    ```bash
    docker-compose up db -d
    ```
3.  Run the application:
    ```bash
    uvicorn app.main:app --reload
    ```

## Running Tests

To run the tests, you can use `pytest`:

```bash
pytest
```
Note: Tests use an in-memory SQLite database, so no external DB is required for testing.
