module "private_sg" {
  source = "../../modules/security_group/private"
  vpc_id = module.vpc.vpc.id
}
