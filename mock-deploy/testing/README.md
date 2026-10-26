# RDS connectivity Lambda

From this directory, run `bash build-lambda.sh` before Terraform plan/apply.
The build requires Python 3 with pip, curl, and internet access. It produces
[lambda.zip](lambda.zip) containing the handler, Python 3.12/x86_64 Linux
PostgreSQL driver, and the AWS RDS CA bundle at the archive root.
Rebuild after changing the handler or dependencies; Terraform detects the ZIP hash.

The Lambda handler is `testing.lambda_handler`. Invoke it with an empty JSON
event (`{}`) to initialize the database from `schema.sql`, then run
`SELECT version();`. The schema script is packaged with the Lambda and is
intended for an empty database; subsequent invocations fail because its objects
already exist. Successful invocations return a `statusCode` of 200 and the
PostgreSQL version. Connection/query failures fail the invocation rather than
reporting success.

Terraform provides `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`
and attaches the existing Lambda security group in the private subnets.
The RDS security group already permits this group's traffic on the database
port. No public RDS access or NAT gateway is needed for the database connection;
the CA certificate is bundled, not downloaded at invocation time.

The attached VPC execution policy permits network interface management and
CloudWatch logging. Password-based PostgreSQL authentication does not require
an IAM RDS access policy.

Credentials are supplied through Lambda environment variables and are also
present in Terraform state. Restrict access to both; use Secrets Manager for
production credential management. This build does not deploy or invoke AWS
resources.