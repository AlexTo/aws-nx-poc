import * as path from 'path';
import * as url from 'url';
import { readFileSync } from 'fs';
import { Construct } from 'constructs';
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
      'packages/my_sql_db/config.json',
    ),
    'utf-8',
  ),
) as { runtimeConfigKey: string };

export type MySqlDbProps = Omit<
  AuroraDatabaseProps,
  | 'databaseName'
  | 'adminUser'
  | 'createDbUserBundleDir'
  | 'framework'
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
      runtimeConfigKey,
      migrationBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/my_sql_db/docker/migration',
      ),
      createDbUserBundleDir: path.join(
        findWorkspaceRoot(url.fileURLToPath(new URL(import.meta.url))),
        'dist/packages/my_sql_db/docker/create-db-user',
      ),
      framework: 'sqlmodel',
      engine: AuroraDatabaseEngines.mysql({}),
    });
  }
}
