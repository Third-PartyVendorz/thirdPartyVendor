[
    {
      "name": "tpv",
      "image": "${app_image}",
      "cpu" : ${fargate_cpu},
      "memory" : ${fargate_memory},
      "networkMode": "awsvpc",
      "environment": [
        { "name": "DB_HOST", "value": ${db_host_json} },
        { "name": "DB_PORT", "value": ${db_port_json} },
        { "name": "DB_NAME", "value": ${db_name_json} },
        { "name": "DB_USER", "value": ${db_user_json} },
        { "name": "DB_PASSWORD", "value": ${db_password_json} },
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
        }
      ]
    }
]