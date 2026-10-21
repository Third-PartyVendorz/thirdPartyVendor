# ------- VPC Creation -------
resource "aws_vpc" "aws_vpc" {
  cidr_block           = var.cidr[0]

  #This field declares the hardware tanancy --> other option is dedicated for dedicated hardware
  instance_tenancy     = "default"

  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "vpc_${var.name}"
  }
}

# ------- Get Region Available Zones -------
data "aws_availability_zones" "az_availables" {
  state = "available"
}




# ------- Public Subnets -------
resource "aws_subnet" "public_subnets" {
  count                   = 2
  availability_zone       = data.aws_availability_zones.az_availables.names[count.index]
  vpc_id                  = aws_vpc.aws_vpc.id
  cidr_block              = cidrsubnet(aws_vpc.aws_vpc.cidr_block, 8, count.index + 1)
  map_public_ip_on_launch = true
  tags = {
    Name = "public_subnet_${count.index}_${var.name}"
  }
}
# ------------------------------

# ------- Private Subnets -------
resource "aws_subnet" "private_subnets" {
  count             = 2
  availability_zone = data.aws_availability_zones.az_availables.names[count.index]
  vpc_id            = aws_vpc.aws_vpc.id
  cidr_block        = cidrsubnet(aws_vpc.aws_vpc.cidr_block, 8, count.index + 3)
  tags = {
    Name = "private_subnet_${count.index}_${var.name}"
  }
}
# ------------------------------


# ------- Internet Gateway -------
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.aws_vpc.id
  tags = {
    Name = "igw_${var.name}"
  }
}

# ------- Create Default Route Public Table -------
resource "aws_default_route_table" "rt_public" {
  default_route_table_id = aws_vpc.aws_vpc.default_route_table_id

  # ------- Internet Route -------
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public_rt_${var.name}"
  }
}

# ------- Create EIP -------
resource "aws_eip" "eip" {
  vpc = true
  tags = {
    Name = "eip-${var.name}"
  }
}

# ------- Attach EIP to Nat Gateway -------
resource "aws_nat_gateway" "natgw" {
  allocation_id = aws_eip.eip.id
  subnet_id     = aws_subnet.public_subnets[0].id
  depends_on    = [aws_internet_gateway.igw]
  tags = {
    Name = "nat_${var.name}"
  }
}

# ------- Create Private Route Private Table -------
resource "aws_route_table" "rt_private" {
  vpc_id = aws_vpc.aws_vpc.id

  # ------- Internet Route -------
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.natgw.id
  }

  tags = {
    Name = "private_rt_${var.name}"
  }
}

resource "aws_route_table_association" "rt_assoc_priv_subnets" {
  count          = 2
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.rt_private.id
}

# ------- Public Subnets Association -------
resource "aws_route_table_association" "rt_assoc_pub_subnets" {
  count          = 2
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_vpc.aws_vpc.main_route_table_id
}


# Private links
resource "aws_security_group" "endpoint" {
  name        = "${var.name}-vpc-endpoints"
  description = "Allow private workloads to access VPC interface endpoints"
  vpc_id      = aws_vpc.aws_vpc.id

  ingress {
    description = "HTTPS from private subnets"
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = [for subnet in aws_subnet.private_subnets : subnet.cidr_block]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sg_${var.name}_vpc_endpoints"
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.aws_vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
  subnet_ids          = aws_subnet.private_subnets[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.aws_vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
  subnet_ids          = aws_subnet.private_subnets[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  private_dns_enabled = true
}


#Gateway endpoint for S3 --> Type gateway

resource "aws_vpc_endpoint" "gateway_endpoints" {
  vpc_id              = aws_vpc.aws_vpc.id
  vpc_endpoint_type   = "Gateway"
  service_name        = "com.amazonaws.${data.aws_region.current.name}.s3"

  route_table_ids = [
    aws_route_table.rt_private.id
  ]

}



