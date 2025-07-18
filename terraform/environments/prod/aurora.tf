module "aurora" {
  source                          = "../../modules/aurora"
  aurora_credentials              = module.secrets_manager.aurora_credentials
  aurora_subnet_group_name        = module.vpc.aurora_subnet_group_name
  aurora_security_group_ids       = [module.private_sg.aurora_sg_id]
  aurora_max_capacity             = 1.0
  aurora_min_capacity             = 0.0
  aurora_seconds_until_auto_pause = 300
}
