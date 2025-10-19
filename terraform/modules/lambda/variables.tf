variable "cloudfront_arn" {
  description = "ARN of the CloudFront distribution"
  type        = string
}

variable "allow_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
}

variable "backend_lambda_timeout" {
  description = "Timeout for the Backend Lambda function in seconds"
  type        = number
}

variable "backend_lambda_memory_size" {
  description = "Memory size for the Backend Lambda function in MB"
  type        = number
}

variable "subnet_ids" {
  description = "List of subnet IDs for the Lambda function"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for the Lambda function"
  type        = list(string)
}

variable "cookie_domain" {
  description = "Cookie domain"
  type        = string
}

variable "admin_username" {
  description = "Admin username"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Admin password"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "JWT secret key (openssl rand -hex 32)"
  type        = string
  sensitive   = true
}

variable "aurora_credentials" {
  description = "Credentials for the Aurora database"
  type        = map(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "db_shard_count" {
  description = "Number of shards for the DB"
  type        = number
}

variable "rds_cluster_instance_url" {
  description = "RDS cluster instance URL"
  type        = string
}

variable "common_dbname" {
  description = "Common DB name"
  type        = string
}

variable "sequence_dbname" {
  description = "Sequence DB name"
  type        = string
}

variable "shard_dbname_prefix" {
  description = "Shard DB name prefix"
  type        = string
}

variable "ml_server_url" {
  description = "URL of the ML server"
  type        = string
}

variable "google_oauth_client_id" {
  description = "Google OAuth Client ID for Calendar API"
  type        = string
  sensitive   = true
}

variable "google_oauth_client_secret" {
  description = "Google OAuth Client Secret for Calendar API"
  type        = string
  sensitive   = true
}

variable "google_oauth_redirect_uri" {
  description = "Google OAuth Redirect URI for Calendar API"
  type        = string
}

variable "google_tokens_encryption_key" {
  description = "Encryption key for Google OAuth tokens"
  type        = string
  sensitive   = true
}

variable "qrcode_ecr_repository_url" {
  description = "ECR repository URL for the QR code Lambda function"
  type        = string
}

variable "qrcode_lambda_timeout" {
  description = "Timeout for the QR code Lambda function in seconds"
  type        = number
}

variable "qrcode_lambda_memory_size" {
  description = "Memory size for the QR code Lambda function in MB"
  type        = number
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}
