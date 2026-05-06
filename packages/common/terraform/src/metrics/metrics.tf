locals {
  metric_id = "uksb-4wk0bqpg5s"
  metric_version = "0.0.0"
  metric_tags = ["g38", "g1", "g9", "g5", "g7", "g10", "g23"]
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# CloudFormation stack for metrics tracking
resource "aws_cloudformation_stack" "metrics" {
  #checkov:skip=CKV_AWS_124:Metrics stack does not require SNS notifications
  name = "nx-plugin-metrics-${random_string.suffix.result}"

  template_body = jsonencode({
    AWSTemplateFormatVersion = "2010-09-09"
    Description = "(${local.metric_id}) (version:${local.metric_version}) (tag:${join(",", local.metric_tags)})"
    Resources = {
      # Empty stack - used only for metrics tracking via description
      MetricsPlaceholder = {
        Type = "AWS::CloudFormation::WaitConditionHandle"
      }
    }
  })

  tags = {
    Purpose = "nx-plugin-metrics"
  }
}