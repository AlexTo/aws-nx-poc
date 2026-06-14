import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Api, PyDynamoDb } from ":aws-nx-poc/common-constructs";
import { Construct } from "constructs";

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new PyDynamoDb(this, "PyDynamoDb", {
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
      enableKeyRotation: false,
    });

    const integrations = Api.defaultIntegrations(this).build();

    const api = new Api(this, "Api", { integrations });

    table.grantReadWriteData(api.integrations.addExample.handler);
    table.grantReadWriteData(api.integrations.listExamples.handler);
  }
}
