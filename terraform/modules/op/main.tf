data "onepassword_vault" "tend_attend" {
  name = "Tend Attend"
}

data "onepassword_item" "prod" {
  vault = data.onepassword_vault.tend_attend.uuid
  title = "Production"
}

locals {
  fields = {
    for s in data.onepassword_item.prod.section : s.label => {
      for f in s.field : f.label => f.value
    } if s.label == "Terraform"
  }["Terraform"]
}
