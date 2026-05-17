import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  TableOne,
  TableTwo,
  Trpc,
  Website,
} from ':aws-nx-poc/common-constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const tableOne = new TableOne(this, 'TableOne', {
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const tableTwo = new TableTwo(this, 'TableTwo', {
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const integrations = Trpc.defaultIntegrations(this).build();
    const trpc = new Trpc(this, 'Trpc', { integrations });

    Object.values(trpc.integrations).forEach((integration) => {
      tableOne.table.grantReadWriteData(integration.handler);
      tableTwo.table.grantReadWriteData(integration.handler);
    });

    const website = new Website(this, 'Website');
    trpc.restrictCorsTo(website);
  }
}
