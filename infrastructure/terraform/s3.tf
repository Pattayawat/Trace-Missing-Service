resource "aws_s3_bucket" "photos" {
  bucket = "trace-missing-photos-${var.env}"
}

resource "aws_s3_bucket_lifecycle_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id
  
  rule {
    id     = "move-to-ia"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "photos_cors" {
  bucket = aws_s3_bucket.photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["https://trace-missing.app"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

# Notification to SQS for Face Recognition Worker
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.photos.id

  queue {
    queue_arn     = aws_sqs_queue.face_recognition.arn
    events        = ["s3:ObjectCreated:Put"]
  }
}
