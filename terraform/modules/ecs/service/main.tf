#cluster
#name
#task-definition 
#desired-count
#launch-type
#network-configuration
#load-balancers
#containerName
#containerPort



resource "aws_ecs_service" "ecs_service" {
  name                              = "Service-${var.name}"
  cluster                           = var.ecs_cluster_id
  task_definition                   = var.arn_task_definition
  desired_count                     = var.desired_tasks
  launch_type                       = "FARGATE"

  network_configuration {
    security_groups = [var.arn_security_group]
    subnets         = [var.subnets_id[0], var.subnets_id[1]]
  }

  load_balancer {
    target_group_arn = var.arn_target_group
    container_name   = var.container_name
    container_port   = var.container_port
  }

}