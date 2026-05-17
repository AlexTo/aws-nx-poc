import { Construct } from 'constructs';
import { PACKAGE_NAME } from ':aws-nx-poc/table-one';
import { DynamoDBTable, DynamoDBTableProps } from '../../core/dynamodb.js';

export type TableOneProps = Omit<DynamoDBTableProps, 'runtimeConfigKey'>;

export class TableOne extends DynamoDBTable {
  constructor(scope: Construct, id: string, props?: TableOneProps) {
    super(scope, id, {
      ...props,
      runtimeConfigKey: PACKAGE_NAME,
    });
  }
}
