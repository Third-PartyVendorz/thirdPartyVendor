resource "aws_lambda_function" "rds_connector" {
	function_name    = "tpv-rds-connector"
	role             = aws_iam_role.lambda_role.arn
	runtime          = "python3.12"
	handler          = "testing.lambda_handler"
	architectures    = ["x86_64"]
	timeout          = 30
	memory_size      = 128

	# Build this deployment package before running Terraform plan/apply.
	filename         = "${path.module}/../testing/lambda.zip"
	source_code_hash = filebase64sha256("${path.module}/../testing/lambda.zip")

	vpc_config {
		subnet_ids         = aws_subnet.private[*].id
		security_group_ids = [aws_security_group.lambda_security.id]
	}

	environment {
		variables = {
			DB_HOST     = aws_db_instance.rds_primary.address
			DB_PORT     = tostring(aws_db_instance.rds_primary.port)
			DB_NAME     = aws_db_instance.rds_primary.db_name
			DB_USER     = var.database_username
			DB_PASSWORD = var.database_password
		}
	}

	depends_on = [aws_iam_role_policy_attachment.lambda_vpc_access]
}