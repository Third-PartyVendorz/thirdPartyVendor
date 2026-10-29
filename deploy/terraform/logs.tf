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




resource "aws_cloudwatch_log_group" "cloudfront_logs" {
    name = "tpv/cloudfront"
    retention_in_days = 30 
}


resource "aws_cloudwatch_log_delivery_source" "cloudfront_source" {
    name         = "cloudfront-access-logs-source"
    log_type     = "ACCESS_LOGS"
    resource_arn = aws_cloudfront_distribution.api.arn
}


resource "aws_cloudwatch_log_delivery_destination" "cloudfront_destination" {
    name          = "cloudfront-access-logs-destination"
    output_format = "json"

    delivery_destination_configuration {
        destination_resource_arn = aws_cloudwatch_log_group.cloudfront_logs.arn
    }
}

resource "aws_cloudwatch_log_delivery" "cloudfront_delivery" {
    delivery_source_name     = aws_cloudwatch_log_delivery_source.cloudfront_source.name
    delivery_destination_arn = aws_cloudwatch_log_delivery_destination.cloudfront_destination.arn

    # CloudFront standard logging (v2) fields, excluding raw session cookies.
    # URLs, referrers, IPs, and custom function log data can still be sensitive.
    record_fields = [
        # Request timing and correlation.
        "date",
        "time",
        "timestamp(ms)",
        "x-edge-request-id",
        "x-edge-location",
        "distribution-tenant-id",
        "connection-id",

        # Viewer, request, and matched cache behavior.
        "c-ip",
        "c-port",
        "x-forwarded-for",
        "c-country",
        "asn",
        "cs-method",
        "cs(Host)",
        "x-host-header",
        "cs-uri-stem",
        "cs-uri-query",
        "cs(Referer)",
        "cs(User-Agent)",
        "cs-protocol",
        "cs-protocol-version",
        "cs-bytes",
        "cache-behavior-path-pattern",

        # Response, cache classification, and detailed failure reasons.
        "sc-status",
        "sc-bytes",
        "sc-content-type",
        "sc-content-len",
        "sc-range-start",
        "sc-range-end",
        "x-edge-result-type",
        "x-edge-response-result-type",
        "x-edge-detailed-result-type",

        # End-to-end and origin latency (seconds).
        "time-taken",
        "time-to-first-byte",
        "origin-fbl",
        "origin-lbl",

        # TLS and field-level encryption diagnostics.
        "ssl-protocol",
        "ssl-cipher",
        "fle-status",
        "fle-encrypted-fields",

        # Populated when CloudFront Functions emit custom log data.
        "viewer-request-log-data",
        "viewer-response-log-data",
    ]
}