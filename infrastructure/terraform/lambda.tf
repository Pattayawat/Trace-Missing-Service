data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../backend"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["DEPLOY.md", "schema.sql"]
}

locals {
  common_env_vars = {
    DB_HOST                 = element(split(":", aws_db_instance.postgres.endpoint), 0)
    DB_PORT                 = "5432"
    DB_USER                 = var.db_username
    DB_PASSWORD             = var.db_password
    DB_NAME                 = aws_db_instance.postgres.db_name
    S3_BUCKET               = aws_s3_bucket.photos.id
    MATCHING_JOBS_QUEUE_URL = aws_sqs_queue.matching_jobs.url
    NOTIFICATION_QUEUE_URL  = aws_sqs_queue.notification.url
  }
}

resource "aws_lambda_function" "report_handler" {
  function_name = "${var.project_name}-report-handler-${var.env}"
  role          = data.aws_iam_role.lab_role.arn
  handler       = "handlers/report-handler.handler"
  runtime       = "nodejs20.x"
  memory_size   = 256
  timeout       = 30
  
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = local.common_env_vars
  }
}

resource "aws_lambda_function" "match_handler" {
  function_name = "${var.project_name}-match-handler-${var.env}"
  role          = data.aws_iam_role.lab_role.arn
  handler       = "handlers/match-handler.handler"
  runtime       = "nodejs20.x"
  memory_size   = 256
  timeout       = 30
  
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = local.common_env_vars
  }
}

resource "aws_lambda_function" "worker_handler" {
  function_name = "${var.project_name}-worker-handler-${var.env}"
  role          = data.aws_iam_role.lab_role.arn
  handler       = "handlers/worker-handler.handler"
  runtime       = "nodejs20.x"
  memory_size   = 256
  timeout       = 300
  
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = local.common_env_vars
  }
}

resource "aws_lambda_event_source_mapping" "worker_sqs" {
  event_source_arn = aws_sqs_queue.matching_jobs.arn
  function_name    = aws_lambda_function.worker_handler.arn
  batch_size       = 5
}
