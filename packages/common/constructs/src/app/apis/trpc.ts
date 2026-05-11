import { Construct } from 'constructs';
import * as url from 'url';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import {
  Code,
  Runtime,
  Function,
  FunctionProps,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { RuntimeConfig } from '../../core/runtime-config.js';
import {
  AuthorizationType,
  LambdaIntegration,
  ResponseTransferMode,
} from 'aws-cdk-lib/aws-apigateway';
import { Aspects, Duration } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AnyPrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  ApiIntegrations,
  IntegrationBuilder,
  RestApiIntegration,
} from '../../core/api/utils.js';
import { AddCorsPreflightAspect, RestApi } from '../../core/api/rest-api.js';
import { Procedures, routerToOperations } from '../../core/api/trpc-utils.js';
import { AppRouter, appRouter } from ':aws-nx-poc/trpc';

// String union type for all API operation names
type Operations = Procedures<AppRouter>;

/**
 * Properties for creating a Trpc construct
 *
 * @template TIntegrations - Map of operation names to their integrations
 */
export interface TrpcProps<
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
 * specifically for Trpc.
 * @template TIntegrations - Map of operation names to their integrations
 */
export class Trpc<
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
      operations: routerToOperations(appRouter),
      defaultIntegrationOptions: <FunctionProps>{
        runtime: Runtime.NODEJS_LATEST,
        handler: 'index.handler',
        code: Code.fromAsset(
          url.fileURLToPath(
            new URL(
              '../../../../../../dist/packages/trpc/bundle',
              import.meta.url,
            ),
          ),
        ),
        timeout: Duration.seconds(30),
        tracing: Tracing.ACTIVE,
      },
      buildDefaultIntegration: (op, props: FunctionProps) => {
        const handler = new Function(scope, `Trpc${op}Handler`, props);
        handler.addEnvironment(
          'RUNTIME_CONFIG_APP_ID',
          rc.appConfigApplicationId,
        );
        rc.grantReadAppConfig(handler);
        return {
          handler,
          integration: new LambdaIntegration(handler, {
            responseTransferMode: ResponseTransferMode.STREAM,
          }),
        };
      },
    });
  };

  constructor(scope: Construct, id: string, props: TrpcProps<TIntegrations>) {
    super(scope, id, {
      apiName: 'Trpc',
      defaultMethodOptions: {
        authorizationType: AuthorizationType.NONE,
      },
      deployOptions: {
        tracingEnabled: true,
      },
      policy: new PolicyDocument({
        statements: [
          // Allow all callers to invoke the API in the resource policy
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
          }),
        ],
      }),
      operations: routerToOperations(appRouter),
      ...props,
    });
    Aspects.of(this).add(new AddCorsPreflightAspect(() => this.allowedOrigins));
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
