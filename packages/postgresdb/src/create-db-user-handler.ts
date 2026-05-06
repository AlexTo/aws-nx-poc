import type { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { randomBytes } from 'node:crypto';
import { Client, escapeIdentifier } from 'pg';
import { getDatabaseSecret } from './utils.js';

type OnEventResult = {
  PhysicalResourceId: string;
  Data?: Record<string, unknown>;
};

const physicalResourceIdPrefix = 'db-user:';

const resolveDbUser = (physicalResourceId?: string): string =>
  physicalResourceId?.startsWith(physicalResourceIdPrefix)
    ? physicalResourceId.slice(physicalResourceIdPrefix.length)
    : `db_${randomBytes(8).toString('hex')}`;

const ensureDatabaseUser = async (dbUser: string): Promise<void> => {
  const { dbname, username, password, host, port } = await getDatabaseSecret();
  const quotedDbUser = escapeIdentifier(dbUser);
  const quotedDbName = escapeIdentifier(dbname);
  const client = new Client({
    host,
    port,
    database: dbname,
    user: username,
    password,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  await client.connect();

  try {
    await client.query('BEGIN');

    const roleExists = await client.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [dbUser],
    );
    if (roleExists.rowCount === 0) {
      await client.query(`CREATE ROLE ${quotedDbUser} WITH LOGIN;`);
    }

    await client.query(
      `ALTER ROLE ${quotedDbUser} WITH LOGIN;
      GRANT ALL PRIVILEGES ON DATABASE ${quotedDbName} TO ${quotedDbUser};
      GRANT USAGE, CREATE ON SCHEMA public TO ${quotedDbUser};
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${quotedDbUser};
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${quotedDbUser};
      GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${quotedDbUser};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO ${quotedDbUser};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO ${quotedDbUser};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO ${quotedDbUser};
      GRANT rds_iam TO ${quotedDbUser};`,
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
};

export const handler = async (
  event: CloudFormationCustomResourceEvent,
): Promise<OnEventResult> => {
  const dbUser = resolveDbUser(
    'PhysicalResourceId' in event ? event.PhysicalResourceId : undefined,
  );

  if (event.RequestType !== 'Delete') {
    await ensureDatabaseUser(dbUser);
  }

  return {
    PhysicalResourceId: `${physicalResourceIdPrefix}${dbUser}`,
    Data: {
      dbUser,
    },
  };
};
