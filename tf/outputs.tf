output "alb_hostname" {
    value = aws_alb.load_balancer.dns_name
}