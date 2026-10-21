variable "name" {
  description = "The name for the Role"
  type        = string
}

variable "create_ecs_role" {
  description = "Set this variable to true if you want to create a role for ECS"
  type        = bool
  default     = false
}