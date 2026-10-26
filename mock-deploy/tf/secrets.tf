# Manage the secret metadata only. Add a plain-text signing key in Secrets
# Manager before starting ECS tasks to keep the key out of Terraform state.
#resource "aws_secretsmanager_secret" "jwt" {
#  name_prefix             = "tpv-jwt-signing-key-"
#  description             = "JWT signing key for the TPV Spring API"
#  recovery_window_in_days = 30
#}





data "aws_secretsmanager_secret" "jwt" {
  name = "tpv/jwt-secret" # Name of your existing secret
}

data "aws_secretsmanager_secret" "fauxnance_key" {
  name = "tpv/fauxnance-api-key" # Name of your existing secret
}