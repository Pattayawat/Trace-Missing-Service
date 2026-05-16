# Outbox Relay Queue
resource "aws_sqs_queue" "outbox_relay" {
  name                       = "trace-missing-outbox-relay-${var.env}"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.outbox_relay_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "outbox_relay_dlq" {
  name                      = "trace-missing-outbox-relay-dlq-${var.env}"
  message_retention_seconds = 1209600
}

# Inbox Events Queue
resource "aws_sqs_queue" "inbox_events" {
  name                       = "trace-missing-inbox-events-${var.env}"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.inbox_events_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "inbox_events_dlq" {
  name                      = "trace-missing-inbox-events-dlq-${var.env}"
  message_retention_seconds = 1209600
}

# Matching Jobs Queue
resource "aws_sqs_queue" "matching_jobs" {
  name                       = "trace-missing-matching-jobs-${var.env}"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.matching_jobs_dlq.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "matching_jobs_dlq" {
  name                      = "trace-missing-matching-jobs-dlq-${var.env}"
  message_retention_seconds = 1209600
}

# Face Recognition Queue
resource "aws_sqs_queue" "face_recognition" {
  name                       = "trace-missing-face-recognition-${var.env}"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.face_recognition_dlq.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "face_recognition_dlq" {
  name                      = "trace-missing-face-recognition-dlq-${var.env}"
  message_retention_seconds = 1209600
}

# Integration Retry Queue
resource "aws_sqs_queue" "integration_retry" {
  name                        = "trace-missing-integration-retry-${var.env}.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 60
  message_retention_seconds   = 345600
  receive_wait_time_seconds   = 20
}

resource "aws_sqs_queue" "integration_retry_dlq" {
  name                      = "trace-missing-integration-retry-dlq-${var.env}.fifo"
  fifo_queue                = true
  message_retention_seconds = 1209600
}

# Shelter Sync Queue
resource "aws_sqs_queue" "shelter_sync" {
  name                       = "trace-missing-shelter-sync-${var.env}"
  visibility_timeout_seconds = 120
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20
}
