terraform {
  backend "s3" {
    bucket       = "tend-attend-terraform-state"
    key          = "terraform.tfstate"
    acl          = "private"
    encrypt      = true
    use_lockfile = true
  }
}
