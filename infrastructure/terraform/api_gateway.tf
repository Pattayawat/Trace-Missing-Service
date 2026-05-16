resource "aws_apigatewayv2_api" "main" {
  name          = "trace-missing-api-${var.env}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://trace-missing.app", "http://localhost:3000"]
    allow_methods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Correlation-ID"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  name             = "jwt-authorizer"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.user_pool_id}"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/vendedlogs/apigateway/trace-missing-${var.env}"
  retention_in_days = 30
}

# Rate limiting Usage Plan (Note: API Gateway v2 requires specific configurations for rate limiting, 
# typically via WAF or Custom Authorizers. Standard usage plans are primarily for API Gateway v1 (REST APIs).
# For HTTP APIs (v2), we might use a WAF Web ACL or handle it in the application layer or Route53.)
