output "arn_tg" {
  value = (var.create_target_group == true
  ? (length(aws_alb_target_group.target_group) > 0 ? aws_alb_target_group.target_group[0].arn : "") : "")
}