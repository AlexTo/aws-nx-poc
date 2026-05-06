import { PrismaPg } from '@prisma/adapter-pg';
import { Signer } from '@aws-sdk/rds-signer';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';
import {
  DB_PACKAGE_NAME,
  LOCAL_DB_HOST,
  LOCAL_DB_NAME,
  LOCAL_DB_PASSWORD,
  LOCAL_DB_PORT,
  LOCAL_DB_USER,
} from './constants.js';
import { getDatabaseConfig } from './utils.js';

let prismaPromise: Promise<PrismaClient> | undefined;

export const getPrisma = (): Promise<PrismaClient> => {
  prismaPromise ??= (async () => {
    if (process.env.SERVE_LOCAL === 'true') {
      const adapter = new PrismaPg(
        new Pool({
          host: LOCAL_DB_HOST,
          port: LOCAL_DB_PORT,
          database: LOCAL_DB_NAME,
          user: LOCAL_DB_USER,
          password: LOCAL_DB_PASSWORD,
          allowExitOnIdle: true,
        }),
      );
      return new PrismaClient({ adapter });
    }

    const { hostname, port, database, dbUser, region } =
      await getDatabaseConfig(DB_PACKAGE_NAME);
    const adapter = new PrismaPg(
      new Pool({
        host: hostname,
        port,
        database,
        user: dbUser,
        ssl: {
          rejectUnauthorized: true,
        },
        allowExitOnIdle: true,
        password: async () => {
          const token = await new Signer({
            hostname,
            port,
            region,
            username: dbUser,
          }).getAuthToken();
          return token;
        },
      }),
    );

    return new PrismaClient({ adapter });
  })();

  return prismaPromise;
};
