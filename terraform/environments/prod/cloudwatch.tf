module "cloudwatch" {
  source                      = "../../modules/cloudwatch"
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  lambda_function_names       = [module.lambda.backend_function_name, module.lambda.qrcode_function_name]
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}
