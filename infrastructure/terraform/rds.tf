resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.env}"
  subnet_ids = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.env}"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg-${var.env}"
  description = "Allow inbound traffic for PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # In a demo, we can allow access from Lambda (anywhere if Lambda is outside VPC) 
  # or restrict to VPC CIDR if Lambda is inside.
  # To avoid NAT Gateway, we keep RDS public and restrict to specific IPs if possible,
  # but for a generic demo, we allow 0.0.0.0/0 for convenience OR restricted SG.
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restricted for security, but okay for demo public RDS
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-db-${var.env}"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  db_name              = "trace_missing"
  username             = var.db_username
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible  = true
  skip_final_snapshot  = true

  tags = {
    Name = "${var.project_name}-db-${var.env}"
  }
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
