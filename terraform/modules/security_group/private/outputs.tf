output "lambda_sg_id" {
  description = "ID of the Lambda security group"
  value       = aws_security_group.lambda.id
}

output "aurora_sg_id" {
  description = "ID of the Aurora security group"
  value       = aws_security_group.aurora.id
}
