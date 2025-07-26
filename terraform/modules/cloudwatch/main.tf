resource "aws_cloudwatch_log_group" "cloudfront" {
  provider          = aws.us_east_1
  name              = "/aws/cloudfront/tend-attend"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_delivery_source" "cloudfront" {
  provider     = aws.us_east_1
  name         = "tend-attend-cloudfront"
  log_type     = "ACCESS_LOGS"
  resource_arn = var.cloudfront_distribution_arn
}

resource "aws_cloudwatch_log_delivery_destination" "cloudfront" {
  provider = aws.us_east_1
  name     = "tend-attend-cloudfront"
  delivery_destination_configuration {
    destination_resource_arn = aws_cloudwatch_log_group.cloudfront.arn
  }
}

resource "aws_cloudwatch_log_delivery" "cloudfront" {
  provider                 = aws.us_east_1
  delivery_source_name     = aws_cloudwatch_log_delivery_source.cloudfront.name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.cloudfront.arn
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each          = toset(var.lambda_function_names)
  name              = "/aws/lambda/${each.value}"
  retention_in_days = var.log_retention_days
}
