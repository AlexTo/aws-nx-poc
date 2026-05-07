terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.33"
    }
  }
}


variable "env" {
  description = "Environment variables for the Lambda function"
  type        = map(string)
  default     = {}
}

variable "additional_iam_policy_statements" {
  description = "Additional IAM policy statements for the Lambda function"
  type        = list(object({
    Effect   = string
    Action   = list(string)
    Resource = list(string)
  }))
  default = []
}

variable "asset_bucket_name" {
  description = "Name of the shared asset S3 bucket used to stage the Lambda deployment zip. Instantiate the `core/asset-bucket` module once per deployment and pass its `bucket_name` output here."
  type        = string
}

# CORS Configuration (passed to core module)

variable "cors_allow_headers" {
  description = "List of allowed headers for CORS"
  type        = list(string)
  default     = ["authorization", "content-type", "x-amz-content-sha256", "x-amz-date", "x-amz-security-token"]
}

variable "cors_allow_methods" {
  description = "List of allowed HTTP methods for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "cors_allow_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

# WAF Configuration
variable "enable_waf" {
  description = "Whether to enable AWS WAFv2 with the default managed ruleset on the API stage"
  type        = bool
  default     = true
}

# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC ID to deploy the Lambda function in."
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for the Lambda function."
  type        = list(string)
}

variable "memory_size" {
  description = "Amount of memory, in MB, allocated to the Lambda function."
  type        = number
  default     = 256
}

# Get current AWS region and account ID
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Resources

# Create Lambda ZIP file from the bundle directory
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../../../../../dist/packages/api/bundle"
  output_path = "${path.module}/../../../../../../../dist/packages/common/terraform/apis/api/lambda.zip"
}

resource "aws_s3_object" "lambda_zip" {
  bucket      = var.asset_bucket_name
  key         = "apis/api/${data.archive_file.lambda_zip.output_base64sha256}.zip"
  source      = data.archive_file.lambda_zip.output_path
  source_hash = data.archive_file.lambda_zip.output_base64sha256
  etag        = data.archive_file.lambda_zip.output_md5
}

# Use the core REST API module
module "rest_api" {
  source = "../../../core/api/rest-api"

  api_name        = "Api-${random_string.suffix.result}"
  api_description = "Api REST API"
  stage_name      = "prod"
  stage_auto_deploy = true

  # WAF Configuration
  enable_waf = var.enable_waf

  # CORS Configuration
  cors_allow_headers     = var.cors_allow_headers
  cors_allow_methods     = var.cors_allow_methods
  cors_allow_origins     = var.cors_allow_origins

  # Tags
  tags = var.tags
}

resource "aws_wafv2_web_acl_association" "api_waf_association" {
  count = var.enable_waf ? 1 : 0

  resource_arn = aws_api_gateway_stage.api_stage.arn
  web_acl_arn  = module.rest_api.waf_web_acl_arn

  depends_on = [aws_api_gateway_stage.api_stage]
}

# Lambda function
resource "aws_security_group" "api_lambda" {
  #checkov:skip=CKV2_AWS_5:Attached to api_lambda via vpc_config block; Checkov cannot resolve this reference
  name_prefix = "api-lambda-"
  description = "Security group for the API Lambda function"
  vpc_id      = var.vpc_id
  tags        = var.tags
}

resource "aws_vpc_security_group_egress_rule" "api_lambda_https" {
  security_group_id = aws_security_group.api_lambda.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Allow outbound HTTPS to AWS service endpoints"
}

resource "aws_lambda_function" "api_lambda" {
  #checkov:skip=CKV_AWS_117:Lambda is placed in VPC via vpc_config; Checkov cannot resolve the reference
  #checkov:skip=CKV_AWS_116:Dead Letter Queue not required for this simple API use case
  #checkov:skip=CKV_AWS_272:Code signing not required for this use case
  #checkov:skip=CKV_AWS_115:Concurrent execution limit not required for this use case
  #checkov:skip=CKV_AWS_173:Lambda environment variables encrypted by managed key
  s3_bucket         = aws_s3_object.lambda_zip.bucket
  s3_key            = aws_s3_object.lambda_zip.key
  s3_object_version = aws_s3_object.lambda_zip.version_id
  function_name    = "ApiHandler-${random_string.suffix.result}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = "nodejs22.x"
  timeout         = 30
  memory_size     = var.memory_size

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  # Enable X-Ray tracing
  tracing_config {
    mode = "Active"
  }


  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.api_lambda.id]
  }

  environment {
    variables = merge({
    }, var.env)
  }

  tags = var.tags
}

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_execution_role" {
  name = "ApiHandler-execution-role-${random_string.suffix.result}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Attach basic execution policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

