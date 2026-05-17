import { Construct } from 'constructs';
import { PACKAGE_NAME } from ':aws-nx-poc/table-two';
import { DynamoDBTable, DynamoDBTableProps } from '../../core/dynamodb.js';

export type TableTwoProps = Omit<DynamoDBTableProps, 'runtimeConfigKey'>;

export class TableTwo extends DynamoDBTable {
  constructor(scope: Construct, id: string, props?: TableTwoProps) {
    super(scope, id, {
      ...props,
      runtimeConfigKey: PACKAGE_NAME,
    });
  }
}
