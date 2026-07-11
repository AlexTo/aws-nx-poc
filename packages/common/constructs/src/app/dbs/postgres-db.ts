import * as path from 'path';
import * as url from 'url';
import { readFileSync } from 'fs';
import { Construct } from 'constructs';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import {
  DockerImageCode,
  DockerImageFunction,
  Function,
  FunctionOptions,
} from 'aws-cdk-lib/aws-lambda';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

const { runtimeConfigKey } = JSON.parse(
  readFileSync(
    path.join(
      findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
      'packages/postgres_db/config.json',
    ),
    'utf-8',
  ),
) as { runtimeConfigKey: string };

const migrationBundleDir = path.join(
  findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
  'dist/packages/postgres_db/docker/migration',
);

const createDbUserBundleDir = path.join(
  findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
  'dist/packages/postgres_db/docker/create-db-user',
);

export type PostgresDbProps = Omit<
  AuroraDatabaseProps,
  'databaseName' | 'adminUser' | 'runtimeConfigKey' | 'engine'
>;

/**
 * CDK construct that provisions an Aurora Serverless v2 cluster.
 */
export class PostgresDb extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: PostgresDbProps) {
    super(scope, id, {
      ...props,
      databaseName: 'postgres_db',
      adminUser: 'dbadmin',
      runtimeConfigKey,
      engine: AuroraDatabaseEngines.postgres({}),
    });
  }

  protected override createDbUserHandler(baseProps: FunctionOptions): Function {
    return new DockerImageFunction(this, 'CreateDbUserHandler', {
      ...baseProps,
      code: DockerImageCode.fromImageAsset(createDbUserBundleDir, {
        platform: Platform.LINUX_ARM64,
      }),
    });
  }

  protected override createMigrationHandler(
    baseProps: FunctionOptions,
  ): Function {
    return new DockerImageFunction(this, 'MigrationHandler', {
      ...baseProps,
      code: DockerImageCode.fromImageAsset(migrationBundleDir, {
        platform: Platform.LINUX_ARM64,
      }),
    });
  }
}
