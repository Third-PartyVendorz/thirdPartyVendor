resource "aws_ecs_cluster" "ecs_cluster" {
  name = "tpv-ecs-cluster"
}

data "template_file" "task_def_template" {
    template = file("./templates/taskdef.json.tpl")

  vars = {
        app_image = "${aws_ecr_repository.spring_repository.repository_url}:${var.spring_image}"
        fargate_cpu = "256"
        fargate_memory = "512"
        aws_region = var.region
        log_group_name = aws_cloudwatch_log_group.tpv_spring_logs.name
        app_port = var.spring_port
        db_host_json = jsonencode(aws_db_instance.rds_primary.address)
        db_port_json = jsonencode(tostring(aws_db_instance.rds_primary.port))
        db_name_json = jsonencode(aws_db_instance.rds_primary.db_name)
        db_user_json = jsonencode(var.database_username)
        db_password_json = jsonencode(var.database_password)
    }
}

resource "aws_ecs_task_definition" "spring_task_def" {
    family = "tpv-spring-task"
    execution_role_arn = aws_iam_role.ecs_task_excecution_role.arn
    network_mode = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu = "256"
    memory = "512"
    container_definitions = data.template_file.task_def_template.rendered
}

resource "aws_ecs_service" "spring_ecs_service" {
    name = "tpv-spring-service"
    cluster = aws_ecs_cluster.ecs_cluster.id
    task_definition = aws_ecs_task_definition.spring_task_def.arn 
    desired_count = 2
    launch_type = "FARGATE"

    network_configuration {
        security_groups = [aws_security_group.ecs_security.id]
        subnets = aws_subnet.private.*.id
    }

    load_balancer {
        target_group_arn = aws_alb_target_group.alb_target_group.id
        container_name = "tpv"
        container_port = var.spring_port
    }

    depends_on = [aws_alb_listener.alb_listener]
}



# Going to need the analytics service defined here as well