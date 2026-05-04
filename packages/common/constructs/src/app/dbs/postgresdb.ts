import * as path from 'path';
import * as url from 'url';
import { Construct } from 'constructs';
import { DB_PACKAGE_NAME } from ':aws-nx-poc/postgresdb';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

export type PostgresdbProps = Omit<
  AuroraDatabaseProps,
  | 'databaseName'
  | 'adminUser'
  | 'createDbUserBundleDir'
  | 'engine'
  | 'runtimeConfigKey'
  | 'migrationBundleDir'
>;

/**
 * CDK construct that provisions an Aurora Serverless v2 cluster.
 */
export class Postgresdb extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: PostgresdbProps) {
    super(scope, id, {
      ...props,
      databaseName: 'postgresdb',
      adminUser: 'dbadmin',
      runtimeConfigKey: DB_PACKAGE_NAME,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/postgresdb/bundle/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/postgresdb/bundle/create-db-user',
      ),
      engine: AuroraDatabaseEngines.postgres({}),
    });
  }
}
