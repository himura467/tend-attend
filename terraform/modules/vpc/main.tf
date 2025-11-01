locals {
  private_cidr = cidrsubnet(var.vpc_cidr, 1, 0)
  public_cidr  = cidrsubnet(var.vpc_cidr, 1, 1)

  # This value is used to further divide the public/private CIDR blocks into subnets for each AZ.
  # We add +1 to the original VPC CIDR prefix because the public/private CIDRs have already been split once.
  # subnet_bits represents the number of bits needed to reach the target subnet size from the split public/private CIDR.
  subnet_bits = var.subnet_mask - (split("/", var.vpc_cidr)[1] + 1)
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "private" {
  count             = length(data.aws_availability_zones.available.names)
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(local.private_cidr, local.subnet_bits, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}

resource "aws_subnet" "public" {
  count                   = length(data.aws_availability_zones.available.names)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(local.public_cidr, local.subnet_bits, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_eip" "this" {
  count  = length(data.aws_availability_zones.available.names)
  domain = "vpc"
}

resource "aws_nat_gateway" "this" {
  count         = length(data.aws_availability_zones.available.names)
  subnet_id     = aws_subnet.public[count.index].id
  allocation_id = aws_eip.this[count.index].id
}

resource "aws_route_table" "private" {
  count  = length(data.aws_availability_zones.available.names)
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route" "private_default" {
  count                  = length(data.aws_availability_zones.available.names)
  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[count.index].id
}

resource "aws_route" "public_default" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_route_table_association" "private" {
  count          = length(data.aws_availability_zones.available.names)
  route_table_id = aws_route_table.private[count.index].id
  subnet_id      = aws_subnet.private[count.index].id
}

resource "aws_route_table_association" "public" {
  count          = length(data.aws_availability_zones.available.names)
  route_table_id = aws_route_table.public[count.index].id
  subnet_id      = aws_subnet.public[count.index].id
}
