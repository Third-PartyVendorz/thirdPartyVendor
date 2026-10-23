resource "aws_db_parameter_group" "pg_logical" {
    name = "tpv-postgres17-replication"
    family = "postgres17"
    description = "RDS parameter group to enable logical replication"

    parameter {
        name = "rds.logical_replication"
        value = "1"
        # Logical replication is a static parameter and requires a reboot to change.
        apply_method = "pending-reboot"
    }
}

resource "aws_db_subnet_group" "db_subnets" {
    name = "rds-private-subnet-group"
    subnet_ids = aws_subnet.private.*.id
}

resource "aws_db_instance" "rds_primary" {
    identifier                      = "pg-primary"
    engine                          = "postgres"
    engine_version                  = "17"
    instance_class                  = "db.t3.micro"
    allocated_storage               = 20
    storage_type                    = "gp3"
    db_name                         = "tpv_primary"
    username                        = var.database_username
    password                        = var.database_password
    port                            = var.primary_db_port
    db_subnet_group_name            = aws_db_subnet_group.db_subnets.name
    vpc_security_group_ids          = [aws_security_group.rds_security.id]
    parameter_group_name            = aws_db_parameter_group.pg_logical.name
    # Automated backups must be enabled before creating a read replica.
    backup_retention_period         = 1
    publicly_accessible             = false
    multi_az                        = false
    skip_final_snapshot             = true
    deletion_protection             = false
}

resource "aws_db_instance" "rds_replica" {
    identifier                      = "pg-replica"
    replicate_source_db             = aws_db_instance.rds_primary.identifier
    instance_class                  = "db.t3.micro"
    storage_type                    = "gp3"
    port                            = var.replica_db_port
    # A same-Region read replica inherits the source DB subnet group.
    vpc_security_group_ids          = [aws_security_group.rds_security.id]
    parameter_group_name            = aws_db_parameter_group.pg_logical.name
    publicly_accessible             = false
    multi_az                        = false
    skip_final_snapshot             = true
    deletion_protection             = false
}

