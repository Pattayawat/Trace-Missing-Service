resource "aws_sns_topic" "survivor_matched" {
  name = "event-missing-service-survivor-matched-${var.env}"
}

resource "aws_sns_topic_subscription" "survivor_matched_notification" {
  topic_arn = aws_sns_topic.survivor_matched.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.survivor_matched_queue.arn
  raw_message_delivery = true
}

resource "aws_sqs_queue_policy" "survivor_matched_queue_policy" {
  queue_url = aws_sqs_queue.survivor_matched_queue.id
  policy    = data.aws_iam_policy_document.sns_to_sqs.json
}

data "aws_iam_policy_document" "sns_to_sqs" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.survivor_matched_queue.arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.survivor_matched.arn]
    }
  }
}

output "survivor_matched_sns_topic_arn" {
  value = aws_sns_topic.survivor_matched.arn
}
