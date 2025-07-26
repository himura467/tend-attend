module "cloudwatch" {
  source                      = "../../modules/cloudwatch"
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  providers = {
    aws.us_east_1 = aws.us_east_1
  }
}
