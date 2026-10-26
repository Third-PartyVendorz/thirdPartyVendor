[
    {
      "name": "tpv",
      "image": "${app_image}",
      "cpu" : ${fargate_cpu},
      "memory" : ${fargate_memory},
      "networkMode": "awsvpc",
      "environment": [
        { "name": "SPRING_DATASOURCE_URL", "value": ${datasource_url_json} },
        { "name": "SPRING_DATASOURCE_USERNAME", "value": ${db_user_json} },
        { "name": "SPRING_DATASOURCE_PASSWORD", "value": ${db_password_json} },
        { "name": "SPRING_FLYWAY_ENABLED", "value": "false" },
        { "name": "SERVER_PORT", "value": "${app_port}" },
        { "name": "FAUXNANCE_API_URL", "value": ${fauxnance_api_url_json} },
        { "name": "APP_JWT_EXPIRATION_MS", "value": "86400000" },
        { "name": "APP_REFRESH_EXPIRATION_MS", "value": "86400000" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${log_group_name}",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "portMappings": [
        {
          "hostPort": ${app_port},
          "containerPort": ${app_port}
        }
      ],
      "secrets": [
        {
          "name": "APP_JWT_SECRET",
          "valueFrom": ${jwt_secret_arn_json}
        },
        {
          "name": "FAUXNANCE_API_KEY",
          "valueFrom": ${fauxnance_api_key_secret_arn_json}
        }
      ]
    }
]