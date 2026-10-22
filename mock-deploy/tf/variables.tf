# ----- Provider Variables -----

variable "region" { default = "us-east-2" }

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

variable "spring_image" {
    description = "The tag of the Spring image already pushed to ECR"
    type        = string
    default     = "latest"
}
# ----------
