module "cloudfront" {
  source                      = "../../modules/cloudfront"
  backend_function_url_domain = module.lambda.backend_function_url_domain
  origin_keepalive_timeout    = 5
  origin_read_timeout         = 30
  qrcode_function_url_domain  = module.lambda.qrcode_function_url_domain
  domain_name                 = "aws.${module.op.domain_name}"
  certificate_arn             = module.route53.certificate_arn
}
