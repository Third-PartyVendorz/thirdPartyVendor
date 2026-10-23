resource "aws_rds_cluster_parameter_group" "pg_logical" {
    name = "tpv-postgres17-replication"
    family = "aurora-postgresql17"
    description = "RDS parameter group to enable logical replication"

    parameter {
        name = "rds.logical_replication"

        # This is wehere we actually specify logical I believe
        value = "1"

        # Means that the dbs will need to reboot for these parameters to apply --> Look into makeing this immediate?
        apply_method = "pending-reboot"
    }
}

resource "aws_db_subnet_group" "db_subnets" {
    name = "rds-private-subnet-group"
    subnet_ids = aws_subnet.private.*.id
}

resource "aws_rds_cluster" "rds_primary" {
    cluster_identifier              = "pg-primary"
    engine                          = "aurora-postgresql"
    engine_version                  = "17"
    database_name                   = "tpv-primary"
    master_username                 = var.database_username
    master_password                 = var.database_password
    db_subnet_group_name            = aws_db_subnet_group.db_subnets.name
    vpc_security_group_ids          = [aws_security_group.rds_security.id]
    db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.pg_logical.name
    skip_final_snapshot             = true
    deletion_protection             = false
}

resource "aws_rds_cluster_instance" "primary_writer" {
    identifier = "pg-primary-writer"
    cluster_identifier = aws_rds_cluster.rds_primary.id
    instance_class = "db.r6g.large"
    engine        = aws_rds_cluster.rds_primary.engine
    engine_version   =  aws_rds_cluster.rds_primary.engine_version
}


resource "aws_rds_cluster" "rds_replica" {
    cluster_identifier              = "pg-replica"
    replication_source_identifier   = aws_rds_cluster.rds_primary.arn
    engine                          = "aurora-postgresql"
    engine_version                  = "17"
    db_subnet_group_name            = aws_db_subnet_group.db_subnets.name
    vpc_security_group_ids          = [aws_security_group.rds_security.id]
    db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.pg_logical.name
    skip_final_snapshot             = true
    deletion_protection             = false

    depends_on                      = [aws_rds_cluster_instance.primary_writer]
}

resource "aws_rds_cluster_instance" "replica_reader" {
    identifier = "pg-replica-reader"
    cluster_identifier = aws_rds_cluster.rds_replica.id
    instance_class = "db.r6g.large"
    engine        = aws_rds_cluster.rds_primary.engine
    engine_version   =  aws_rds_cluster.rds_primary.engine_version
}

