[
    {
      "name": "tpv",
      "image": "${app_image}",
      "cpu" : ${fargate_cpu},
      "memory" : ${fargate_memory},
      "networkMode": "awsvpc",
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
      ]
    }
]