resource "aws_ecs_cluster" "ecs_cluster" {
  name = "tpv-ecs-cluster"
}

data "template_file" "task_def_template_spring" {
    template = file("./templates/taskdef.json.tpl")

  vars = {
        container_name = "tpv-spring"
        app_image = "${aws_ecr_repository.spring_repository.repository_url}:${var.spring_image}"
        fargate_cpu = "256"
        fargate_memory = "512"
        aws_region = var.region
        log_group_name = aws_cloudwatch_log_group.tpv_spring_logs.name
        app_port = var.spring_port
        datasource_url_json = jsonencode("jdbc:postgresql://${aws_db_instance.rds_primary.address}:${aws_db_instance.rds_primary.port}/${aws_db_instance.rds_primary.db_name}?sslmode=verify-full&sslrootcert=/app/global-bundle.pem")
        db_user_json = jsonencode(var.database_username)
        db_password_json = jsonencode(var.database_password)
        fauxnance_api_url_json = jsonencode(var.fauxnance_api_url)
        frontend_origin_json = jsonencode(var.frontend_origin)
        fauxnance_api_key_secret_arn_json = jsonencode(data.aws_secretsmanager_secret.fauxnance_key.arn)


        #jwt_secret_arn_json = jsonencode(aws_secretsmanager_secret.jwt.arn)

        jwt_secret_arn_json = jsonencode(data.aws_secretsmanager_secret.jwt.arn)
    }
}

data "template_file" "task_def_template_flask" {
    template = file("./templates/taskdef.json.tpl")

  vars = {
        container_name = "tpv-flask"
        app_image = "${aws_ecr_repository.flask_repository.repository_url}:${var.flask_image}"
        fargate_cpu = "256"
        fargate_memory = "512"
        aws_region = var.region
        log_group_name = aws_cloudwatch_log_group.tpv_flask_logs.name
        app_port = var.flask_port
        datasource_url_json = jsonencode("jdbc:postgresql://${aws_db_instance.rds_primary.address}:${aws_db_instance.rds_primary.port}/${aws_db_instance.rds_primary.db_name}?sslmode=verify-full&sslrootcert=/app/global-bundle.pem")
        db_user_json = jsonencode(var.database_username)
        db_password_json = jsonencode(var.database_password)
        fauxnance_api_url_json = jsonencode(var.fauxnance_api_url)
        frontend_origin_json = jsonencode(var.frontend_origin)
        fauxnance_api_key_secret_arn_json = jsonencode(data.aws_secretsmanager_secret.fauxnance_key.arn)


        #jwt_secret_arn_json = jsonencode(aws_secretsmanager_secret.jwt.arn)

        jwt_secret_arn_json = jsonencode(data.aws_secretsmanager_secret.jwt.arn)
    }
}



resource "aws_ecs_task_definition" "spring_task_def" {
    family = "tpv-spring-task"
    execution_role_arn = aws_iam_role.ecs_task_excecution_role.arn
    network_mode = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu = "256"
    memory = "512"
    container_definitions = data.template_file.task_def_template_spring.rendered
}


resource "aws_ecs_task_definition" "flask_task_def" {
    family = "tpv-flask-task"
    execution_role_arn = aws_iam_role.ecs_task_excecution_role.arn
    network_mode = "awsvpc"
    requires_compatibilities = ["FARGATE"]
    cpu = "256"
    memory = "512"
    container_definitions = data.template_file.task_def_template_flask.rendered
}






resource "aws_ecs_service" "spring_ecs_service" {
    name = "tpv-spring-service"
    cluster = aws_ecs_cluster.ecs_cluster.id
    task_definition = aws_ecs_task_definition.spring_task_def.arn 
    desired_count = 2
    launch_type = "FARGATE"

    network_configuration {
        security_groups = [aws_security_group.ecs_security_spring.id]
        subnets = aws_subnet.public.*.id
        assign_public_ip = true
    }

    load_balancer {
        target_group_arn = aws_alb_target_group.spring_target_group.id
        container_name = "tpv-spring"
        container_port = var.spring_port
    }

    depends_on = [
        aws_alb_listener.alb_listener,
        aws_iam_role_policy_attachment.ecs_task_execution_policy,
        aws_iam_role_policy.ecs_jwt_secret,
        aws_vpc_endpoint.secretsmanager,
        aws_route.public_rt,
    ]
}





resource "aws_ecs_service" "flask_ecs_service" {
    name = "tpv-flask-service"
    cluster = aws_ecs_cluster.ecs_cluster.id
    task_definition = aws_ecs_task_definition.flask_task_def.arn 
    desired_count = 2
    launch_type = "FARGATE"

    network_configuration {
        security_groups = [aws_security_group.ecs_security_flask.id]
        subnets = aws_subnet.public.*.id
        assign_public_ip = true
    }

    load_balancer {
        #Will need new target group here
        target_group_arn = aws_alb_target_group.flask_target_group.id
        container_name = "tpv-flask"
        container_port = var.flask_port
    }

    depends_on = [
        aws_alb_listener.alb_listener,
        aws_iam_role_policy_attachment.ecs_task_execution_policy,
        aws_iam_role_policy.ecs_jwt_secret,
        aws_vpc_endpoint.secretsmanager,
        aws_route.public_rt,
        aws_alb_listener_rule.flask_routing
    ]
}







# Need to add new flask service here

# Then need to configure alb to go to both

#Then need to configure cloudfront to deal with multiple

