import { Construct } from 'constructs';
import * as url from 'url';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import {
  Code,
  Runtime,
  Function,
  FunctionProps,
  Tracing,
  LayerVersion,
  SnapStartConf,
} from 'aws-cdk-lib/aws-lambda';
import { RuntimeConfig } from '../../core/runtime-config.js';
import {
  AuthorizationType,
  LambdaIntegration,
  ResponseTransferMode,
} from 'aws-cdk-lib/aws-apigateway';
import { Aspects, Duration, Stack } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AnyPrincipal,
  IGrantable,
  Grant,
} from 'aws-cdk-lib/aws-iam';
import {
  ApiIntegrations,
  IntegrationBuilder,
  RestApiIntegration,
} from '../../core/api/utils.js';
import { AddCorsPreflightAspect, RestApi } from '../../core/api/rest-api.js';
import {
  OPERATION_DETAILS,
  Operations,
} from '../../generated/api2/metadata.gen.js';

/**
 * Properties for creating a Api2 construct
 *
 * @template TIntegrations - Map of operation names to their integrations
 */
export interface Api2Props<
  TIntegrations extends ApiIntegrations<Operations, RestApiIntegration>,
> {
  /**
   * Map of operation names to their API Gateway integrations
   */
  integrations: TIntegrations;
  /**
   * Whether to enable AWS WAFv2 with the default managed ruleset on the API's default stage.
   *
   * @default true
   */
  enableWaf?: boolean;
}

/**
 * A CDK construct that creates and configures an AWS API Gateway REST API
 * specifically for Api2.
 * @template TIntegrations - Map of operation names to their integrations
 */
export class Api2<
  TIntegrations extends ApiIntegrations<Operations, RestApiIntegration>,
> extends RestApi<Operations, TIntegrations> {
  private allowedOrigins: readonly string[] = ['*'];

  /**
   * Creates default integrations for all operations, which implement each operation as
   * its own individual lambda function.
   *
   * @param scope - The CDK construct scope
   * @returns An IntegrationBuilder with default lambda integrations
   */
  public static defaultIntegrations = (scope: Construct) => {
    const rc = RuntimeConfig.ensure(scope);
    return IntegrationBuilder.rest({
      pattern: 'isolated',
      operations: OPERATION_DETAILS,
      defaultIntegrationOptions: <FunctionProps>{
        runtime: Runtime.PYTHON_3_14,
        handler: 'run.sh',
        code: Code.fromAsset(
          url.fileURLToPath(
            new URL(
              '../../../../../../dist/packages/api2/bundle-x86',
              import.meta.url,
            ),
          ),
        ),
        timeout: Duration.seconds(30),
        tracing: Tracing.ACTIVE,
        snapStart: SnapStartConf.ON_PUBLISHED_VERSIONS,
      },
      buildDefaultIntegration: (op, props: FunctionProps) => {
        const handler = new Function(scope, `Api2${op}Handler`, props);
        handler.addEnvironment(
          'RUNTIME_CONFIG_APP_ID',
          rc.appConfigApplicationId,
        );
        handler.addEnvironment('PORT', '8000');
        handler.addEnvironment('AWS_LWA_INVOKE_MODE', 'response_stream');
        handler.addEnvironment('AWS_LAMBDA_EXEC_WRAPPER', '/opt/bootstrap');
        rc.grantReadAppConfig(handler);
        const stack = Stack.of(scope);
        handler.addLayers(
          LayerVersion.fromLayerVersionArn(
            scope,
            `Api2${op}LWALayer`,
            `arn:aws:lambda:${stack.region}:753240598075:layer:LambdaAdapterLayerX86:24`,
          ),
        );
        return {
          handler,
          integration: new LambdaIntegration(handler.currentVersion, {
            responseTransferMode: ResponseTransferMode.STREAM,
          }),
        };
      },
    });
  };

  constructor(scope: Construct, id: string, props: Api2Props<TIntegrations>) {
    super(scope, id, {
      apiName: 'Api2',
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
      deployOptions: {
        tracingEnabled: true,
      },
      policy: new PolicyDocument({
        statements: [
          // Open up OPTIONS to allow browsers to make unauthenticated preflight requests
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*/OPTIONS/*'],
          }),
        ],
      }),
      operations: OPERATION_DETAILS,
      ...props,
    });
    Aspects.of(this).add(new AddCorsPreflightAspect(() => this.allowedOrigins));
  }

  /**
   * Grants IAM permissions to invoke any method on this API.
   *
   * @param grantee - The IAM principal to grant permissions to
   */
  public grantInvokeAccess(grantee: IGrantable) {
    this.api.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [grantee.grantPrincipal],
        actions: ['execute-api:Invoke'],
        resources: ['execute-api:/*'],
      }),
    );

    Grant.addToPrincipal({
      grantee,
      actions: ['execute-api:Invoke'],
      resourceArns: [this.api.arnForExecuteApi('*', '/*', '*')],
    });
  }

  /**
   * Restricts CORS to the provided origins
   *
   * Configures the provided CloudFront distribution domains or origin strings
   * as the only permitted CORS origins in API Gateway preflight responses and the
   * AWS Lambda integrations.
   *
   * @param origins - The origin strings, CloudFront distributions, or objects containing a CloudFront distribution to grant CORS from
   */
  public restrictCorsTo(
    ...origins: (
      | string
      | Distribution
      | { cloudFrontDistribution: Distribution }
    )[]
  ) {
    const allowedOrigins = origins.map((origin) =>
      typeof origin === 'string'
        ? origin
        : 'cloudFrontDistribution' in origin
          ? `https://${origin.cloudFrontDistribution.distributionDomainName}`
          : `https://${origin.distributionDomainName}`,
    );

    this.allowedOrigins = allowedOrigins;

    // Set ALLOWED_ORIGINS environment variable for all Lambda integrations
    Object.values(this.integrations).forEach((integration) => {
      if ('handler' in integration && integration.handler instanceof Function) {
        integration.handler.addEnvironment(
          'ALLOWED_ORIGINS',
          allowedOrigins.join(','),
        );
      }
    });
  }
}
