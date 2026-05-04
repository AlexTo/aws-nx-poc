import * as path from 'path';
import * as url from 'url';
import { Construct } from 'constructs';
import { DB_PACKAGE_NAME } from ':aws-nx-poc/db1';
import {
  AuroraDatabase,
  AuroraDatabaseEngines,
  AuroraDatabaseProps,
} from '../../core/rdb/aurora.js';
import { findWorkspaceRoot } from '../../core/workspace.js';

export type Db1Props = Omit<
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
export class Db1 extends AuroraDatabase {
  constructor(scope: Construct, id: string, props: Db1Props) {
    super(scope, id, {
      ...props,
      databaseName: 'db1',
      adminUser: 'dbadmin',
      runtimeConfigKey: DB_PACKAGE_NAME,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/db1/bundle/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/db1/bundle/create-db-user',
      ),
      engine: AuroraDatabaseEngines.postgres({}),
    });
  }
}
