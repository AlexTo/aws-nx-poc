pnpm exec nx generate @aws/nx-plugin:py#rdb --name=PostgresDb --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#rdb --name=MySqlDb --engine=mysql --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#api --name=Api1 --auth=custom --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#api --name=Api2 --auth=custom --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=aws_nx_poc.api1 --targetProject=aws_nx_poc.postgres_db --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=aws_nx_poc.api2 --targetProject=aws_nx_poc.my_sql_db --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#project --name=PyProject --type=application --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#mcp-server --project=aws_nx_poc.py_project --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#agent --project=aws_nx_poc.py_project --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#website --name=website --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/website --targetProject=aws_nx_poc.api1 --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/website --targetProject=aws_nx_poc.api2 --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#infra --name=infra --no-interactive

pnpm exec nx run postgres_db:alembic revision --autogenerate -m "Added example table"

pnpm exec nx run my_sql_db:alembic revision --autogenerate -m "Added example table"

pnpm exec nx run postgres_db:migrate

pnpm exec nx run my_sql_db:migrate