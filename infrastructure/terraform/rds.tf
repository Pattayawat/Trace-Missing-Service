resource "aws_rds_cluster" "postgres" {
  cluster_identifier          = "trace-missing-cluster-${var.env}"
  engine                      = "aurora-postgresql"
  engine_version              = "15.4"
  database_name               = "trace_missing"
  master_username             = var.db_username
  manage_master_user_password = true
  
  availability_zones          = ["${var.aws_region}a", "${var.aws_region}b"]
  
  backup_retention_period     = 7
  deletion_protection         = true
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

resource "aws_rds_cluster_instance" "writer" {
  identifier         = "trace-missing-writer-${var.env}"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.postgres.engine
  engine_version     = aws_rds_cluster.postgres.engine_version
}

resource "aws_rds_cluster_instance" "reader" {
  count              = 2
  identifier         = "trace-missing-reader-${count.index}-${var.env}"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.postgres.engine
  engine_version     = aws_rds_cluster.postgres.engine_version
}

resource "aws_db_proxy" "main" {
  name                   = "trace-missing-proxy-${var.env}"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.rds_proxy_role.arn
  vpc_subnet_ids         = var.private_subnet_ids
  
  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_rds_cluster.postgres.master_user_secret[0].secret_arn
    iam_auth    = "REQUIRED"
  }
}
