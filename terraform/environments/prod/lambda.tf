module "lambda" {
  source                     = "../../modules/lambda"
  cloudfront_arn             = module.cloudfront.distribution_arn
  allow_origins              = ["https://www.${module.op.domain_name}"]
  backend_lambda_timeout     = 900
  backend_lambda_memory_size = 128
  subnet_ids                 = module.vpc.private_subnets[*].id
  security_group_ids         = [module.private_sg.aurora_sg_id]
  cookie_domain              = module.op.domain_name
  jwt_secret_key             = module.op.jwt_secret_key
  aurora_credentials         = module.secrets_manager.aurora_credentials
  aws_region                 = var.aws_region
  db_shard_count             = module.op.db_shard_count
  rds_cluster_instance_url   = module.aurora.rds_cluster_instance_url
  common_dbname              = module.op.common_dbname
  sequence_dbname            = module.op.sequence_dbname
  shard_dbname_prefix        = module.op.shard_dbname_prefix
  ml_server_url              = "" # TODO: Set this to the actual ML server URL after implementation
  qrcode_ecr_repository_url  = module.ecr.qrcode_ecr_repository_url
  qrcode_lambda_timeout      = 60
  qrcode_lambda_memory_size  = 128
  domain_name                = module.op.domain_name
  depends_on                 = [module.ecr]
}
