locals {
  account_id = data.aws_caller_identity.current.account_id
  aws_region = data.aws_region.current.id
  tags = {
    environment = var.environment
  }
}

# Include metrics tracking for @aws/nx-plugin usage
module "metrics" {
  source = "../../common/terraform/src/metrics"
}

# AppConfig application — created first so all modules can reference its outputs
module "appconfig" {
  source = "../../common/terraform/src/core/runtime-config/appconfig"

  application_name = "ts-rdb-terraform-${var.environment}"
  namespaces       = ["connection", "database"]
}

module "asset_bucket" {
  source = "../../common/terraform/src/core/asset-bucket"

  tags = local.tags
}

module "mysqldb" {
  source = "../../common/terraform/src/app/dbs/mysqldb"

  vpc_id              = aws_vpc.main.id
  private_subnet_ids  = aws_subnet.private[*].id
  asset_bucket_name   = module.asset_bucket.bucket_name
  deletion_protection = false
  skip_final_snapshot = true
  tags                = local.tags
}

module "postgresdb" {
  source = "../../common/terraform/src/app/dbs/postgresdb"

  vpc_id              = aws_vpc.main.id
  private_subnet_ids  = aws_subnet.private[*].id
  asset_bucket_name   = module.asset_bucket.bucket_name
  deletion_protection = false
  skip_final_snapshot = true
  tags                = local.tags
}

module "api" {
  source = "../../common/terraform/src/app/apis/api"

  asset_bucket_name = module.asset_bucket.bucket_name
  vpc_id            = aws_vpc.main.id
  subnet_ids        = aws_subnet.private[*].id

  env = {
    RUNTIME_CONFIG_APP_ID = module.appconfig.application_id
  }

  additional_iam_policy_statements = [
    {
      Effect = "Allow"
      Action = [
        "appconfig:GetConfiguration",
        "appconfig:StartConfigurationSession",
        "appconfig:GetLatestConfiguration",
      ]
      Resource = ["arn:aws:appconfig:${local.aws_region}:${local.account_id}:application/${module.appconfig.application_id}*"]
    },
    {
      Effect   = "Allow"
      Action   = ["rds-db:connect"]
      Resource = ["arn:aws:rds-db:${local.aws_region}:${local.account_id}:dbuser:${coalesce(module.postgresdb.proxy_resource_id, module.postgresdb.cluster_resource_id)}/${module.postgresdb.database_runtime_user}"]
    },
    {
      Effect   = "Allow"
      Action   = ["rds-db:connect"]
      Resource = ["arn:aws:rds-db:${local.aws_region}:${local.account_id}:dbuser:${coalesce(module.mysqldb.proxy_resource_id, module.mysqldb.cluster_resource_id)}/${module.mysqldb.database_runtime_user}"]
    },
  ]

  tags = local.tags
}

# Allow API Lambda → PostgreSQL
resource "aws_vpc_security_group_egress_rule" "api_to_postgresdb" {
  security_group_id            = module.api.security_group_id
  referenced_security_group_id = module.postgresdb.security_group_id
  from_port                    = module.postgresdb.cluster_port
  to_port                      = module.postgresdb.cluster_port
  ip_protocol                  = "tcp"
  description                  = "Allow outbound traffic from API Lambda to PostgreSQL"
}

resource "aws_vpc_security_group_ingress_rule" "postgresdb_from_api" {
  security_group_id            = module.postgresdb.security_group_id
  referenced_security_group_id = module.api.security_group_id
  from_port                    = module.postgresdb.cluster_port
  to_port                      = module.postgresdb.cluster_port
  ip_protocol                  = "tcp"
  description                  = "Allow inbound traffic from API Lambda to PostgreSQL"
}

# Allow API Lambda → MySQL
resource "aws_vpc_security_group_egress_rule" "api_to_mysqldb" {
  security_group_id            = module.api.security_group_id
  referenced_security_group_id = module.mysqldb.security_group_id
  from_port                    = module.mysqldb.cluster_port
  to_port                      = module.mysqldb.cluster_port
  ip_protocol                  = "tcp"
  description                  = "Allow outbound traffic from API Lambda to MySQL"
}

resource "aws_vpc_security_group_ingress_rule" "mysqldb_from_api" {
  security_group_id            = module.mysqldb.security_group_id
  referenced_security_group_id = module.api.security_group_id
  from_port                    = module.mysqldb.cluster_port
  to_port                      = module.mysqldb.cluster_port
  ip_protocol                  = "tcp"
  description                  = "Allow inbound traffic from API Lambda to MySQL"
}

module "website" {
  source = "../../common/terraform/src/app/static-websites/website"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  # Ensure the connection runtime config entry (api URL) is written before the
  # website reads the connection namespace to populate runtime-config.json
  depends_on = [module.api]
}

# AppConfig deployment — created last so all runtime config entries are written first
module "appconfig_deployment" {
  source = "../../common/terraform/src/core/runtime-config/appconfig-deployment"

  application_id            = module.appconfig.application_id
  environment_id            = module.appconfig.environment_id
  deployment_strategy_id    = module.appconfig.deployment_strategy_id
  configuration_profile_ids = module.appconfig.configuration_profile_ids
  namespaces                = module.appconfig.namespaces

  depends_on = [
    module.api,
    module.mysqldb,
    module.postgresdb,
  ]
}

resource "null_resource" "print_info" {
  provisioner "local-exec" {
    command = "echo 'AWS Region: ${local.aws_region}, AWS Account: ${local.account_id}, Environment: ${var.environment}'"
  }
}
