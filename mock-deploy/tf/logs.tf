resource "aws_cloudwatch_log_group" "tpv_spring_logs" {
    name = "ecs/tpv"
    retention_in_days = 30
}

resource "aws_cloudwatch_log_stream" "tpv_spring_log_stream" {
    name = "tpv-log-stream"
    log_group_name = aws_cloudwatch_log_group.tpv_spring_logs.name
}