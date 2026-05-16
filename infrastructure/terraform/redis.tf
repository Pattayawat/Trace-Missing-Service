resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "trace-missing-redis-${var.env}"
  description          = "Redis for trace-missing-service"
  node_type            = "cache.r6g.large"
  
  num_cache_clusters   = 2
  automatic_failover_enabled = true
  multi_az_enabled     = true
  
  engine               = "redis"
  engine_version       = "7.0"
  port                 = 6379
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  subnet_group_name          = aws_elasticache_subnet_group.main.name
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "trace-missing-redis-subnet-${var.env}"
  subnet_ids = var.private_subnet_ids
}
