resource "aws_sqs_queue" "matching_jobs" {
  name                       = "${var.project_name}-matching-jobs-${var.env}"
  visibility_timeout_seconds = 300
  receive_wait_time_seconds  = 20
}

resource "aws_sqs_queue" "notification" {
  name                       = "${var.project_name}-notification-${var.env}"
  visibility_timeout_seconds = 30
  receive_wait_time_seconds  = 20
}

resource "aws_sqs_queue" "patient_events" {
  name                       = "${var.project_name}-patient-events-${var.env}"
  visibility_timeout_seconds = 60
  receive_wait_time_seconds  = 20
}

output "matching_jobs_queue_url" {
  value = aws_sqs_queue.matching_jobs.url
}

output "notification_queue_url" {
  value = aws_sqs_queue.notification.url
}

output "patient_events_queue_url" {
  value = aws_sqs_queue.patient_events.url
}
