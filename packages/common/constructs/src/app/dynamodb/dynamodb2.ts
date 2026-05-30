import { Construct } from 'constructs';
import { PACKAGE_NAME, GLOBAL_SECONDARY_INDEXES } from ':aws-nx-poc/dynamodb2';
import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBTable, DynamoDBTableProps } from '../../core/dynamodb.js';

export type Dynamodb2Props = Omit<DynamoDBTableProps, 'runtimeConfigKey'>;

export class Dynamodb2 extends DynamoDBTable {
  constructor(scope: Construct, id: string, props?: Dynamodb2Props) {
    super(scope, id, {
      ...props,
      runtimeConfigKey: PACKAGE_NAME,
    });

    for (const gsi of GLOBAL_SECONDARY_INDEXES) {
      this.table.addGlobalSecondaryIndex({
        indexName: gsi.indexName,
        partitionKey: { name: gsi.partitionKey, type: AttributeType.STRING },
        sortKey: { name: gsi.sortKey, type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
      });
    }
  }
}
