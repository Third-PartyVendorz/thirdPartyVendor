#target group 
#LB itself
#Listener

resource "aws_alb" "alb" {
  count              = var.create_alb == true ? 1 : 0
  name               = "alb-${var.name}"
  subnets            = [var.subnets[0], var.subnets[1]]
  security_groups    = [var.security_group]
  load_balancer_type = "application"
}

# ------- ALB Listener for HTTP -------
resource "aws_alb_listener" "http_listener" {
  count             = var.create_alb == true ? 1 : 0
  load_balancer_arn = aws_alb.alb[0].id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = var.target_group
    type             = "forward"
  }

}

# ------- Target Groups for ALB -------
resource "aws_alb_target_group" "target_group" {
  count                = var.create_target_group == true ? 1 : 0
  name                 = var.name
  port                 = var.port
  protocol             = var.protocol
  vpc_id               = var.vpc
  target_type          = var.tg_type
# health_check_path    = var.health_check_path
# health_check_port    = var.health_check_port
}