import * as path from 'path';
import * as url from 'url';
import { Construct } from 'constructs';
import { DB_PACKAGE_NAME } from ':aws-nx-poc/postgres-db';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

export type PostgresDbProps = Omit<
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
export class PostgresDb extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: PostgresDbProps) {
    super(scope, id, {
      ...props,
      databaseName: 'postgres_db',
      adminUser: 'dbadmin',
      runtimeConfigKey: DB_PACKAGE_NAME,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/postgres-db/bundle/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/postgres-db/bundle/create-db-user',
      ),
      engine: AuroraDatabaseEngines.mysql({}),
    });
  }
}
