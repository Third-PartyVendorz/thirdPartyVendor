data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "forward_api_data" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "api" {
  enabled = true
  comment = "TPV API"

  origin {
    domain_name = aws_alb.load_balancer.dns_name
    origin_id   = "tpv-alb-api"

    custom_origin_config {
      http_port              = var.spring_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "tpv-alb-api"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"
    ]
    cached_methods = ["GET", "HEAD", "OPTIONS"]

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.forward_api_data.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "api_https_url" {
  value = "https://${aws_cloudfront_distribution.api.domain_name}"
}