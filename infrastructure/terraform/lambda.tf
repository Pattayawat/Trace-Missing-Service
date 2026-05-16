# Note: In a real environment, we'd use a CI/CD pipeline to package and deploy code.
# Here we just define the Lambda function resources using dummy zip files.

locals {
  common_env_vars = {
    DB_PROXY_ENDPOINT      = aws_db_proxy.main.endpoint
    REDIS_ENDPOINT         = aws_elasticache_replication_group.main.primary_endpoint_address
    S3_BUCKET              = aws_s3_bucket.photos.id
    EVENT_BUS_NAME         = aws_cloudwatch_event_bus.main.name
    FACE_RECOGNITION_QUEUE = aws_sqs_queue.face_recognition.url
    OUTBOX_RELAY_QUEUE     = aws_sqs_queue.outbox_relay.url
    MATCHING_JOBS_QUEUE    = aws_sqs_queue.matching_jobs.url
  }
}

# Example API Handler Lambda
resource "aws_lambda_function" "report_handler" {
  function_name    = "trace-missing-report-handler-${var.env}"
  role             = aws_iam_role.api_handler.arn
  handler          = "src/handlers/report-handler.handler"
  runtime          = "nodejs20.x"
  memory_size      = 512
  timeout          = 30
  
  # dummy zip or source code path
  filename         = "dummy.zip"

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = local.common_env_vars
  }
}

# Worker Lambda Example
resource "aws_lambda_function" "outbox_relay_worker" {
  function_name    = "trace-missing-outbox-relay-worker-${var.env}"
  role             = aws_iam_role.worker.arn
  handler          = "src/workers/outbox-relay-worker.handler"
  runtime          = "nodejs20.x"
  memory_size      = 256
  timeout          = 60
  
  filename         = "dummy.zip"

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = local.common_env_vars
  }
}

# Event Source Mapping for Outbox SQS
# (Assuming Outbox Worker processes SQS items, or EventBridge triggers it)
resource "aws_lambda_event_source_mapping" "outbox_sqs" {
  event_source_arn = aws_sqs_queue.outbox_relay.arn
  function_name    = aws_lambda_function.outbox_relay_worker.arn
  batch_size       = 10
}
