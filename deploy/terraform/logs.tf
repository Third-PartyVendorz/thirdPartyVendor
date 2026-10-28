resource "aws_cloudwatch_log_group" "tpv_spring_logs" {
    name = "ecs/tpv/spring"
    retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "tpv_flask_logs" {
    name = "ecs/tpv/flask"
    retention_in_days = 30
}

resource "aws_cloudwatch_log_stream" "tpv_spring_log_stream" {
    name = "tpv-log-stream-spring"
    log_group_name = aws_cloudwatch_log_group.tpv_spring_logs.name
}

resource "aws_cloudwatch_log_stream" "tpv_flask_log_stream" {
    name = "tpv-log-stream-flask"
    log_group_name = aws_cloudwatch_log_group.tpv_flask_logs.name
}