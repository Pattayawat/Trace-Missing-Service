provider "aws" {
  region = "us-east-1" 
}

# ==========================================
# 1. Fetch Existing LabRole for Learner Lab
# ==========================================
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ==========================================
# 2. Lambda Function
# ==========================================
resource "aws_lambda_function" "api_lambda" {
  function_name = "trace-missing-api"
  

  filename         = "../api_deployment.zip" 
  source_code_hash = filebase64sha256("../api_deployment.zip")

  handler = "bootstrap"    
  runtime = "provided.al2"  
  # Attach the LabRole ARN here
  role    = data.aws_iam_role.lab_role.arn

  memory_size = 256
  timeout     = 10
}

# ==========================================
# 3. API Gateway (HTTP API v2)
# ==========================================
resource "aws_apigatewayv2_api" "http_api" {
  name          = "trace-missing-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api_lambda.invoke_arn
  integration_method = "POST" 
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# ==========================================
# 4. Allow API Gateway to Invoke Lambda
# ==========================================
resource "aws_lambda_permission" "api_gw_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# ==========================================
# 5. Output API Gateway Endpoint
# ==========================================
output "api_gateway_url" {
  value       = aws_apigatewayv2_api.http_api.api_endpoint
  description = "The endpoint URL to invoke your API"
}

# ==========================================
# 6. ดึงข้อมูล Default VPC ของบัญชี AWS
# ==========================================
data "aws_vpc" "default" {
  default = true
}

# ==========================================
# 7. สร้าง Security Group สำหรับ RDS (อนุญาต Port 5432)
# ==========================================
resource "aws_security_group" "rds_sg" {
  name        = "trace_missing_rds_sg"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Allow PostgreSQL from anywhere"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 8. สร้าง RDS PostgreSQL Database
# ==========================================
resource "aws_db_instance" "postgres_db" {
  identifier             = "trace-missing-db"
  engine                 = "postgres"
  engine_version         = "16"             
  instance_class         = "db.t3.micro"     
  allocated_storage      = 20                 
  storage_type           = "gp2"
  
  db_name                = "missing_person_db" 
  username               = "postgres"        
  password               = "MySecretPass123"
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = true              
  skip_final_snapshot    = true              
}

# ==========================================
# 9. Output แสดง URL ของ Database เมื่อสร้างเสร็จ
# ==========================================
output "rds_endpoint" {
  value       = aws_db_instance.postgres_db.endpoint
  description = "Endpoint for main.go"
}