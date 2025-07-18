variable "aurora_credentials" {
  description = "Credentials for the Aurora database"
  type        = map(string)
}

variable "aurora_subnet_group_name" {
  description = "Name of the Aurora subnet group"
  type        = string
}

variable "aurora_security_group_ids" {
  description = "IDs of the Aurora security groups"
  type        = list(string)
}

variable "aurora_max_capacity" {
  description = "Max capacity of the Aurora cluster"
  type        = number
}

variable "aurora_min_capacity" {
  description = "Min capacity of the Aurora cluster"
  type        = number
}

variable "aurora_seconds_until_auto_pause" {
  description = "Seconds until auto pause for the Aurora cluster"
  type        = number
}
