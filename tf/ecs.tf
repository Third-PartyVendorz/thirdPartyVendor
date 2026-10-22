resource "aws_ecs_cluster" "ecs_cluster" {
  name = "tpv-ecs-cluster"
}

data "template_file" "task_def_template" {
    
}