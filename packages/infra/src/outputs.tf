output "aws_region" {
  description = "AWS region"
  value       = data.aws_region.current.id
}

output "environment" {
  description = "Environment (dev, staging, prod)"
  value       = var.environment
}

output "api_endpoint" {
  description = "Invoke URL of the API Gateway stage"
  value       = module.api.stage_invoke_url
}

output "website_url" {
  description = "URL of the deployed website"
  value       = module.website.website_url
}

output "appconfig_application_id" {
  description = "AppConfig application ID shared across all services"
  value       = module.appconfig.application_id
}
