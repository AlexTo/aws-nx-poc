import * as path from 'path';
import * as url from 'url';
import { Construct } from 'constructs';
import { DB_PACKAGE_NAME } from ':aws-nx-poc/mysqldb';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

export type MysqldbProps = Omit<
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
export class Mysqldb extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: MysqldbProps) {
    super(scope, id, {
      ...props,
      databaseName: 'mysqldb',
      adminUser: 'dbadmin',
      runtimeConfigKey: DB_PACKAGE_NAME,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/mysqldb/bundle/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/mysqldb/bundle/create-db-user',
      ),
      engine: AuroraDatabaseEngines.mysql({}),
    });
  }
}
