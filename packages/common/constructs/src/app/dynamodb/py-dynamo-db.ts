import { Construct } from 'constructs';
import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBTable, DynamoDBTableProps } from '../../core/dynamodb.js';
import { findWorkspaceRoot } from '../../core/workspace.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const { runtimeConfigKey, tableConfig } = JSON.parse(
  readFileSync(
    join(
      findWorkspaceRoot(fileURLToPath(new URL(import.meta.url))),
      'packages/py_dynamo_db/config.json',
    ),
    'utf-8',
  ),
) as {
  runtimeConfigKey: string;
  tableConfig: {
    globalSecondaryIndexes: {
      indexName: string;
      partitionKey: string;
      sortKey?: string;
    }[];
  };
};

export type PyDynamoDbProps = Omit<DynamoDBTableProps, 'runtimeConfigKey'>;

export class PyDynamoDb extends DynamoDBTable {
  constructor(scope: Construct, id: string, props?: PyDynamoDbProps) {
    super(scope, id, {
      ...props,
      runtimeConfigKey,
    });

    for (const gsi of tableConfig.globalSecondaryIndexes) {
      this.table.addGlobalSecondaryIndex({
        indexName: gsi.indexName,
        partitionKey: { name: gsi.partitionKey, type: AttributeType.STRING },
        ...(gsi.sortKey && {
          sortKey: { name: gsi.sortKey, type: AttributeType.STRING },
        }),
        projectionType: ProjectionType.ALL,
      });
    }
  }
}
