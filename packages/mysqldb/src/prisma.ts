import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Signer } from '@aws-sdk/rds-signer';
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

// TODO: IAM tokens expire every 15 minutes, so we implement a workaround by tracking a 10-minute TTL.
// Every 10 minutes, a new IAM token is fetched and the connection pool is recreated.
// This approach works for most request-response cycles under 15 minutes, but may fail in longer-running cases.
// Note: The MySQL library lacks a convenient async password callback (e.g., `password: async () => {}`) like Postgres.
export const PRISMA_TTL_MS = 10 * 60 * 1000;

let prismaClient: PrismaClient | undefined;
let prismaCreatedAt = 0;

const createPrismaClient = async (): Promise<PrismaClient> => {
  if (process.env.SERVE_LOCAL === 'true') {
    const adapter = new PrismaMariaDb({
      host: LOCAL_DB_HOST,
      port: LOCAL_DB_PORT,
      database: LOCAL_DB_NAME,
      user: LOCAL_DB_USER,
      password: LOCAL_DB_PASSWORD,
      allowPublicKeyRetrieval: true,
    });
    return new PrismaClient({ adapter });
  }

  const { hostname, port, database, dbUser, region } =
    await getDatabaseConfig(DB_PACKAGE_NAME);
  const iamAuthToken = await new Signer({
    hostname,
    port,
    region,
    username: dbUser,
  }).getAuthToken();

  const adapter = new PrismaMariaDb({
    host: hostname,
    port,
    database,
    user: dbUser,
    password: iamAuthToken,
    ssl: {
      rejectUnauthorized: true,
    },
    minimumIdle: 0,
    idleTimeout: 1,
  });

  return new PrismaClient({ adapter });
};

export const getPrisma = async (): Promise<PrismaClient> => {
  const now = Date.now();

  if (prismaClient && now - prismaCreatedAt < PRISMA_TTL_MS) {
    return prismaClient;
  }

  prismaClient = await createPrismaClient();
  prismaCreatedAt = now;

  return prismaClient;
};
