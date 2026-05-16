pnpm exec nx generate @aws/nx-plugin:ts#dynamodb --name=TableOne --directory=packages/dynamo-tables --no-interactive 
pnpm exec nx generate @aws/nx-plugin:ts#dynamodb --name=TableTwo --directory=packages/dynamo-tables --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#trpc-api --name=trpc --auth=None --no-interactive 
pnpm exec nx generate @aws/nx-plugin:ts#smithy-api --name=smithy --auth=None --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#project --name=agents --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#strands-agent --project=@aws-nx-poc/agents --name=HttpAgent --no-interactive
pnpm exec nx generate @aws/nx-plugin:ts#strands-agent --project=@aws-nx-poc/agents --protocol=A2A --name=A2AAgent --no-interactive
pnpm exec nx generate @aws/nx-plugin:ts#mcp-server --project=@aws-nx-poc/agents --no-interactive

pnpm exec nx generate @aws/nx-plugin:ts#react-website --name=website --uxProvider=Shadcn --no-interactive 