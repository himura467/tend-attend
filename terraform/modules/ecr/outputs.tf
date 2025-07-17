output "qrcode_server_arn" {
  description = "The ARN of the ECR repository for the QR code server Lambda function"
  value       = aws_ecr_repository.qrcode_server.arn
}

output "qrcode_server_url" {
  description = "The URL of the ECR repository for the QR code server Lambda function"
  value       = aws_ecr_repository.qrcode_server.repository_url
}
