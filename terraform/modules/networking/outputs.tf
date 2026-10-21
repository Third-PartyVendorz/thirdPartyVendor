output "aws_vpc" {
  value = aws_vpc.aws_vpc.id
}

output "public_subnets" {
  value = [aws_subnet.public_subnets[0].id, aws_subnet.public_subnets[1].id]
}

output "private_subnets" {
  value = [aws_subnet.private_subnets[0].id, aws_subnet.private_subnets[1].id]
}