module "cloudwatch" {
  source = "../../modules/cloudwatch"
  providers = {
    aws.us_east_1 = aws.us_east_1
  }
}
