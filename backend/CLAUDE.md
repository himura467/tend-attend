# Bash commands

- `OP_VAULT_NAME="Tend Attend" OP_APP_ENV="Local" op run --env-file app.env -- uv run uvicorn app.main:app --reload`: Local development server
- `uv run mypy .`: Type checking
- `uv run ruff check`: Linting
- `uv run ruff format`: Code formatting
- `OP_VAULT_NAME="Tend Attend" OP_APP_ENV="Local" op run --env-file app.env -- uv run alembic upgrade head`: Apply database migrations
- `OP_VAULT_NAME="Tend Attend" OP_APP_ENV="Local" op run --env-file app.env -- uv run alembic revision --autogenerate -m "description"`: Create migration

# Code style guidelines

- Python 3.13 with strict typing
- FastAPI with clean architecture pattern
- SQLAlchemy 2.0 with async support
- Use UV for dependency management

# Testing instructions

- No test framework currently configured

# Architecture

## Clean Architecture Layers

- **`/api/`**: FastAPI routes and controllers with dependency injection
- **`/core/domain/`**: Business entities
- **`/core/usecase/`**: Application business rules and orchestration
- **`/core/infrastructure/`**: Database models, AWS integrations, SQLAlchemy implementations

## Repository Pattern

- **Generic typed repositories** with async SQLAlchemy implementation
- **Entity-Model mapping** with `to_entity()` and `from_entity()` methods
- **Unit of Work pattern** for transactional integrity
- **Dependency injection** of repositories into use cases

## Authentication & Authorization

- **JWT-based authentication** with access tokens and refresh tokens
- **Role-based access** (HOST/GUEST groups)
- **Secure HTTP-only cookies** with cryptographic signatures
- **1Password CLI integration** for local development secrets

## Database Sharding

- **Multi-database architecture** with data partitioned across separate databases
- **Common database**: Shared data accessible across all users
- **Sequence database**: Centralized ID generation for distributed system
- **Shard databases**: User-specific data partitioned by user identifier
- **SQLAlchemy ShardedSession** with custom chooser functions for automatic routing

## Working with this Architecture

1. **Respect layer dependencies**: API → Use Cases → Domain → Infrastructure
2. **Use dependency injection**: Follow the dependency inversion principle throughout
