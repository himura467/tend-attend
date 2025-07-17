output "vpc" {
  description = "VPC"
  value       = aws_vpc.this
}

output "private_subnets" {
  description = "List of private subnets"
  value       = aws_subnet.private[*]
}

output "aurora_subnet_group_name" {
  description = "Name of the Aurora subnet group"
  value       = aws_db_subnet_group.aurora.name
}
