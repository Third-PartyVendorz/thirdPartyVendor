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
resource "aws_subnet" "private_subnets_server" {
  count             = 2
  availability_zone = data.aws_availability_zones.az_availables.names[count.index]
  vpc_id            = aws_vpc.aws_vpc.id
  cidr_block        = cidrsubnet(aws_vpc.aws_vpc.cidr_block, 8, count.index + 3)
  tags = {
    Name = "private_subnet_server_${count.index}_${var.name}"
  }
}
# ------------------------------


