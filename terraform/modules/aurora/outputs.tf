output "rds_cluster_instance_url" {
  description = "RDS cluster instance URL"
  value       = aws_rds_cluster_instance.aurora.endpoint
}
