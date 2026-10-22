resource "aws_ecr_repository" "spring_repository"{
    name                 = "spring-ecr-repository"
    image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "flask_repository"{
    name                 = "flask-ecr-repository"
    image_tag_mutability = "MUTABLE"
}