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

#data "aws_caller_identity" "current" {}

#output "aws_account_id" {
#	value = data.aws_caller_identity.current.account_id
#}

#output "aws_caller_arn" {
#	value = data.aws_caller_identity.current.arn
#}

#resource "aws_iam_policy" "link_test" {
#	name        = "third-party-vendor-link-test"
#	description = "Minimal policy for validating AWS Terraform linkage"

#	policy = jsonencode({
#		Version = "2012-10-17"
#		Statement = [{
#			Effect   = "Allow"
#			Action   = "sts:GetCallerIdentity"
#			Resource = "*"
#		}]
#	})
#}

#module "networking" {
#  source = "./modules/networking"
#  cidr   = ["10.0.0.0/16"]
#  name   = "TPV"
#}
