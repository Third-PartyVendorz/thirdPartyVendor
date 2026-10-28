# ----- Provider Variables -----

variable "region" { default = "us-east-1" }

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
variable "spring_port" {default = 8081}

variable "spring_image" {
    description = "The tag of the Spring image already pushed to ECR"
    type        = string
    default     = "latest"
}


variable "flask_port" {default = 8089}

variable "flask_image" {
    description = "The tag of the Flask image already pushed to ECR"
    type        = string
    default     = "latest"
}





variable "fauxnance_api_url" {
    description = "Base URL of the external Fauxnance API"
    type        = string
    default     = "https://y4t9nq2bqf.execute-api.eu-west-2.amazonaws.com/v1"
}

variable "frontend_origin" {
    description = "Exact browser origin allowed to call the Spring API, e.g. https://app.example.com"
    type        = string
    default     = "http://localhost:4200"
}












# ----------



# ----- Database Variables -----

variable "primary_db_port" {default = 5432}

variable "replica_db_port" {default = 5433}

variable "database_username" {default = "test1234567"}
variable "database_password" {default = "test1234567"}









# ----- AWS keys -----

variable "aws_access_key" {
  description = "AWS access key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
}