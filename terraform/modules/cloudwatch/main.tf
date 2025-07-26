resource "aws_cloudwatch_log_group" "cloudfront" {
  name              = "/aws/cloudfront/tend-attend"
  retention_in_days = var.log_retention_days
}
