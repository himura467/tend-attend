output "bucket_domain_name" {
  description = "The bucket domain name for the logs S3 bucket"
  value       = aws_s3_bucket.logs.bucket_domain_name
}
