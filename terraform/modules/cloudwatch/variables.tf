variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  type        = string
}

variable "lambda_function_names" {
  description = "List of Lambda function names to create log groups for"
  type        = list(string)
}
