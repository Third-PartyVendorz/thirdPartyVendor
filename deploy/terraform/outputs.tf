output "alb_hostname" {
    value = aws_alb.load_balancer.dns_name
}

output "rds_hostname" {
    value = aws_db_instance.rds_primary.address
}

output "rds_connector_function_name" {
    description = "Lambda function used to verify private RDS connectivity"
    value       = aws_lambda_function.rds_connector.function_name
}

output "api_https_url" {
  description = "API base URL; CloudFront strips /api before forwarding to the ALB."
  value       = "https://${aws_cloudfront_distribution.api.domain_name}/api"
}

output "frontend_https_url" {
  description = "Frontend URL served from the private S3 bucket."
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
}