output "aurora_sg_id" {
  description = "ID of the Aurora security group"
  value       = aws_security_group.aurora.id
}
