import { Construct } from 'constructs';
import { PACKAGE_NAME } from ':aws-nx-poc/dynamodb';
import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBTable, DynamoDBTableProps } from '../../core/dynamodb.js';

export type EntitiesProps = Omit<DynamoDBTableProps, 'runtimeConfigKey'>;

export class ElectroDbTable extends DynamoDBTable {
  constructor(scope: Construct, id: string, props?: EntitiesProps) {
    super(scope, id, {
      ...props,
      runtimeConfigKey: PACKAGE_NAME,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'gsi1pk-gsi1sk-index',
      partitionKey: { name: 'gsi1pk', type: AttributeType.STRING },
      sortKey: { name: 'gsi1sk', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'gsi2pk-gsi2sk-index',
      partitionKey: { name: 'gsi2pk', type: AttributeType.STRING },
      sortKey: { name: 'gsi2sk', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
