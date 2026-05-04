import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  Api,
  Mysqldb,
  Postgresdb,
  Website,
} from ':aws-nx-poc/common-constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc');

    const databases = {
      mysql: new Mysqldb(this, 'Mysqldb', { vpc }),
      postgres: new Postgresdb(this, 'Postgresdb', { vpc }),
    };

    const api = new Api(this, 'Api', {
      integrations: Api.defaultIntegrations(this)
        .withDefaultOptions({ vpc })
        .build(),
    });

    Object.values(api.integrations).forEach((integration) => {
      databases.mysql.grantConnect(integration.handler);
      databases.mysql.allowDefaultPortFrom(integration.handler);
      databases.postgres.grantConnect(integration.handler);
      databases.postgres.allowDefaultPortFrom(integration.handler);
    });

    const website = new Website(this, 'Website');

    api.restrictCorsTo(website);
  }
}
