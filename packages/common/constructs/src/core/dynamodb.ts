import { Construct } from 'constructs';
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption,
  TableProps,
} from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Grant, IGrantable } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RuntimeConfig } from './runtime-config.js';

type _DynamoDBTableProps = Omit<
  TableProps,
  'tableName' | 'partitionKey' | 'sortKey' | 'encryption' | 'encryptionKey'
>;

export interface DynamoDBTableProps extends _DynamoDBTableProps {
  /**
   * The DynamoDB table name. If omitted, CDK auto-generates a unique name
   * from the stack name and construct path.
   */
  readonly tableName?: string;

  /**
   * RuntimeConfig key used under the `dynamodb` namespace.
   */
  readonly runtimeConfigKey: string;

  /**
   * Whether to enable automatic key rotation on the KMS key used to encrypt the table.
   *
   * @default true
   */
  readonly enableKeyRotation?: boolean;
}

export abstract class DynamoDBTable extends Construct {
  public readonly table: Table;

  constructor(
    scope: Construct,
    id: string,
    {
      tableName,
      runtimeConfigKey,
      billingMode = BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification = { pointInTimeRecoveryEnabled: true },
      deletionProtection = true,
      removalPolicy = RemovalPolicy.RETAIN,
      enableKeyRotation = true,
      ...rest
    }: DynamoDBTableProps,
  ) {
    super(scope, id);

    const key = new Key(this, 'EncryptionKey', { enableKeyRotation });

    this.table = new Table(this, runtimeConfigKey, {
      ...rest,
      ...(tableName !== undefined && { tableName }),
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode,
      pointInTimeRecoverySpecification,
      deletionProtection,
      encryptionKey: key,
      encryption: TableEncryption.CUSTOMER_MANAGED,
      removalPolicy,
    });

    const rc = RuntimeConfig.ensure(this);
    rc.set('dynamodb', runtimeConfigKey, { tableName: this.table.tableName });
  }
  grantReadData(grantee: IGrantable): Grant {
    return this.table.grantReadData(grantee);
  }

  grantWriteData(grantee: IGrantable): Grant {
    return this.table.grantWriteData(grantee);
  }

  grantReadWriteData(grantee: IGrantable): Grant {
    return this.table.grantReadWriteData(grantee);
  }

  grantFullAccess(grantee: IGrantable): Grant {
    return this.table.grantFullAccess(grantee);
  }

  grantStreamRead(grantee: IGrantable): Grant {
    return this.table.grantStreamRead(grantee);
  }

  grantTableListStreams(grantee: IGrantable): Grant {
    return this.table.grantTableListStreams(grantee);
  }

  grant(grantee: IGrantable, ...actions: string[]): Grant {
    return this.table.grant(grantee, ...actions);
  }

  grantStream(grantee: IGrantable, ...actions: string[]): Grant {
    return this.table.grantStream(grantee, ...actions);
  }
}
