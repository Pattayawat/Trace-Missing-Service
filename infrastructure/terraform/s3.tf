resource "aws_s3_bucket" "photos" {
  bucket = "${var.project_name}-photos-${var.env}-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "photos" {
  bucket = aws_s3_bucket.photos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"] # Adjust for demo if needed
    max_age_seconds = 3000
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.photos.id
}
