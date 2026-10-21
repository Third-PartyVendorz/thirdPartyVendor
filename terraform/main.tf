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

module "ecs_cluster" {
  source = "./modules/ecs/cluster"
  name   = "tpv-ecs-cluster"
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



