resource "aws_cloudfront_cache_policy" "backend" {
  name        = "tend-attend-backend-cache-policy"
  min_ttl     = 0
  max_ttl     = 86400
  default_ttl = 0
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["content-type"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_cache_policy" "qrcode" {
  name        = "tend-attend-qrcode-cache-policy"
  min_ttl     = 0
  max_ttl     = 86400
  default_ttl = 86400
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["content-type"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "tend-attend-lambda-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  origin {
    domain_name              = var.backend_function_url_domain
    origin_id                = "backend"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "https-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_keepalive_timeout = var.origin_keepalive_timeout
      origin_read_timeout      = var.origin_read_timeout
    }
  }
  origin {
    domain_name              = var.qrcode_function_url_domain
    origin_id                = "qrcode"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "https-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_keepalive_timeout = var.origin_keepalive_timeout
      origin_read_timeout      = var.origin_read_timeout
    }
  }
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [var.domain_name]
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = aws_cloudfront_cache_policy.backend.id
    compress               = true
    target_origin_id       = "backend"
    viewer_protocol_policy = "https-only"
  }
  ordered_cache_behavior {
    path_pattern           = "/qrcode/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = aws_cloudfront_cache_policy.qrcode.id
    compress               = true
    target_origin_id       = "qrcode"
    viewer_protocol_policy = "https-only"
  }
  price_class = "PriceClass_200"
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
  logging_config {
    bucket          = var.logs_bucket_domain_name
    include_cookies = false
    prefix          = "cloudfront/"
  }
}
