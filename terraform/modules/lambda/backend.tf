resource "aws_s3_bucket" "backend_python_layer" {
  bucket = "tend-attend-lambda-backend-python-layer"
}

resource "aws_s3_object" "backend_python_layer" {
  bucket      = aws_s3_bucket.backend_python_layer.id
  key         = "backend-python.zip"
  source      = "../../../backend-python.zip"
  source_hash = filemd5("../../../backend-python.zip")
}

resource "aws_lambda_layer_version" "backend_python_libs" {
  layer_name          = "backend-python-libs"
  compatible_runtimes = ["python3.13"]
  s3_bucket           = aws_s3_bucket.backend_python_layer.id
  s3_key              = aws_s3_object.backend_python_layer.key
  source_code_hash    = filebase64sha256("../../../backend-python.zip")
}

resource "aws_lambda_layer_version" "backend_dependencies" {
  layer_name          = "backend-dependencies"
  compatible_runtimes = ["python3.13"]
  filename            = "../../../backend-dependencies.zip"
  source_code_hash    = filebase64sha256("../../../backend-dependencies.zip")
}

resource "aws_lambda_function" "backend" {
  function_name    = "tend-attend-backend-lambda-function"
  role             = aws_iam_role.lambda.arn
  architectures    = ["x86_64"]
  filename         = "../../../backend.zip"
  source_code_hash = filebase64sha256("../../../backend.zip")
  handler          = "main.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.backend_python_libs.arn, aws_lambda_layer_version.backend_dependencies.arn]
  timeout          = var.backend_lambda_timeout
  memory_size      = var.backend_lambda_memory_size
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
  environment {
    variables = {
      COOKIE_DOMAIN                   = var.cookie_domain
      JWT_SECRET_KEY                  = var.jwt_secret_key
      AWS_SECRETSMANAGER_SECRET_ID    = var.aurora_credentials.secret_id
      AWS_SECRETSMANAGER_REGION       = var.aws_region
      DB_SHARD_COUNT                  = var.db_shard_count
      AWS_RDS_CLUSTER_INSTANCE_URL    = var.rds_cluster_instance_url
      AWS_RDS_CLUSTER_INSTANCE_PORT   = var.aurora_credentials.port
      AWS_RDS_CLUSTER_MASTER_USERNAME = var.aurora_credentials.username
      AWS_RDS_CLUSTER_MASTER_PASSWORD = var.aurora_credentials.password
      AURORA_COMMON_DBNAME            = var.common_dbname
      AURORA_SEQUENCE_DBNAME          = var.sequence_dbname
      AURORA_SHARD_DBNAME_PREFIX      = var.shard_dbname_prefix
      ML_SERVER_URL                   = var.ml_server_url
    }
  }
}

resource "aws_lambda_function_url" "backend" {
  function_name      = aws_lambda_function.backend.function_name
  authorization_type = "AWS_IAM"
  cors {
    allow_credentials = true
    allow_headers     = ["content-type"]
    allow_methods     = ["*"]
    allow_origins     = var.allow_origins
    expose_headers    = []
    max_age           = 86400
  }
}

resource "aws_lambda_permission" "allow_cloudfront_backend" {
  statement_id           = "AllowCloudFrontInvokeBackendFunction"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.backend.function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = var.cloudfront_arn
  function_url_auth_type = "AWS_IAM"
}
