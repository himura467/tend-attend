output "aurora_credentials" {
  description = "Credentials for the Aurora database"
  value = merge(
    jsondecode(data.aws_secretsmanager_secret_version.data_aurora_credentials.secret_string),
    {
      secret_id = data.aws_secretsmanager_secret_version.data_aurora_credentials.secret_id
    }
  )
  sensitive = true
}
