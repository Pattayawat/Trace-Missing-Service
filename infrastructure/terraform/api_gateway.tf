resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.env}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

# Routes for Report Handler
resource "aws_apigatewayv2_integration" "report_handler" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.report_handler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "report_routes" {
  for_each = toset(["POST /reports", "GET /reports", "GET /reports/{id}", "PATCH /reports/{id}", "GET /incidents"])
  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.report_handler.id}"
}

# Routes for Match Handler
resource "aws_apigatewayv2_integration" "match_handler" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.match_handler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "match_routes" {
  for_each = toset(["POST /matches/trigger", "GET /matches/{id}"])
  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.match_handler.id}"
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "api_report" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.report_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_match" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.match_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.main.api_endpoint
}