# Attach X-Ray tracing policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_xray_execution" {
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
  role       = aws_iam_role.lambda_execution_role.name
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

# Additional IAM policies for Lambda (if provided)
resource "aws_iam_role_policy" "lambda_additional_policies" {
  count = length(var.additional_iam_policy_statements) > 0 ? 1 : 0
  name  = "ApiHandler-additional-policies-${random_string.suffix.result}"
  role  = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = var.additional_iam_policy_statements
  })
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  #checkov:skip=CKV_AWS_158:Using default CloudWatch log encryption
  #checkov:skip=CKV_AWS_338:Log retention set to forever
  #checkov:skip=CKV_AWS_66:Log retention set to forever
  name              = "/aws/lambda/ApiHandler-${random_string.suffix.result}"
  tags              = var.tags
}



# Create proxy resource (captures all paths)
resource "aws_api_gateway_resource" "proxy_resource" {
  rest_api_id = module.rest_api.api_id
  parent_id   = module.rest_api.api_root_resource_id
  path_part   = "{proxy+}"
}

# Lambda integration for REST API
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = module.rest_api.api_id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_lambda.response_streaming_invoke_arn
  response_transfer_mode  = "STREAM"

  depends_on = [aws_lambda_function.api_lambda]
}

# Method for proxy integration
resource "aws_api_gateway_method" "proxy_method" {
  #checkov:skip=CKV2_AWS_53:Request validation not required for proxy integration as Lambda handles validation
  #checkov:skip=CKV_AWS_59:Allow public API
  rest_api_id   = module.rest_api.api_id
  resource_id   = aws_api_gateway_resource.proxy_resource.id
  http_method   = "ANY"

  # Note: you may wish to suppress the checkov rule CKV_AWS_59 if you are absolutely sure you
  # need a public API without authentication
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }

  depends_on = []
}

# OPTIONS method for CORS preflight
resource "aws_api_gateway_method" "options_method" {
  #checkov:skip=CKV2_AWS_70:OPTIONS method must be unauthenticated for CORS preflight requests
  #checkov:skip=CKV2_AWS_53:Request validation not required for OPTIONS CORS preflight method
  rest_api_id   = module.rest_api.api_id
  resource_id   = aws_api_gateway_resource.proxy_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS integration for OPTIONS method
resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id = module.rest_api.api_id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.options_method.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 204}"
  }
}

# OPTIONS method response
resource "aws_api_gateway_method_response" "options_response" {
  rest_api_id = module.rest_api.api_id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "204"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# OPTIONS integration response
resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = module.rest_api.api_id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'${join(",", var.cors_allow_headers)}'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", var.cors_allow_methods)}'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allow_origins)}'"
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = module.rest_api.api_id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.proxy_resource.id,
      aws_api_gateway_method.proxy_method.id,
      aws_api_gateway_integration.lambda_integration.id,
      aws_api_gateway_method.options_method.id,
      aws_api_gateway_integration.options_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.proxy_method,
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_method.options_method,
    aws_api_gateway_integration.options_integration,
    aws_api_gateway_method_response.options_response,
    aws_api_gateway_integration_response.options_integration_response,
  ]
}

