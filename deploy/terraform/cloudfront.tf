data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "frontend" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "forward_api_data" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_origin_access_control" "OAC_s3" {
  name                              = "s3-assets-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Only frontend requests use the SPA fallback; API errors remain API errors.
resource "aws_cloudfront_function" "frontend_routes" {
  name    = "tpv-frontend-routes"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var request = event.request;
      var lastSegment = request.uri.substring(request.uri.lastIndexOf('/') + 1);

      if (lastSegment.indexOf('.') === -1) {
        request.uri = '/index.html';
      }

      return request;
    }
  JS
}

# Backend controllers and ALB analytics routing expect paths without /api.
# Rewriting the URI does not change the already-selected origin/cache behavior.
resource "aws_cloudfront_function" "api_routes" {
  name    = "tpv-api-routes"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var request = event.request;
      request.uri = request.uri.substring(4) || '/';
      return request;
    }
  JS
}

resource "aws_cloudfront_distribution" "api" {
  enabled             = true
  comment             = "TPV frontend and API"
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id                = "tpv-s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.OAC_s3.id
  }

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
    target_origin_id       = "tpv-s3-frontend"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    compress        = true
    cache_policy_id = data.aws_cloudfront_cache_policy.frontend.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.frontend_routes.arn
    }
  }

  # Include the exact /api path as well as requests below /api/.
  dynamic "ordered_cache_behavior" {
    for_each = ["/api", "/api/*"]

    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = "tpv-alb-api"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods  = ["GET", "HEAD", "OPTIONS"]

      cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.forward_api_data.id

      function_association {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.api_routes.arn
      }
    }
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