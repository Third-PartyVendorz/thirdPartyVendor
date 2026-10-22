resource "aws_security_group" "alb_security" {
    name        = "tpv-load-balancer-security"
    description = "Controls access to the ALB"
    vpc_id      = aws_vpc.vpc.id

    ingress {
        protocol    = "tcp"
        from_port   = var.spring_port
        to_port     = var.spring_port
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        protocol    = "-1"
        from_port   = 0
        to_port     = 0
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_security_group" "ecs_security" {
    name        = "ecs-security"
    description = "Controls access to the ecs, ensure we only get traffic from alb"
    vpc_id      = aws_vpc.vpc.id

    ingress {
        protocol    = "tcp"
        from_port   = var.spring_port
        to_port     = var.spring_port
        security_groups = [aws_security_group.alb_security.id]
    }

    egress {
        protocol    = "-1"
        from_port   = 0
        to_port     = 0
        cidr_blocks = ["0.0.0.0/0"]
    }
}


