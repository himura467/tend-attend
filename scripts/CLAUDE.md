# Bash commands

- `./scripts/deploy.sh prod`: Deploy everything to production
- `./scripts/build_backend.sh`: Build backend Lambda layers only
- `./scripts/export_requirements.sh`: Export UV dependencies to requirements.txt

# Scripts overview

## Deployment workflow

### Full deployment process

1. Build backend Lambda layers with `./scripts/build_backend.sh`
2. Deploy infrastructure with `./scripts/deploy.sh prod`
3. Requires 1Password CLI with "Tend Attend" vault access

## Script details

### `deploy.sh`

- Takes environment parameter (currently only `prod` supported)
- Runs in `/terraform/environments/{env}/` directory
- Uses 1Password CLI integration: `OP_VAULT_NAME="Tend Attend" OP_APP_ENV="Production"`
- Executes `terraform init` and `terraform apply`

### `build_backend.sh`

- Creates Lambda deployment packages for backend service
- Handles Python dependencies and application layers
- Must be run before Terraform deployment of Lambda functions

### `export_requirements.sh`

- Exports UV dependencies from backend/pyproject.toml to requirements.txt
- Uses `uv export --format requirements.txt --no-dev --no-hashes`
- Places requirements.txt in project root for compatibility
