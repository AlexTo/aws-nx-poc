import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { RuntimeNetworkConfiguration } from 'aws-cdk-lib/aws-bedrockagentcore';
import { Construct } from 'constructs';
import {
  Api1,
  Api2,
  MyAgent,
  MySqlDb,
  PostgresDb,
  PyProjectMcpServer,
  RdsCaLayer,
  UserIdentity,
  Website,
} from ':aws-nx-poc/common-constructs';

// This POC is configured for development, not production. Before deploying for real workloads,
// remove these overrides so the constructs fall back to their production-safe defaults
// (deletion protection, WAF, credential rotation, RDS Proxy, Performance Insights, etc).
const DEV_DATABASE_PROPS = {
  deletionProtection: false,
  removalPolicy: RemovalPolicy.DESTROY,
  enableCredentialRotation: false,
  enableRdsProxy: false,
  enablePerformanceInsights: false,
};

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc', { maxAzs: 2, natGateways: 1 });

    const postgresDb = new PostgresDb(this, 'PostgresDb', {
      vpc,
      ...DEV_DATABASE_PROPS,
    });
    const mySqlDb = new MySqlDb(this, 'MySqlDb', {
      vpc,
      ...DEV_DATABASE_PROPS,
    });
    const rdsCaLayer = new RdsCaLayer(this, 'RdsCaLayer');

    const api1 = new Api1(this, 'Api1', {
      enableWaf: false,
      integrations: Api1.defaultIntegrations(this)
        .withDefaultOptions({
          layers: [rdsCaLayer.layer],
          vpc,
          vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        })
        .build(),
    });
    Object.entries(api1.integrations).forEach(([operation, integration]) => {
      postgresDb.allowDefaultPortFrom(
        integration.handler,
        `Allow ${operation} to connect to PostgresDb`,
      );
      postgresDb.grantConnect(integration.handler);
    });

    const api2 = new Api2(this, 'Api2', {
      enableWaf: false,
      integrations: Api2.defaultIntegrations(this)
        .withDefaultOptions({
          layers: [rdsCaLayer.layer],
          vpc,
          vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        })
        .build(),
    });
    Object.entries(api2.integrations).forEach(([operation, integration]) => {
      mySqlDb.allowDefaultPortFrom(
        integration.handler,
        `Allow ${operation} to connect to MySqlDb`,
      );
      mySqlDb.grantConnect(integration.handler);
    });

    const mcpServer = new PyProjectMcpServer(this, 'PyProjectMcpServer', {
      networkConfiguration: RuntimeNetworkConfiguration.usingVpc(
        new Construct(this, 'PyProjectMcpServerNetwork'),
        { vpc, vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS } },
      ),
    });
    const myAgent = new MyAgent(this, 'MyAgent', {
      networkConfiguration: RuntimeNetworkConfiguration.usingVpc(
        new Construct(this, 'MyAgentNetwork'),
        { vpc, vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS } },
      ),
    });

    // Grant the agent permission to invoke the MCP server
    mcpServer.grantInvokeAccess(myAgent);

    // myAgent queries PostgresDb directly, and mcpServer queries MySqlDb directly
    // (both via RDS IAM auth), so both need network access and rds-db:connect.
    postgresDb.allowDefaultPortFrom(
      myAgent,
      'Allow MyAgent to connect to PostgresDb',
    );
    postgresDb.grantConnect(myAgent);
    mySqlDb.allowDefaultPortFrom(
      mcpServer,
      'Allow PyProjectMcpServer to connect to MySqlDb',
    );
    mySqlDb.grantConnect(mcpServer);

    // Identity must be created before the website so Cognito auth is present
    // in runtime config when the website is deployed
    const identity = new UserIdentity(this, 'Identity', { enableWaf: false });

    const website = new Website(this, 'Website');

    // Restrict API CORS to the deployed website's CloudFront distribution
    api1.restrictCorsTo(website.cloudFrontDistribution);
    api2.restrictCorsTo(website.cloudFrontDistribution);

    // Grant the authenticated Cognito role permission to invoke the agent
    myAgent.grantInvokeAccess(identity.identityPool.authenticatedRole);

    // Grant the authenticated Cognito role permission to invoke Api1 and Api2
    api1.grantInvokeAccess(identity.identityPool.authenticatedRole);
    api2.grantInvokeAccess(identity.identityPool.authenticatedRole);
  }
}
