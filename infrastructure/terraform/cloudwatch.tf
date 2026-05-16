# SNS Topic for alerts
resource "aws_sns_topic" "on_call_alerts" {
  name = "trace-missing-on-call-alerts-${var.env}"
}

# CloudWatch Alarm for DLQs
resource "aws_cloudwatch_metric_alarm" "dlq_alert" {
  for_each = {
    outbox     = aws_sqs_queue.outbox_relay_dlq.name
    inbox      = aws_sqs_queue.inbox_events_dlq.name
    matching   = aws_sqs_queue.matching_jobs_dlq.name
  }

  alarm_name          = "dlq-${each.key}-messages-visible-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 900  # 15 minutes
  statistic           = "Sum"
  threshold           = 0

  dimensions = {
    QueueName = each.value
  }
  
  alarm_actions = [aws_sns_topic.on_call_alerts.arn]
}

# Lambda Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "lambda-errors-high-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5

  alarm_actions = [aws_sns_topic.on_call_alerts.arn]
}
