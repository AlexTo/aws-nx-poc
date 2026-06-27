pnpm exec nx generate @aws/nx-plugin:py#rdb --name=PostgresDb --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#rdb --name=MySqlDb --engine=mysql --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#api --name=Api1 --auth=custom --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#api --name=Api2 --auth=custom --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=aws_nx_poc.api1 --targetProject=aws_nx_poc.postgres_db --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=aws_nx_poc.api2 --targetProject=aws_nx_poc.my_sql_db --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#project --name=PyProject --type=application --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#mcp-server --project=aws_nx_poc.py_project --no-interactive

pnpm exec nx generate @aws/nx-plugin:py#agent --project=aws_nx_poc.py_project --no-interactive