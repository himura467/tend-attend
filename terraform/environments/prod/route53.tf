module "route53" {
  source                    = "../../modules/route53"
  domain_name               = "aws.${module.op.domain_name}"
  cloudfront_domain_name    = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id = module.cloudfront.distribution_hosted_zone_id
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}
