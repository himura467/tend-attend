variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "subnet_mask" {
  description = "Subnet mask for the VPC"
  type        = number
}
