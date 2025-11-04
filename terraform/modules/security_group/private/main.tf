resource "aws_security_group" "lambda" {
  name   = "tend-attend-lambda-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_egress_rule" "lambda_ipv6" {
  security_group_id = aws_security_group.lambda.id
  description       = "Allow all outbound IPv6 traffic"
  ip_protocol       = "-1"
  cidr_ipv6         = "::/0"
}

resource "aws_security_group" "aurora" {
  name   = "tend-attend-aurora-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "aurora_mysql" {
  security_group_id            = aws_security_group.aurora.id
  description                  = "Allow MySQL access from Lambda functions"
  from_port                    = 3306
  to_port                      = 3306
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.lambda.id
}

resource "aws_vpc_security_group_egress_rule" "aurora_ipv6" {
  security_group_id = aws_security_group.aurora.id
  description       = "Allow all outbound IPv6 traffic"
  ip_protocol       = "-1"
  cidr_ipv6         = "::/0"
}
