resource "aws_alb" "load_balancer" {
    name    = "tpv-alb"
    subnets = aws_subnet.public.*.id
    security_groups = [aws_security_group.alb_security.id]
}

resource "aws_alb_target_group" "alb_target_group" {
    name = "tpv-alb-target-group"
    port = var.spring_port
    protocol = "HTTP"
    vpc_id = aws_vpc.vpc.id
    target_type = "ip"

    health_check {
        healthy_threshold  = "3"
        interval            = "30"
        protocol            = "HTTP"
        matcher             = "200"
        timeout             = "3"
        path                = var.health_check_path
        unhealthy_threshold = "2"
    }
}

resource "aws_alb_listener" "alb_listener" {
    load_balancer_arn = aws_alb.load_balancer.id
    port = var.spring_port
    protocol = "HTTP"

    default_action {
        target_group_arn = aws_alb_target_group.alb_target_group.id
        type = "forward"
    }
}