# API Gateway stage
resource "aws_api_gateway_stage" "api_stage" {
  #checkov:skip=CKV_AWS_120:API Gateway caching not required for this use case
  #checkov:skip=CKV_AWS_76:API Gateway access logging disabled due to account-level CloudWatch Logs role ARN requirement
  #checkov:skip=CKV2_AWS_4:API Gateway logging level not applicable as access logging is disabled
  #checkov:skip=CKV2_AWS_51:Client certificate authentication not required for this use case
  #checkov:skip=CKV2_AWS_77:WAFv2 Web ACL is attached via aws_wafv2_web_acl_association when var.enable_waf is true (default) and includes AWSManagedRulesKnownBadInputsRuleSet for Log4j protection; Checkov does not track the association across modules
  deployment_id        = aws_api_gateway_deployment.api_deployment.id
  rest_api_id          = module.rest_api.api_id
  stage_name           = "prod"
  xray_tracing_enabled = true

  tags = var.tags

  depends_on = [aws_api_gateway_deployment.api_deployment]
}

# API Gateway Resource Policy
resource "aws_api_gateway_rest_api_policy" "api_policy" {
  rest_api_id = module.rest_api.api_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # Allow all callers to invoke the API in the resource policy
        Effect = "Allow"
        Principal = "*"
        Action   = "execute-api:Invoke"
        Resource = "execute-api:/*"
      }
    ]
  })
}

# Lambda permission for API Gateway to invoke the function
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.rest_api.api_execution_arn}/*/*"

  depends_on = [module.rest_api, aws_lambda_function.api_lambda]
}


# Add API url to runtime config
module "add_url_to_runtime_config" {
  source = "../../../core/runtime-config/entry"

  namespace = "connection"
  key       = "apis"
  value     = { "Api" = aws_api_gateway_stage.api_stage.invoke_url }

  depends_on = [aws_api_gateway_stage.api_stage]
}

# Outputs

# API Gateway Outputs (from core module)
output "api_id" {
  description = "ID of the REST API Gateway"
  value       = module.rest_api.api_id
}

output "api_arn" {
  description = "ARN of the REST API Gateway"
  value       = module.rest_api.api_arn
}

output "api_endpoint" {
  description = "Base URL of the REST API Gateway"
  value       = module.rest_api.api_endpoint
}

output "api_execution_arn" {
  description = "Execution ARN of the REST API Gateway"
  value       = module.rest_api.api_execution_arn
}

output "stage_invoke_url" {
  description = "Invoke URL of the API Gateway stage"
  value       = aws_api_gateway_stage.api_stage.invoke_url
}

output "stage_arn" {
  description = "ARN of the API Gateway stage"
  value       = aws_api_gateway_stage.api_stage.arn
}

output "stage_execution_arn" {
  description = "Execution ARN of the API Gateway stage"
  value       = aws_api_gateway_stage.api_stage.execution_arn
}

output "deployment_id" {
  description = "ID of the API Gateway deployment"
  value       = aws_api_gateway_deployment.api_deployment.id
}

output "stage_id" {
  description = "ID of the API Gateway stage"
  value       = aws_api_gateway_stage.api_stage.id
}

# Lambda Function Outputs
output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api_lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api_lambda.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.api_lambda.invoke_arn
}

output "lambda_qualified_arn" {
  description = "Qualified ARN of the Lambda function"
  value       = aws_lambda_function.api_lambda.qualified_arn
}

output "lambda_version" {
  description = "Version of the Lambda function"
  value       = aws_lambda_function.api_lambda.version
}

output "lambda_source_code_hash" {
  description = "Base64-encoded SHA256 hash of the Lambda deployment package"
  value       = aws_lambda_function.api_lambda.source_code_hash
}

output "lambda_source_code_size" {
  description = "Size of the Lambda deployment package in bytes"
  value       = aws_lambda_function.api_lambda.source_code_size
}

# IAM Role Outputs
output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "lambda_execution_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.name
}

# Integration Outputs
output "integration_id" {
  description = "ID of the Lambda integration"
  value       = aws_api_gateway_integration.lambda_integration.id
}

output "proxy_resource_id" {
  description = "ID of the proxy resource"
  value       = aws_api_gateway_resource.proxy_resource.id
}

output "proxy_method_id" {
  description = "ID of the proxy method"
  value       = aws_api_gateway_method.proxy_method.id
}

# CloudWatch Log Groups
output "lambda_log_group_name" {
  description = "Name of the Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "lambda_log_group_arn" {
  description = "ARN of the Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_logs.arn
}

output "security_group_id" {
  description = "Security group ID of the API Lambda function."
  value       = aws_security_group.api_lambda.id
}
