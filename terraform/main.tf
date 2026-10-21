terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = "~> 6.0"
		}
	}
}

provider "aws" {
	region = "eu-west-2"
	access_key = var.aws_access_key
	secret_key = var.aws_secret_key
}

data "aws_region" "current" {}

module "networking" {
	source = "./modules/networking"
	cidr   = ["10.0.0.0/16"]
	name   = "TPV"
}

module "spring-ecr" {
	source = "./modules/ecr"
	name   = "spring-ecr-repo"
}

module "flask-ecr" {
	source = "./modules/ecr"
	name   = "flask-ecr-repo"
}

module "target_group_server" {
  source              = "./modules/alb"
  create_target_group = true
  name                = "tpv-alb-target-group"
  port                = 8080
  protocol            = "HTTP"
  vpc                 = module.networking.aws_vpc
  tg_type             = "ip"
# health_check_path   = "/status"
# health_check_port   = 80
}

module "security_group_alb_server" {
  source              = "./modules/security-group"
  name                = "alb-tpv-server"
  description         = "Controls access to the server ALB"
  vpc_id              = module.networking.aws_vpc
  cidr_blocks_ingress = ["0.0.0.0/0"]
  ingress_port        = 80
}

module "alb_server" {
  source         = "./modules/alb"
  create_alb     = true
  name           = "tpv-ser"
  subnets        = [module.networking.public_subnets[0], module.networking.public_subnets[1]]
  security_group = module.security_group_alb_server.sg_id
  target_group   = module.target_group_server.arn_tg
}

module "ecs_cluster" {
  source = "./modules/ecs/cluster"
  name   = "tpv-ecs-cluster"
}

#Create the execution role
#Attach the execution role to the task definition
#Create security group for ecs Service
#Create ecs service and attach everything
#Also need to attach the load balancer

module "ecs_task_execution_role" {
  source           = "./modules/iam"
  name             = "tpv-ecs-task-execution-role"
  create_ecs_role  = true
}

#Need 2 task definitions for final product but will just use 1 for now to prove all works
#Will just start with spring API


module "ecs_task_definition_spring" {
  source             = "./modules/ecs/task-definition"
  name               = "tpv-td-server"
  container_name     = var.container_name["server"]
  execution_role_arn = module.ecs_role.arn_role
  task_role_arn      = module.ecs_role.arn_role_ecs_task_role
  cpu                = "256"
  memory             = "512"
  docker_repo        = module.ecr_server.ecr_repository_url
  region             = var.aws_region
  container_port     = var.port_app_server
}