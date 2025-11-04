resource "aws_rds_cluster_parameter_group" "aurora" {
  name = "tend-attend-cluster-parameter-group"
  # Change when Aurora MySQL 8.4 is released
  family = "aurora-mysql8.0"
  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name  = "collation_server"
    value = "utf8mb4_general_ci"
  }
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "tend-attend-cluster"
  engine             = "aurora-mysql"
  engine_mode        = "provisioned"
  # https://docs.aws.amazon.com/AmazonRDS/latest/AuroraMySQLReleaseNotes/AuroraMySQL.Updates.30Updates.html
  engine_version                  = "8.0.mysql_aurora.3.09.0"
  port                            = var.aurora_credentials.port
  master_username                 = var.aurora_credentials.username
  master_password                 = var.aurora_credentials.password
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.aurora.name
  db_subnet_group_name            = var.aurora_subnet_group_name
  vpc_security_group_ids          = var.aurora_security_group_ids
  network_type                    = "DUAL"
  enable_http_endpoint            = true
  serverlessv2_scaling_configuration {
    max_capacity             = var.aurora_max_capacity
    min_capacity             = var.aurora_min_capacity
    seconds_until_auto_pause = var.aurora_seconds_until_auto_pause
  }
  deletion_protection = false
  skip_final_snapshot = true
}

resource "aws_rds_cluster_instance" "aurora" {
  identifier         = "tend-attend-instance"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}
