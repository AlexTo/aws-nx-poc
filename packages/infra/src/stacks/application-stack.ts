import {
  ElectroDbTable,
  GameApi,
  GameUI,
  InventoryMcpServer,
  RuntimeConfig,
  StoryAgent,
  UserIdentity,
  suppressRules,
} from ':aws-nx-poc/common-constructs';
import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const rc = RuntimeConfig.ensure(this);

    const userIdentity = new UserIdentity(this, 'UserIdentity');

    const electroDbTable = new ElectroDbTable(this, 'ElectroDbTable', {
      enableKeyRotation: false,
      deletionProtection: false,
    });

    // S3 bucket for Strands conversation history. The Story Agent writes each
    // turn via ``S3SessionManager``; the Game API reads them back for replay.
    const storySessions = new Bucket(this, 'StorySessions', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    suppressRules(
      storySessions,
      ['CKV_AWS_18', 'CKV_AWS_21'],
      'Access logging and object versioning are unnecessary for ephemeral chat transcripts',
    );
    rc.set('buckets', 'StorySessions', {
      bucketName: storySessions.bucketName,
    });

    const gameApi = new GameApi(this, 'GameApi', {
      integrations: GameApi.defaultIntegrations(this).build(),
    });

    electroDbTable.grantReadData(gameApi.integrations['games.query'].handler);
    electroDbTable.grantReadData(
      gameApi.integrations['inventory.query'].handler,
    );
    electroDbTable.grantReadWriteData(
      gameApi.integrations['games.save'].handler,
    );
    storySessions.grantRead(gameApi.integrations['actions.query'].handler);

    const mcpServer = new InventoryMcpServer(this, 'InventoryMcpServer');
    electroDbTable.grantReadWriteData(mcpServer.agentCoreRuntime);

    // Use Cognito for user authentication with the agent
    const storyAgent = new StoryAgent(this, 'StoryAgent');

    storyAgent.grantInvokeAccess(userIdentity.identityPool.authenticatedRole);

    storySessions.grantReadWrite(storyAgent);

    new CfnOutput(this, 'StoryAgentArn', {
      value: storyAgent.agentCoreRuntime.agentRuntimeArn,
    });
    new CfnOutput(this, 'InventoryMcpArn', {
      value: mcpServer.agentCoreRuntime.agentRuntimeArn,
    });

    // Grant the agent permissions to invoke our mcp server
    mcpServer.grantInvokeAccess(storyAgent);

    // Grant the authenticated role access to invoke the api
    gameApi.grantInvokeAccess(userIdentity.identityPool.authenticatedRole);

    new GameUI(this, 'GameUI');
  }
}
