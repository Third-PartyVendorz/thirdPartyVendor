output "alb_hostname" {
    value = aws_alb.load_balancer.dns_name
}

output "rds_hostname" {
    value = aws_db_instance.rds_primary.address
}