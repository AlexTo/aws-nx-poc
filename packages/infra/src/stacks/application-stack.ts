import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Api,
  Dynamodb1,
  Dynamodb2,
  Dynamodb3,
} from ':aws-nx-poc/common-constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamodb1 = new Dynamodb1(this, 'Dynamodb1');
    const dynamodb2 = new Dynamodb2(this, 'Dynamodb2');
    const dynamodb3 = new Dynamodb3(this, 'Dynamodb3');

    const integrations = Api.defaultIntegrations(this).build();

    new Api(this, 'Api', { integrations });

    [dynamodb1, dynamodb2, dynamodb3].forEach((table) => {
      Object.values(integrations).forEach((integration) => {
        if ('handler' in integration) {
          table.grantReadWriteData(integration.handler);
        }
      });
    });
  }
}
