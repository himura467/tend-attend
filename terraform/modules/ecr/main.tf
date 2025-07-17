resource "aws_ecr_repository" "qrcode_server" {
  name                 = "tend-attend-qrcode"
  image_tag_mutability = "IMMUTABLE"
}

data "aws_ecr_lifecycle_policy_document" "qrcode_server" {
  rule {
    priority    = 1
    description = "Keep only the last 2 images"
    selection {
      tag_status   = "any"
      count_type   = "imageCountMoreThan"
      count_number = 2
    }
    action {
      type = "expire"
    }
  }
}

resource "aws_ecr_lifecycle_policy" "qrcode_server" {
  repository = aws_ecr_repository.qrcode_server.name
  policy     = data.aws_ecr_lifecycle_policy_document.qrcode_server.json
}
