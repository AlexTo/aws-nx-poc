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

export const getPrisma = async (): Promise<PrismaClient> => {
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
  });

  return new PrismaClient({ adapter });
};
