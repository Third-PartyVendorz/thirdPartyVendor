# ----- Provider Variables -----

variable "region" { default = "us-east-2" }
variable "aws_access_key" { type = string }
variable "aws_secret_key" { type = string }

# ----------


# ----- Network Variables  -----

variable "vpc_cidr" {default = "10.0.0.0/16"}

# ----------

# ----- Load Balancer Variables -----
variable "health_check_path" {
    description = "Path to check health of our load balancer"
    default = "/"
}




# ----- Application Variables -----
variable "spring_port" {default = 8080}
# ----------
