import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Signer } from '@aws-sdk/rds-signer';

export const handler = async () => {
  const hostname = process.env.HOSTNAME!;
  const port = process.env.PORT!;
  const database = process.env.DATABASE!;
  const dbUser = process.env.DBUSER!;
  const region = process.env.AWS_REGION!;

  const iamAuthToken = await new Signer({
    hostname,
    port: Number(port),
    region,
    username: dbUser,
  }).getAuthToken();

  const databaseUrl =
    `postgresql://${encodeURIComponent(dbUser)}` +
    `:${encodeURIComponent(iamAuthToken)}` +
    `@${hostname}:${port}/${database}` +
    `?sslaccept=strict`;

  await promisify(execFile)('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: __dirname,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
};
