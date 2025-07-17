resource "aws_secretsmanager_secret" "aurora_credentials" {
  name = "tend-attend-aurora-credentials"
}

data "aws_secretsmanager_secret" "data_aurora_credentials" {
  arn = aws_secretsmanager_secret.aurora_credentials.arn
}

resource "random_password" "aurora_master_password" {
  length           = 16
  special          = true
  override_special = "!%&*()-_=+[]{}<>:?"
  min_lower        = 1
  min_numeric      = 1
  min_special      = 1
  min_upper        = 1
}

resource "aws_secretsmanager_secret_version" "aurora_credentials" {
  secret_id = aws_secretsmanager_secret.aurora_credentials.id
  secret_string = jsonencode({
    port     = 3306
    username = "user",
    password = random_password.aurora_master_password.result
  })
}

data "aws_secretsmanager_secret_version" "data_aurora_credentials" {
  secret_id = data.aws_secretsmanager_secret.data_aurora_credentials.id
}
