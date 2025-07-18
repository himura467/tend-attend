module "gha" {
  source                = "../../modules/gha"
  github_org            = module.op.github_org
  github_repo           = module.op.github_repo
  qrcode_server_ecr_arn = module.ecr.qrcode_server_arn
  # qrcode_lambda_arn     = module.lambda.qrcode_function_arn
}
