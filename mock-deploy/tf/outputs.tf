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

#output "jwt_secret_arn" {
#    description = "JWT secret ARN; populate its plain-text value before starting ECS tasks"
#    value       = aws_secretsmanager_secret.jwt.arn
#}