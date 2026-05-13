pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/trpc --targetProject=@aws-nx-poc/my-sql-db --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/trpc --targetProject=@aws-nx-poc/postgres-db --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/smithy --targetProject=@aws-nx-poc/postgres-db --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/smithy --targetProject=@aws-nx-poc/my-sql-db --no-interactive 

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/my-sql-db --sourceComponent=http-agent --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/postgres-db --sourceComponent=http-agent --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/my-sql-db --sourceComponent=a2a-agent --no-interactive 
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/postgres-db --sourceComponent=a2a-agent --no-interactive 

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/my-sql-db --sourceComponent=mcp-server --no-interactive 
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/postgres-db --sourceComponent=mcp-server --no-interactive 