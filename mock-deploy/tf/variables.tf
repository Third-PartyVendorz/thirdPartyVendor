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



# ----- Database Variables -----

variable "primary_db_port" {default = 5432}

variable "replica_db_port" {default = 5433}

variable "database_username" {default = "test1234567"}
variable "database_password" {default = "test1234567"}