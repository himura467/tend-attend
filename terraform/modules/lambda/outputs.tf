output "backend_function_url_domain" {
  description = "Backend Lambda function URL domain"
  value       = replace(replace(aws_lambda_function_url.backend.function_url, "https://", ""), "/", "")
}

output "qrcode_function_arn" {
  description = "Function ARN of the QR code Lambda function"
  value       = aws_lambda_function.qrcode.arn
}

output "qrcode_function_url_domain" {
  description = "QR code Lambda function URL domain"
  value       = replace(replace(aws_lambda_function_url.qrcode.function_url, "https://", ""), "/", "")
}
