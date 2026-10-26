resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true
    
tags = {
    Name = "tpv_vpc"
  }
}

# ----- Get region and available azs in region -----
data "aws_availability_zones" "az_availables" {
  state = "available"
}
# ----------

resource "aws_subnet" "private" {
    count             = 2
    vpc_id            = aws_vpc.vpc.id
    availability_zone = data.aws_availability_zones.az_availables.names[count.index]
    cidr_block        = cidrsubnet(aws_vpc.vpc.cidr_block, 8, count.index + 1)
}

resource "aws_subnet" "public" {
    count                   = 2
    vpc_id                  = aws_vpc.vpc.id
    availability_zone       = data.aws_availability_zones.az_availables.names[count.index]
    cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 8, count.index + 3)
    map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
}

#Enable public routing for internet access --> uses default route table
resource "aws_route" "public_rt" {
    route_table_id         = aws_vpc.vpc.main_route_table_id
    destination_cidr_block = "0.0.0.0/0"
    gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table" "private_rt" {
    vpc_id = aws_vpc.vpc.id
}

resource "aws_route_table_association" "rt_assoc_priv_subnets" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private_rt.id
}

#Private links for our private subnets

resource "aws_security_group" "endpoint" {
  name        = "private-link-security-group"
  description = "Allow private workloads to access VPC interface endpoints"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "HTTPS from private and public workloads"
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = concat(
      [for subnet in aws_subnet.private : subnet.cidr_block],
      [for subnet in aws_subnet.public : subnet.cidr_block],
    )
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.logs"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}


resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}



resource "aws_vpc_endpoint" "gateway_endpoints" {
  vpc_id              = aws_vpc.vpc.id
  vpc_endpoint_type   = "Gateway"
  service_name        = "com.amazonaws.${var.region}.s3"

  route_table_ids = [
    aws_route_table.private_rt.id
  ]
}