resource "aws_cloudwatch_event_bus" "main" {
  name = "trace-missing-event-bus-${var.env}"
}

# Rule: Receive events from Shelter Service
resource "aws_cloudwatch_event_rule" "shelter_events" {
  event_bus_name = aws_cloudwatch_event_bus.main.name
  name           = "shelter-resident-events-${var.env}"
  
  event_pattern = jsonencode({
    source      = ["shelter-service"]
    detail-type = [
      "shelter.resident.created", 
      "shelter.resident.updated",
      "shelter.resident.released", 
      "shelter.resident.transferred"
    ]
  })
}

resource "aws_cloudwatch_event_target" "shelter_to_sqs" {
  rule           = aws_cloudwatch_event_rule.shelter_events.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "shelter-to-inbox-queue"
  arn            = aws_sqs_queue.inbox_events.arn
}

# Rule: Send events from Missing Service out
resource "aws_cloudwatch_event_rule" "missing_events_out" {
  event_bus_name = aws_cloudwatch_event_bus.main.name
  name           = "missing-service-events-${var.env}"
  
  event_pattern = jsonencode({
    source = ["trace-missing-service"]
  })
}

# Outbox Relay trigger using EventBridge Scheduler
resource "aws_scheduler_schedule" "outbox_relay" {
  name = "outbox-relay-schedule-${var.env}"
  flexible_time_window { 
    mode = "OFF" 
  }
  schedule_expression = "rate(1 minutes)"
  
  target {
    arn      = aws_lambda_function.outbox_relay_worker.arn
    role_arn = aws_iam_role.scheduler_role.arn
  }
}
