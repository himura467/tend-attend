# Bash commands

## Direct Terraform (in `/environments/prod/`)

- `OP_VAULT_NAME='Tend Attend' OP_APP_ENV='Production' op run --env-file ../../provider.env -- terraform init`
- `OP_VAULT_NAME='Tend Attend' OP_APP_ENV='Production' op run --env-file ../../provider.env -- terraform plan`
- `OP_VAULT_NAME='Tend Attend' OP_APP_ENV='Production' op run --env-file ../../provider.env -- terraform apply`

# Modules

- `/modules/`: Reusable Terraform modules
- `/environments/prod/`: Production environment configuration
