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
