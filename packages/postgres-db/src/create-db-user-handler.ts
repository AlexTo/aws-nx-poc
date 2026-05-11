import type { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { randomBytes } from 'node:crypto';
import { createPool, type PoolConnection } from 'mariadb';
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
  const pool = createPool({
    host,
    port,
    database: dbname,
    user: username,
    password,
    ssl: {
      rejectUnauthorized: true,
    },
    connectionLimit: 1,
    multipleStatements: true,
  });

  const quotedDbName = pool.escapeId(dbname);
  const quotedUser = pool.escape(dbUser);
  const quotedHost = pool.escape('%');

  let connection: PoolConnection | undefined;

  try {
    connection = await pool.getConnection();
    await connection.query(
      [
        `CREATE USER IF NOT EXISTS ${quotedUser}@${quotedHost} IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS'`,
        `ALTER USER ${quotedUser}@${quotedHost} IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS' REQUIRE SSL`,
        `GRANT ALL PRIVILEGES ON ${quotedDbName}.* TO ${quotedUser}@${quotedHost}`,
      ].join(';\n'),
    );
  } finally {
    await connection?.release();
    await pool.end();
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
