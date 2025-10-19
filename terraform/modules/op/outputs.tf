output "github_org" {
  description = "GitHub organization name"
  value       = local.fields["GitHub Org"]
}

output "github_repo" {
  description = "GitHub repository name"
  value       = local.fields["GitHub Repo"]
}

output "domain_name" {
  description = "Domain name for the application"
  value       = local.fields["Domain Name"]
}

output "admin_username" {
  description = "Admin username for the application"
  value       = local.fields["Admin Username"]
  sensitive   = true
}

output "admin_password" {
  description = "Admin password for the application"
  value       = local.fields["Admin Password"]
  sensitive   = true
}

output "jwt_secret_key" {
  description = "JWT secret key used for signing tokens"
  value       = local.fields["JWT Secret Key"]
  sensitive   = true
}

output "db_shard_count" {
  description = "Number of shards for the database"
  value       = local.fields["DB Shard Count"]
}

output "common_dbname" {
  description = "Common database name"
  value       = local.fields["Common DB Name"]
}

output "sequence_dbname" {
  description = "Sequence database name"
  value       = local.fields["Sequence DB Name"]
}

output "shard_dbname_prefix" {
  description = "Prefix for shard database names"
  value       = local.fields["Shard DB Name Prefix"]
}

output "google_oauth_client_id" {
  description = "Google OAuth Client ID for Calendar API"
  value       = local.fields["Google OAuth Client ID"]
  sensitive   = true
}

output "google_oauth_client_secret" {
  description = "Google OAuth Client Secret for Calendar API"
  value       = local.fields["Google OAuth Client Secret"]
  sensitive   = true
}

output "google_oauth_redirect_uri" {
  description = "Google OAuth Redirect URI for Calendar API"
  value       = local.fields["Google OAuth Redirect URI"]
}

output "google_tokens_encryption_key" {
  description = "Encryption key for Google OAuth tokens"
  value       = local.fields["Google Tokens Encryption Key"]
  sensitive   = true
}
