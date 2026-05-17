pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-one --sourceComponent=http-agent --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-two --sourceComponent=http-agent --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-one --sourceComponent=a2-aagent --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-two --sourceComponent=a2-aagent --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-one --sourceComponent=mcp-server --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/agents --targetProject=@aws-nx-poc/table-two --sourceComponent=mcp-server --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/smithy --targetProject=@aws-nx-poc/table-one --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/smithy --targetProject=@aws-nx-poc/table-two --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/trpc --targetProject=@aws-nx-poc/table-one --no-interactive
pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/trpc --targetProject=@aws-nx-poc/table-two --no-interactive

pnpm exec nx generate @aws/nx-plugin:connection --sourceProject=@aws-nx-poc/website --targetProject=@aws-nx-poc/trpc --no-interactive
