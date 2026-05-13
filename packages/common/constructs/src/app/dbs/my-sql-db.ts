import * as path from 'path';
import * as url from 'url';
import { Construct } from 'constructs';
import { DB_PACKAGE_NAME } from ':aws-nx-poc/my-sql-db';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

export type MySqlDbProps = Omit<
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
export class MySqlDb extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: MySqlDbProps) {
    super(scope, id, {
      ...props,
      databaseName: 'my_sql_db',
      adminUser: 'dbadmin',
      runtimeConfigKey: DB_PACKAGE_NAME,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/my-sql-db/bundle/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/my-sql-db/bundle/create-db-user',
      ),
      engine: AuroraDatabaseEngines.mysql({}),
    });
  }
}
