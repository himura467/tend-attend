locals {
  # private_cidr = cidrsubnet(var.vpc_cidr, 1, 0)
  # public_cidr = cidrsubnet(var.vpc_cidr, 1, 1)
  subnet_bits = var.subnet_mask - split("/", var.vpc_cidr)[1]
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "this" {
  cidr_block                       = var.vpc_cidr
  assign_generated_ipv6_cidr_block = true
  enable_dns_support               = true
  enable_dns_hostnames             = true
}

resource "aws_subnet" "private" {
  count                           = length(data.aws_availability_zones.available.names)
  vpc_id                          = aws_vpc.this.id
  cidr_block                      = cidrsubnet(aws_vpc.this.cidr_block, local.subnet_bits, count.index)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.this.ipv6_cidr_block, local.subnet_bits, count.index)
  assign_ipv6_address_on_creation = true
  availability_zone               = data.aws_availability_zones.available.names[count.index]
}

resource "aws_egress_only_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table" "private" {
  count  = length(data.aws_availability_zones.available.names)
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table_association" "private" {
  count          = length(data.aws_availability_zones.available.names)
  route_table_id = aws_route_table.private[count.index].id
  subnet_id      = aws_subnet.private[count.index].id
}

resource "aws_route" "private_default" {
  count                       = length(data.aws_availability_zones.available.names)
  route_table_id              = aws_route_table.private[count.index].id
  destination_ipv6_cidr_block = "::/0"
  egress_only_gateway_id      = aws_egress_only_internet_gateway.this.id
}
