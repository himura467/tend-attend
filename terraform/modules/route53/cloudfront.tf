resource "aws_route53_record" "cloudfront" {
  name    = var.domain_name
  zone_id = aws_route53_zone.this.zone_id
  type    = "A"
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = true
  }
}
