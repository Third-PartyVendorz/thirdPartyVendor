resource "aws_s3_bucket" "frontend_bucket" {
    bucket = "tpv-frontend-bucket"
}


resource "aws_s3_bucket_public_access_block" "block_buplic" {
    bucket                  = aws_s3_bucket.frontend_bucket.id
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
}









